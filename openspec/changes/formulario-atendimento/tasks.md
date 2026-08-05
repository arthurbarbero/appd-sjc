# Tasks: Formulário de Atendimento

- Deriva de: SPEC-formulario-atendimento (v1, 2026-08-05)
- Dono padrão da execução: Claude Code · Dono das decisões: Arthur Barbero
- Regra do fatiamento: cada fatia entrega valor verificável de ponta a ponta e fecha com
  aceite próprio. Fatia sem aceite não entra.

## Ordem e dependências

```
T0 (gate) ──> T1 ──> T2 ──> T3 ──> T5 ──> T6 ──> T7 ──> T9 ──> T10
                       └──> T4 ──┘        T8 ──┘
```

T4 e T8 podem correr em paralelo com T5/T6. T9 é o gate de publicação e depende de
change de fora.

---

## T0 — Assinar as três decisões (bloqueia tudo)

- **Dono:** Arthur Barbero (Claude Code rascunha os ADRs)
- **O que:** transformar D3, D4 e D5 da spec em `docs/adr/adr-003`, `adr-004` e
  `adr-005`, no formato dos ADRs existentes.
- **Por que primeiro:** D3 muda o texto do protocolo na confirmação (`APPD-` → `ATD-`)
  em relação ao mock aprovado. Codar antes de assinar é retrabalho garantido.
- **Aceite:** os três arquivos existem, com status Aceito, data e decisor; a spec passa
  para o status "APROVADA"; o `PROGRESS.md` registra a decisão do prefixo.

## T1 — Tabela e migration

- **Dono:** Claude Code
- **O que:** `inscricoes_atendimento` e `envios_recentes` em
  `server/database/schema.ts`, com as colunas e restrições da seção "Modelo de dados";
  `npm run db:generate`; aplicar com `npm run db:aplicar:local`.
- **Cobre:** REQ-1, REQ-2, REQ-3, REQ-4 (estrutura).
- **Aceite:**
  - migration versionada existe em `drizzle/migrations` e está commitada;
  - `db:aplicar:local` roda do zero num banco limpo sem erro;
  - `protocolo` e `chave_idempotencia` são UNIQUE; existe índice em
    (`ip_hash`, `criado_em`);
  - nenhuma coluna guarda IP em texto claro;
  - `server/database/schema.ts` deixa de exportar vazio e o comentário de topo aponta
    para esta change.

## T2 — Schema Zod compartilhado

- **Dono:** Claude Code
- **O que:** `shared/validacao/inscricao.ts` com o esquema estrito, as listas oficiais de
  opções, as mensagens em pt-BR e o tipo inferido. Normalização de telefone (só dígitos)
  e de data (`aaaa-mm-dd`) dentro do próprio esquema.
- **Cobre:** REQ-8 a REQ-18, REQ-41.
- **Aceite:** testes unitários Vitest em `test/` verdes para os cenários das
  funcionalidades "Data de nascimento", "Telefone e máscara" (parte de validação),
  "Múltipla escolha e Outro" e "O servidor não confia no cliente"; nenhuma regra de
  validação duplicada fora deste arquivo (verificado por busca); listas de opções batem
  caractere a caractere com `docs/campos-formulario.md`.

## T3 — Rota de servidor, protocolo e idempotência

- **Dono:** Claude Code
- **O que:** `server/api/atendimento/inscricao.post.ts` — revalida com o esquema de T2,
  grava, calcula o protocolo a partir do `id`, marca `possivel_duplicata`, trata chave
  repetida, 405, 413, 422, 429, 500.
- **Cobre:** REQ-5 a REQ-7, REQ-9 a REQ-13, REQ-19 a REQ-26, REQ-39 a REQ-45, REQ-53.
- **Aceite:** testes de integração verdes para as funcionalidades "Envio da inscrição",
  "Envio duplicado" e "O servidor não confia no cliente"; envio duplicado com a mesma
  chave devolve 200 e mantém 1 linha; nenhum conteúdo de campo aparece em log; resposta
  de erro sem stack trace.

## T4 — Guarda anti-abuso

- **Dono:** Claude Code
- **O que:** HMAC-SHA-256 do IP com segredo de ambiente, contagem por hora, limpeza das
  linhas com mais de 1 hora, limite de 16 KB de payload.
