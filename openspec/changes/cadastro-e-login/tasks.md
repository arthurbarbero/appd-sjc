# Tasks: Conta, senha e sessão

- Deriva de: SPEC-cadastro-e-login (v2, 2026-08-06)
- **Pré-requisito duro:** a change `modelo-de-dados` precisa estar fechada. Nenhuma task
  daqui cria tabela ou coluna.
- Cada tarefa tem dono, o que entrega e o critério que diz "pronto". Tarefa sem critério
  não entra aqui.
- **Nenhuma tarefa de tela começa antes de o design dela estar aprovado no Claude
  Design** (regra central do `CLAUDE.md`) — vale para T-7 e parte de T-9.
- Papéis: **Dono** = Arthur Barbero · **Arquiteto** e **Dev** = Claude Code sob revisão
  do dono · **QA** = validação contra os cenários da spec · **APPD** = a associação.

## T-0 — Destravar as decisões abertas (antes de qualquer código)

| #     | O que decidir                                                          | Dono |
| ----- | ---------------------------------------------------------------------- | ---- |
| T-0.1 | Q-1: as mensagens de e-mail já cadastrado revelam a conta? (risco R-6) | Dono |
| T-0.3 | Q-2: **prazo de retenção** do que a APPD mantém após a exclusão        | APPD |
| T-0.4 | R-1: caminho de custo zero para e-mail ou SMS de redefinição de senha  | Dono |

Resolvidas e fora da tabela: **T-0.2** (contador em D1, chave em HMAC — REQ-26b) e
**T-0.5** (ADR-013 deu a área para `area-do-associado`).

**Aceite**: T-0.1 vira ADR numerado com dono, data e alternativas — e vale para as
**três** portas de vazamento de uma vez, não só a do cadastro. T-0.3 vira texto no bloco
"O que a associação precisa manter" ou continua `[A CONFIRMAR]` em
`docs/pendencias-appd.md`. T-0.4 vira decisão escrita, ainda que seja "segue bloqueado";
com o ADR-012, toda pessoa passa a ter senha, então o volume de esquecimento agora é
proporcional ao cadastro inteiro.

**Trava**: T-0.1 bloqueia o texto final de T-5 e os cenários marcados
`[condicional a Q-1]`. T-0.3 bloqueia a exibição do prazo na tela de exclusão, que é de
`area-do-associado`. **T-0.4 bloqueia o login ir ao ar**, não só o T-9.2.

## T-1 — Fixar e medir os parâmetros do scrypt (REQ-6, REQ-7, REQ-27)

Dono: Arquiteto. Depende de: nada.

Medir `scrypt` com pelo menos três combinações de `N`, `r` e `p` rodando em
`wrangler dev` (workerd real, não o dev server do Nuxt), 50 execuções cada, e escolher a
mais cara que ainda caiba no orçamento de CPU. Medir junto o `<limite_ms>` do REQ-27.

**Aceite**: existe `docs/adr/adr-005-parametros-do-scrypt.md` com os valores escolhidos,
a tabela de medições, o método e o gatilho de revisão. O p95 do hash fica em no máximo
50 ms. Os valores vivem em constante única do código, e cada hash grava a versão dos
parâmetros usada. **Sai daqui também o `<limite_ms>` do REQ-27, com a política de
retentativa** — sem ela o teste de tempo é instável por construção e será desligado.

## T-2 — Tabela `usuarios` (movida para `modelo-de-dados`)

**Status**: não existe mais aqui (ADR-013). O que resta é conferir, antes da T-3, que
`usuarios` existe no banco local com `email` e `cpf` UNIQUE, `numero_registro` UNIQUE e
o `CHECK` de `situacao`.

**Aceite**: os testes de restrição de `modelo-de-dados` T3.1 passam.

## T-3 — Geração do número de registro (REQ-2 a REQ-5)

Dono: Dev. Depende de: T-2.

Estender `shared/utils/registro.ts` com a regra de geração (hoje ele só formata) e a
nova tentativa sob colisão. Corrigir o comentário do arquivo, que aponta a change errada.

