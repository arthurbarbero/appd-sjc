# Estado real das changes — 2026-08-07

Documento de reconciliação. Existe porque em **2026-08-06 o rito foi abandonado**: escrevi
schema, migration, três rotas de API, quatro telas, dois ADRs e a infraestrutura de
publicação **sem abrir change nenhuma**, sem marcar task e sem arquivar nada. O
`openspec/` passou o dia descrevendo um projeto diferente do que estava no disco.

Quem apontou foi o dono. Estava certo, e a correção não é escrever mais documento — é
esta tabela dizer a verdade e as tasks voltarem a ser marcadas na hora.

## O que está implementado, e sob qual change deveria ter sido

| Entregue em 2026-08-06                           | Change dona              | Task correspondente | Estava marcada? |
| ------------------------------------------------ | ------------------------ | ------------------- | --------------- |
| Schema com as 5 tabelas + migrations 0000 a 0002 | `modelo-de-dados`        | T1, T2              | sim             |
| 45 testes de restrição e de schema Zod           | `modelo-de-dados`        | T3.1, T3.3          | sim             |
| Derivação de senha em duas etapas                | `cadastro-e-login`       | T-1, T-5            | **não**         |
| Emissor do `numero_registro`                     | `cadastro-e-login`       | T-3                 | **não**         |
| Sessão em cookie selado                          | `cadastro-e-login`       | T-4                 | **não**         |
| `/api/conta/entrar`, `/sair`                     | `cadastro-e-login`       | T-7, T-8            | **não**         |
| Guarda de rota de `/area/*`                      | `cadastro-e-login`       | T-8                 | **não**         |
| Tela `/entrar`                                   | `cadastro-e-login`       | T-7                 | **não**         |
| `/api/conta/cadastro` com transação de 3 linhas  | `formulario-atendimento` | T3                  | **não**         |
| Campos e-mail, CPF, senha na tela                | `formulario-atendimento` | T5                  | **não**         |
| CEP + busca por ViaCEP                           | **nenhuma**              | —                   | não existia     |
| `/area`, `/area/inscricoes`, `/area/excluir`     | `area-do-associado`      | Fatia 1 a 4         | **não**         |
| `/api/area/*`                                    | `area-do-associado`      | Fatia 2, 4          | **não**         |
| ADR-005 e ADR-007                                | —                        | —                   | sim             |
| Deploy por GitHub Actions, D1 remoto             | **nenhuma**              | —                   | não existia     |

## O que isso significa na prática

**Nenhuma change pode ser arquivada.** Arquivar exige passar no gate de validação item a
item contra os critérios de aceite (`fluxo-spec`, regra 3), e o que aconteceu foi o
oposto: o código veio primeiro e os critérios nunca foram percorridos. Marcar como
concluído agora seria trocar um problema de processo por uma mentira no registro.

**Três coisas foram feitas sem change nenhuma**: o campo CEP, a infraestrutura de
publicação e a revisão de interface. A primeira e a terceira agora têm dona — a change
`revisao-de-interface` cobre o CEP no que toca a tela, e o campo em si está registrado em
`docs/campos-formulario.md`. A segunda é infraestrutura e vive em `PROGRESS.md`; se
crescer, vira change própria.

## O que fazer antes de arquivar qualquer coisa

1. **`modelo-de-dados`** é a única perto de fechar: T1 a T3 feitas e verificadas, T4 feita,
   T5 (gate) rodado com o parecer em `PARECER-GATE-T5.md`. Falta o revisor independente
   que o próprio parecer exige, porque o T5 foi autorrevisão.
2. **`cadastro-e-login`, `formulario-atendimento` e `area-do-associado`** têm código
   rodando e critérios de aceite **não percorridos**. O caminho honesto é rodar os
   cenários Gherkin de cada uma contra o que existe, marcar o que passa, e abrir tarefa
   para o que não passa — não presumir que passa porque o ciclo funcionou uma vez.
3. **`consentimento-e-privacidade`, `cracha-do-associado` e `site-institucional`** seguem
   sem implementação, e as tasks delas estão corretas.

## A regra que não vai ser quebrada de novo

Task marcada **no mesmo commit** que a entrega. Não existe "marco depois": o depois é
exatamente onde o registro se descola do código, e um dia inteiro basta para o
`openspec/` virar ficção.
