# Tasks: Cadastro, login e área do associado

- Deriva de: SPEC-cadastro-e-login (v1, 2026-08-05)
- Cada tarefa tem dono, o que entrega e o critério que diz "pronto". Tarefa sem critério
  não entra aqui.
- **Nenhuma tarefa de tela começa antes de o design dela estar aprovado no Claude
  Design** (regra central do `CLAUDE.md`) — vale para T-6, T-10, T-11 e parte de T-9.
- Papéis: **Dono** = Arthur Barbero · **Arquiteto** e **Dev** = Claude Code sob revisão
  do dono · **QA** = validação contra os cenários da spec · **APPD** = a associação.

## T-0 — Destravar as decisões abertas (antes de qualquer código)

| #     | O que decidir                                                            | Dono      |
| ----- | ------------------------------------------------------------------------ | --------- |
| T-0.1 | Q-1: o cadastro revela que o e-mail já tem conta? (risco R-6)            | Dono      |
| T-0.2 | Q-3: contador de tentativas em coluna de `usuarios` ou tabela separada   | Arquiteto |
| T-0.3 | Q-2: o que a APPD é obrigada a reter após a exclusão, e por quanto tempo | APPD      |
| T-0.4 | R-1: há caminho de custo zero para envio de e-mail? Se não, segue R-1    | Dono      |
| T-0.5 | R-8: quem é dona da área — esta change ou `area-do-associado`?           | Coord.    |

**Aceite**: T-0.1 e T-0.2 viram ADR numerado em `docs/adr/` com dono, data e
alternativas. T-0.3 vira texto no bloco "O que a associação precisa manter" ou continua
`[A CONFIRMAR]` registrado em `docs/pendencias-appd.md`. T-0.4 vira decisão escrita, ainda
que a decisão seja "segue bloqueado".

**Trava**: T-0.2 bloqueia T-7. T-0.3 bloqueia a ida de T-11 para produção. T-0.1
bloqueia o texto final de T-5. **T-0.5 bloqueia T-10 e T-11 por inteiro** — enquanto
duas changes reivindicarem as mesmas rotas de `/area`, implementar é escolher um contrato
no escuro. Aceite de T-0.5: uma das duas pastas deixa de reivindicar a área, e o
`openspec/README.md` reflete a decisão.

## T-1 — Fixar e medir os parâmetros do scrypt (REQ-6, REQ-7, REQ-27)

Dono: Arquiteto. Depende de: nada.

Medir `scrypt` com pelo menos três combinações de `N`, `r` e `p` rodando em
`wrangler dev` (workerd real, não o dev server do Nuxt), 50 execuções cada, e escolher a
mais cara que ainda caiba no orçamento de CPU. Medir junto o `<limite_ms>` do REQ-27.

**Aceite**: existe `docs/adr/adr-003-parametros-do-scrypt.md` com os valores escolhidos,
a tabela de medições, o método e o gatilho de revisão. O p95 do hash fica em no máximo
50 ms. Os valores vivem em constante única do código, e cada hash grava a versão dos
parâmetros usada.

## T-2 — Tabela `usuarios` e migration versionada (REQ-1)

Dono: Dev. Depende de: T-0.2 (colunas do contador), T-1 (colunas dos parâmetros).

**Aceite**: `server/database/schema.ts` define `usuarios` com índice único de e-mail e
restrição de unicidade do `numero_registro`; `npm run db:generate` produz a migration em
`drizzle/migrations`; `npm run db:aplicar:local` aplica sem erro; nenhum `push` direto foi
usado; `npm run typecheck` passa.

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

## T-5 — Cadastro no servidor (REQ-16 a REQ-23)

Dono: Dev. Depende de: T-1, T-2, T-3, T-0.1.

Schema Zod único em `shared/`, usado por cliente e servidor; hash da senha; gravação do
aceite com versão e data/hora; foto opcional atrás da interface `ArmazenamentoFoto`.

**Aceite**: passam todos os cenários da funcionalidade "Cadastro de conta", inclusive
"API de cadastro recusa o que a tela recusaria". Uma varredura no log de um cadastro
completo não encontra senha, hash nem sal (REQ-10).

## T-6 — Tela de cadastro (REQ-16 a REQ-23, REQ-36, REQ-37)

Dono: Dev. **Bloqueada por R-7**: exige o design de `/cadastro` gerado e aprovado no
Claude Design, a partir de `docs/prompts-design/cadastro.md`.

**Aceite**: os quatro estados do prompt existem (vazio, erro, enviando, sucesso); o
estado de erro preserva todas as respostas, inclusive a foto; os requisitos da senha
aparecem no estado vazio; não existe campo de confirmar senha nem botão de login social;
a tela de sucesso não promete e-mail. Aceite visual do prompt de design conferido item a
item.

## T-7 — Login e limite de tentativas (REQ-24 a REQ-27)

Dono: Dev. Depende de: T-4, T-5, T-0.2.

**Aceite**: passam os cenários de mensagem única (senha errada e e-mail inexistente com
mesmo status, mesmo corpo e mesmo tempo), de bloqueio na sexta tentativa, de contador
zerado no acerto e de bloqueio que expira sozinho. Um teste compara as duas medianas de
tempo contra o `<limite_ms>` definido em T-1.

## T-8 — Logout e guarda de rota (REQ-13, REQ-14)

Dono: Dev. Depende de: T-4.

**Aceite**: passam os cenários "Logout apaga a sessão" e "Sessão expirada leva para
entrar, explicando". A guarda é verificada no servidor: remover o link do menu no cliente
não dá acesso a `/area`. A área diz, sem prometer o contrário, que sair não derruba a
sessão de outro aparelho.

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

## T-10 — Área do associado (REQ-30 a REQ-33)

Dono: Dev. **Bloqueada por R-7**: exige o design de `/area` aprovado, a partir de
`docs/prompts-design/area-do-associado.md`.

Painel mais `/area/dados`, `/area/inscricoes` e `/area/cracha`. As inscrições ficam atrás
de uma função de domínio única que hoje devolve lista vazia — é o ponto de encaixe da
change `formulario-atendimento`.

**Aceite**: passam os cinco cenários de "Área do associado". Nenhuma tela exibe tipo de
deficiência. A troca da função de inscrições por uma consulta real não exige mudar a
tela.

## T-11 — Exclusão de conta (REQ-34, REQ-35)

Dono: Dev. **Bloqueada por R-7 e por T-0.3.** Não vai para produção sem a resposta de
Q-2.

**Aceite**: passam os cinco cenários de "Exclusão de conta". A página é própria, não
modal; as duas caixas nascem desmarcadas; não há palavra para digitar; a ação preenchida
é "Cancelar e voltar"; o botão destrutivo é contornado; o número de registro sobrevive à
exclusão e não é reutilizado.

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
T-0 e T-14 (podem ir já)
  └─ T-1 ─┬─ T-2 ─ T-3 ─┐
          │             ├─ T-5 ─┬─ T-7 ─┐
          └─ T-4 ───────┘       └─ T-8 ─┤
                                        ├─ T-9.1
   [design aprovado] ── T-6, T-10, T-11 ┤
                                        ├─ T-12 ─ T-13 ─ T-15
   [R-1 resolvido] ──────────── T-9.2 ──┘
```

**Caminho crítico**: T-1 → T-2 → T-3 → T-5 → T-7. **O que realmente segura a entrega
não é código, é decisão**: T-0 e o design aprovado (R-7). Enquanto os dois não andarem,
metade das tarefas não pode começar, por mais que a fundação esteja pronta.