**Aceite**: passam os cenários "Cadastro concluído gera número de registro no formato
exigido", "Dois cadastros simultâneos não recebem o mesmo número de registro" e
"Sequencial reinicia no primeiro cadastro do ano seguinte". O teste de concorrência falha
se a restrição de unicidade for removida do schema — se não falhar, o teste não está
provando nada.

## T-4 — Sessão em cookie selado (REQ-11 a REQ-15)

Dono: Dev. Depende de: nada. **Contém risco**: `nuxt-auth-utils` ainda não foi provado
no workerd.

Verificar primeiro, em timebox de 30 minutos, que a biblioteca funciona sob
`nodejs_compat`. Se não funcionar, parar e escalar para o arquiteto — é gatilho de
revisão do ADR-002, não de improviso.

**Aceite**: passam os cenários de cookie (atributos, conteúdo selado sem dado pessoal),
"Cookie adulterado é tratado igual a cookie ausente", "API protegida responde 401 sem
sessão" e "A aplicação não sobe sem a chave de sessão". `.dev.vars.example` continua com
valor vazio e o gitleaks segue verde.

## T-5 — Serviço de criação de conta (REQ-16 a REQ-23)

Dono: Dev. Depende de: T-1, T-3, T-0.1.

Função de domínio que `formulario-atendimento` chama dentro da transação dele: valida com
o schema Zod compartilhado, faz o hash da senha, emite o número e grava a linha. **Não é
rota, não é tela** — a tela é de lá (ADR-012). `/cadastro`, se existir, é 301 para
`/atendimento/inscricao`.

**Aceite**: passam os cenários da funcionalidade "Criação da conta", inclusive
"A criação de conta não pede nem aceita foto". A varredura de log fica com a T-13.

## T-6 — Tela de cadastro (movida para `formulario-atendimento`)

**Status**: não existe mais aqui (ADR-012). A tela que cria a conta é
`/atendimento/inscricao`, com os 15 campos mais e-mail, CPF e senha.

## T-7 — Login e limite de tentativas (REQ-24 a REQ-27)

Dono: Dev. Depende de: T-4, T-5. **Exige o design de `/entrar` aprovado (R-7).**

**Aceite**: passam os cenários de mensagem única (senha errada e e-mail inexistente com
mesmo status, mesmo corpo e mesmo tempo), de bloqueio na sexta tentativa, de contador
zerado no acerto e de bloqueio que expira sozinho. **E o cenário do B13**: cinco
tentativas com e-mail inexistente produzem o mesmo bloqueio, byte a byte, que cinco com
e-mail existente. A chave do contador está em HMAC, nunca em texto claro. Um teste
compara as duas medianas de tempo contra o `<limite_ms>` definido em T-1, com a política
de retentativa daquela task.

## T-8 — Logout e guarda de rota (REQ-13, REQ-14, REQ-30)

Dono: Dev. Depende de: T-4.

Entrega o **middleware único** de `/area/*`, usado pelas rotas de `area-do-associado` e
de `cracha-do-associado`. Nenhuma das duas implementa verificação própria.

**Aceite**: passam "Logout apaga a sessão", "Sessão expirada leva para entrar,
explicando", "Rota da área sem sessão é recusada no servidor" e "A guarda é uma só, para
as rotas das duas changes donas". Remover o link do menu no cliente não dá acesso a
`/area`. A área diz, sem prometer o contrário, que sair não derruba a sessão de outro
aparelho.

## T-9 — Recuperação de senha (REQ-28, REQ-29)

Dono: Dev (caminho humano) · Dono do projeto (destravar R-1).

Duas partes, e só a primeira é executável agora:

- **T-9.1 — caminho humano**: o telefone da secretaria no corpo de toda tela de falha de
  entrada e na tela de recuperação, com o texto que diz que a secretaria refaz a senha.
- **T-9.2 — fluxo por e-mail**: **não começa** enquanto R-1 estiver aberto. Quando
  liberar: token aleatório de uso único, validade de 1 hora, guardado como hash,
  confirmação com a redação genérica.

