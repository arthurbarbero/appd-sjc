# OpenSpec — appd-sjc

Rito de spec do projeto (skill `fluxo-spec`, régua nível Grande).

- `changes/<slug>/` — mudança em andamento: `proposal.md`, `spec.md`, `tasks.md`.
  Critérios de aceite em Gherkin, incluindo os de acessibilidade WCAG 2.2 AA.
- `archive/<slug>/` — mudança concluída e aprovada no gate de validação.

Nada vira código antes de existir a change correspondente aqui — e, para tela,
antes do design aprovado no Claude Design.

## Estado das changes — 2026-08-07

**Arquivadas** (`archive/`): `modelo-de-dados`, `revisao-de-interface`.

**Abertas** (`changes/`), todas com a spec **APROVADA** na forma pelo gate de 2026-08-07:

| Change                        | O que falta                                                               |
| ----------------------------- | ------------------------------------------------------------------------- |
| `site-institucional`          | 17 tasks: medição de peso e CLS, 301 das URLs antigas, sitemap, robots    |
| `cadastro-e-login`            | percorrer os cenários; redefinição de senha depende de e-mail gratuito    |
| `formulario-atendimento`      | percorrer os cenários; foto opcional do campo 16 não foi implementada     |
| `area-do-associado`           | Fatias 1, 2, 5 e 6 sem veredito; Fatia 4 espera resposta jurídica da APPD |
| `cracha-do-associado`         | Fatia 2 livre; fatias 3 a 5 esperam o design de `/verificar`              |
| `consentimento-e-privacidade` | T4 destravada pelo ADR-006; telas esperam o canvas; archive espera a APPD |

`painel-admin` foi adiada para a V1.1 (ADR-014).

Detalhe por change em [`PARECER-GATE-AUTOMATICO.md`](PARECER-GATE-AUTOMATICO.md); o
histórico de como o rito se perdeu e voltou, em [`ESTADO.md`](ESTADO.md).
