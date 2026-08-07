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

## Entregas de 2026-08-07 (com a task marcada no mesmo commit)

| Entregue                                       | Change dona            | Task     | Marcada? |
| ---------------------------------------------- | ---------------------- | -------- | -------- |
| Cabeçalho em uma linha, faixa 861–900px        | `revisao-de-interface` | T1.1b    | sim      |
| Cadastro concluído leva a `/area` logado       | `revisao-de-interface` | T1.2     | sim      |
| Modal de exclusão em uma linha, "Excluir"      | `area-do-associado`    | T4.5a    | sim      |
| CEP e telefone formatados no painel            | `area-do-associado`    | T3.1b    | sim      |
| QR Code da verificação no bloco do crachá      | `area-do-associado`    | T3.1b    | sim      |
| `/area/dados` — alterar nome, telefone, ender. | `area-do-associado`    | T3.1–3.5 | sim      |

### Uma ressalva que fica escrita em vez de escondida

**O QR Code aponta para uma página que ainda não existe.** `/verificar/<numero>` é a
Fatia 5 de `cracha-do-associado`, travada pela T0.4 **daquela** change. Até subir, ler o
código leva a um 404. A alternativa seria não pôr o QR; o dono pediu o QR. Registrado para
que ninguém descubra isso na frente da associação.

> A ressalva sobre `/area/dados` não ter passado pelo Claude Design **caiu** em
> 2026-08-07: o dono confirmou que operou o canvas e entregou as telas da área naquele
> mesmo ciclo. A T0.4 de `area-do-associado` está marcada.

## Entregas de 2026-08-07, segunda leva

A change `revisao-de-interface` está com **as 15 tasks feitas** — os 21 requisitos que
saíram da sessão de uso do dono. Junto foram três defeitos que só apareceram percorrendo
o ciclo:

| Defeito                                                                  | Onde estava                                  |
| ------------------------------------------------------------------------ | -------------------------------------------- |
| Entrar não atualizava o cabeçalho: continuava oferecendo "Entrar"        | `entrar.vue`, `inscricao.vue`, `excluir.vue` |
| Quem tinha sessão abria o cadastro e criava conta duplicada              | faltava guarda nos dois lados                |
| **Não existia botão "Sair"** — a rota da API não era chamada por ninguém | `AreaNavegacao.vue`                          |
| O formulário redeclarava as três listas de escolha                       | `inscricao.vue`                              |

## O gate deixou de ser leitura

Decisão do dono em 2026-08-07: **"não vou analisar a mão mesmo não, voce mesmo valida"**.
Está certo. 276 cenários Gherkin percorridos por uma pessoa é um gate que nunca acontece,
e gate que não acontece é carimbo.

O aceite passou a viver em dois lugares que rodam sozinhos:

- **`npm test`** — `test/revisao-de-interface.spec.ts` lê o código-fonte das telas e falha
  se qualquer frase que o dono mandou tirar voltar. Lê o fonte, e não o HTML renderizado,
  porque o jeito de essas frases voltarem não é bug de renderização: é alguém digitar de
  novo.
- **`npm run aceite`** — `test/aceite/percurso.mjs` sobe o workerd de verdade e percorre
  cadastrar → área → corrigir → sair → entrar → excluir, mede rolagem horizontal em sete
  larguras e roda `axe` A/AA em dez telas. **78 de 78 em 2026-08-07.**

Isso **não fecha** as changes antigas: `cadastro-e-login`, `formulario-atendimento` e
`area-do-associado` continuam com critérios não percorridos. Mas agora existe a ferramenta
para percorrê-los, que é o que faltava.

## A regra que não vai ser quebrada de novo

Task marcada **no mesmo commit** que a entrega. Não existe "marco depois": o depois é
exatamente onde o registro se descola do código, e um dia inteiro basta para o
`openspec/` virar ficção.