- **Cobre:** REQ-4, REQ-19 (413), REQ-22 (429).
- **Aceite:** cenários da funcionalidade "Limite de envios e falhas de infraestrutura"
  verdes; `.dev.vars.example` ganha a chave nova **com valor vazio** (regra do gitleaks
  já aprendida no projeto); nenhum segredo versionado; a mensagem de 429 oferece o
  telefone da sede.

## T5 — Ligar a tela ao servidor sem perder resposta

- **Dono:** Claude Code
- **O que:** em `app/pages/atendimento/inscricao.vue`: chave de idempotência no
  carregamento, envio por `$fetch`, estado "enviando", tratamento de 200/201/422/429/500
  e falha de rede, aviso ao sair com formulário preenchido, remoção do aviso de
  demonstração.
- **Cobre:** REQ-27 a REQ-31, REQ-38, D6.
- **Aceite:** cenários da funcionalidade "Erro nunca apaga resposta" verdes, inclusive o
  de 422 do servidor e o de falha de rede; nenhum recarregamento de página no envio; o
  botão fica desabilitado com "Enviando…" e o clique duplo gera 1 linha só.

## T6 — Confirmação com protocolo

- **Dono:** Claude Code · **conteúdo do prazo:** APPD-SJC
- **O que:** tela de sucesso com protocolo em destaque, o que acontece agora, canal,
  prazo vindo de constante em `shared/conteudo.ts`, e o que fazer se o telefone mudar.
- **Cobre:** REQ-32, REQ-33.
- **Aceite:** cenários "A confirmação diz o que acontece..." e "Nenhum prazo é
  inventado" verdes; nenhum número de dias/semanas aparece na tela enquanto a APPD não
  responder; o telefone exibido é o que a pessoa digitou.

## T7 — Acessibilidade verificada

- **Dono:** Claude Code · **veto:** validador (QA)
- **O que:** conferir e corrigir `fieldset`/`legend`, `aria-describedby`, `aria-invalid`,
  foco no resumo de erro, alvos de 44 px, ordem de foco, calendário por teclado,
  `prefers-reduced-motion`.
- **Cobre:** REQ-29, REQ-46 a REQ-52.
- **Aceite:** os 7 cenários da funcionalidade "Acessibilidade do formulário" verdes; axe
  sem violação A/AA nos quatro estados em 360 px e 1280 px; percurso completo só por
  teclado, gravado no relatório de validação.

## T8 — Conteúdo obrigatório e conferência da réplica fiel

- **Dono:** Claude Code · **veredito de conteúdo:** Arthur Barbero
- **O que:** conferir rótulo a rótulo contra `docs/campos-formulario.md`; garantir a
  ocorrência única do valor; texto de não-prioridade ao lado do campo 15; ajuda do campo
  13 orientando o `Outro` para os quatro projetos.
- **Cobre:** REQ-34 a REQ-37, D1.
- **Aceite:** teste automatizado que conta a ocorrência de "R$ 50" na página renderizada
  e falha se for diferente de 1; checklist dos 15 rótulos assinado item a item; nenhuma
  opção acrescentada ou removida.

## T9 — Gate de publicação (depende de outras changes)

- **Dono:** Arthur Barbero
- **O que:** verificar as três travas antes de qualquer deploy com dado real.
- **Aceite:**
  - `consentimento-e-privacidade` entregou a constante de versão do termo e a página de
    política (REQ-40);
  - a APPD respondeu **quem lê as inscrições** enquanto `painel-admin` não existe
    (risco R1);
  - `docs/pendencias-appd.md` atualizado com o que esta change descobriu ou confirmou.
  - Enquanto qualquer item estiver aberto: roda em local com dado fictício, e só.

## T10 — Validação e arquivamento

- **Dono:** validador (QA), com o dono assinando o veredito
- **O que:** rodar os 43 cenários da spec item a item, `npm run lint`,
  `npm run typecheck`, `npm test`, `npx prettier --check .`.
- **Aceite:** relatório de validação com passou/falhou por cenário, sem "parcial";
  `PROGRESS.md` atualizado (decisões, dívidas, próximos passos); a pasta
  `openspec/changes/formulario-atendimento/` move para `openspec/archive/`.

---

## Fora destas tasks (para não voltar como scope creep)

Salvamento parcial, conta de usuário e `usuario_id`, painel de leitura, consulta e
edição da inscrição pela pessoa, e-mail ou WhatsApp de confirmação, inclusão dos quatro
projetos no campo 13, e qualquer alteração de rótulo, ordem ou obrigatoriedade dos 15
campos.