**Aceite de T-9.1**: passam "O caminho humano aparece em toda falha de entrada" e "O
fluxo por e-mail não é publicado enquanto o risco R-1 estiver aberto". Nenhuma tela
promete e-mail enviado. **Aceite de T-9.2**: os dois cenários marcados `[condicional a
R-1]`.

## T-10 e T-11 — Área do associado e exclusão (movidas)

**Status**: não existem mais aqui (ADR-013). `/area`, `/area/dados`, `/area/inscricoes` e
`/area/excluir` são de `area-do-associado`; `/area/cracha` é de `cracha-do-associado`.

O que sobrou desta change no assunto está na T-8 (guarda de rota) e no REQ-32 (efeitos da
exclusão sobre sessão, login e `numero_registro`), verificado pelos cenários de "Guarda
de rota e efeitos da exclusão".

## T-12 — Acessibilidade verificada (REQ-36, REQ-37)

Dono: Dev + QA. Depende de: T-6, T-8, T-10, T-11.

axe automatizado em cada rota e em cada estado, mais uma passada manual só de teclado e
uma verificação de alvo de toque em viewport de 360px.

**Aceite**: zero violação de nível A e AA no axe; os seis cenários da funcionalidade
"Acessibilidade" passam; a verificação entra na suíte do `npm test` e é **bloqueante** no
CI, não um relatório informativo.

## T-13 — Segurança conferida antes do gate

Dono: QA. Depende de: T-5, T-7, T-8, T-11.

Checagem explícita, item a item: senha, hash e sal ausentes de log, resposta, URL e
telemetria (REQ-10); `NUXT_SESSION_PASSWORD` fora do repo e ausente de qualquer log
(REQ-15); número de registro imutável, inclusive contra requisição forjada (REQ-3);
limite de tentativas ativo (REQ-26); gitleaks verde no histórico inteiro; nenhum dado de
pessoa real em seed, fixture ou teste.

**Aceite**: relatório com um veredito por item, todos aprovados. Um item reprovado
segura a change inteira.

## T-14 — Acertar os documentos que esta change desatualiza

Dono: Dev. Depende de: nada. Pode ser feita já.

- `openspec/README.md`: a change 6 (`area-do-associado`) foi absorvida por esta —
  registrar, para a lista não ficar com uma change fantasma.
- `shared/utils/registro.ts`: o comentário diz que a spec do número nasce em
  `cracha-do-associado`. Nasce aqui; lá fica a exibição.
- `PROGRESS.md`, seção "Dívidas conscientes": mesma correção.
- `PROGRESS.md`, "Em aberto": ligar os itens de scrypt e de e-mail a esta change,
  a T-1 e ao risco R-1.
- `server/database/schema.ts`: o comentário já prevê `usuarios` nesta change; conferir
  que continua verdadeiro depois de T-2.

**Aceite**: nenhum documento do repo aponta para a change errada; `prettier --check`
passa.

## T-15 — Gate de validação e arquivamento

Dono: QA + Dono. Depende de: todas as anteriores.

**Aceite**: cada cenário da spec com veredito passou/falhou registrado; nenhum cenário
sem veredito; os bloqueios da seção "Definition of Ready" fechados ou explicitamente
reabertos como risco aceito com dono e data; `PROGRESS.md` atualizado. Só então a pasta
move de `openspec/changes/` para `openspec/archive/`.

---

## Sequência sugerida

```
[modelo-de-dados fechada]
  └─ T-0 e T-14 (podem ir já)
       └─ T-1 ─┬─ T-3 ─┐
               │       ├─ T-5 ─┬─ T-7 ─┐
               └─ T-4 ─┘       └─ T-8 ─┼─ T-9.1
                                       ├─ T-12 ─ T-13 ─ T-15
   [R-1 resolvido] ────────── T-9.2 ───┘
```

**Caminho crítico**: `modelo-de-dados` → T-1 → T-3 → T-5 → T-7. **O que realmente segura
a entrega não é código, é decisão**: o contrato de dados, o T-0 e o design de `/entrar`
(R-7). Com as telas de cadastro e de área fora daqui (ADR-012 e ADR-013), esta change
ficou bem menor — e o R-1 subiu de importância, porque agora toda pessoa tem senha.
