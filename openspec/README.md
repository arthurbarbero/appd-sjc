# OpenSpec — appd-sjc

Rito de spec do projeto (skill `fluxo-spec`, régua nível Grande).

- `changes/<slug>/` — mudança em andamento: `proposal.md`, `spec.md`, `tasks.md`.
  Critérios de aceite em Gherkin, incluindo os de acessibilidade WCAG 2.2 AA.
- `archive/<slug>/` — mudança concluída e aprovada no gate de validação.

Nada vira código antes de existir a change correspondente aqui — e, para tela,
antes do design aprovado no Claude Design.

## Estado das changes — 2026-08-21

**Arquivadas** (`archive/`): `modelo-de-dados`, `revisao-de-interface`,
`cracha-do-associado`, `area-do-associado` e `cadastro-e-login` — as três últimas com os
cenários validados item a item, em `VALIDACAO.md` dentro de cada pasta.

**Abertas** (`changes/`), todas com a spec **APROVADA** na forma pelo gate de 2026-08-07:

| Change                        | O que falta                                                               |
| ----------------------------- | ------------------------------------------------------------------------- |
| `site-institucional`          | 15 tasks: medição de peso e CLS, 301 das URLs antigas, sitemap, robots    |
| `formulario-atendimento`      | 8 das 10 tasks fechadas; T9 e T10 esperam o catálogo completo de termos   |
| `consentimento-e-privacidade` | T4 destravada pelo ADR-006; telas esperam o canvas; archive espera a APPD |
| `cracha-impresso`             | proposal escrito; três decisões do dono antes da spec                     |

**`acabamento-de-interface` foi arquivada em 2026-08-21**, com `VALIDACAO.md` item a item.
Nasceu de uma revisão do dono em vídeo — 30 apontamentos em doze telas, e boa parte deles
era uma regra de largura mal escopada aparecendo em sete lugares. Foi a primeira change
cujas telas **não** passaram pelo Claude Design: liberação do dono, com axe A/AA em três
larguras e conferência de teclado no lugar do gate de design.

**`cracha-impresso` é a próxima**, e tem proposal esperando três decisões do dono. Ela saiu
da anterior quando a foto do cartão físico mostrou que o pedido — frente e verso lado a
lado — vinha acompanhado de cinco campos que o modelo não tem e de uma frente que imprime
CID e CPF, contra o que a nossa própria tela promete.

**`painel-administrativo` é a próxima change**: gerência de usuários e troca de senha,
puxada para a V1 pelo dono em 2026-08-07 (ADR-016, que supersede em parte o ADR-014). Ela
herda a T2.5 do crachá — a métrica de ocupação, que espera o perfil de operador existir.

Detalhe por change em [`PARECER-GATE-AUTOMATICO.md`](PARECER-GATE-AUTOMATICO.md); o
histórico de como o rito se perdeu e voltou, em [`ESTADO.md`](ESTADO.md).
