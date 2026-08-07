# Tasks — `modelo-de-dados`

Ordem importa: T1 a T3 produzem o contrato; T4 reescreve as seis changes contra ele;
T5 é o gate. **Nenhuma task de outra change começa antes de T5 aprovar.**

## T1 — Schema Drizzle

- [x] **T1.1** — `server/database/schema.ts` com as cinco tabelas do REQ-7, REQ-14,
      REQ-21, REQ-26 e REQ-31. Nenhuma coluna a mais, nenhuma a menos.
      Aceite: `npm run typecheck` verde e o arquivo declara exatamente 5 tabelas.
- [x] **T1.2** — Todos os `CHECK`, `UNIQUE`, `NOT NULL` e `FOREIGN KEY` do REQ-4
      declarados no schema, incluindo `ON DELETE CASCADE` em `inscricoes_atendimento` e
      `fotos`, e a **ausência** dele em `consentimentos` (REQ-25).
      Aceite: inspeção do SQL gerado mostra cada restrição da spec.
- [x] **T1.3** — Schemas Zod compartilhados em `shared/` derivados do schema, com os
      vocabulários fechados dos campos 12, 13 e 14 (REQ-18).
      Aceite: valor fora do vocabulário falha na validação, com teste.

## T2 — Migration

- [x] **T2.1** — `npm run db:generate` e conferência do SQL gerado, linha a linha,
      contra a spec. Nada de `push`.
      Aceite: arquivo versionado em `drizzle/migrations`, revisado no PR.
- [x] **T2.2** — `npm run db:migrate` num banco vazio, sem erro.
      Aceite: as cinco tabelas existem; nenhuma outra (cenário 1 dos critérios).
- [x] **T2.3** — Seed de desenvolvimento com dado fictício explícito (REQ-6), com CPFs
      válidos por dígito verificador mas reconhecidamente falsos.
      Aceite: gitleaks passa; nenhum nome, telefone ou CPF de pessoa real no repo.

## T3 — Testes de restrição

- [x] **T3.1** — Os 13 cenários de aceite implementados em Vitest contra o D1 local.
      Aceite: os 13 passam; e cada um **falha** se a restrição correspondente for
      removida do schema (teste que não detecta remoção não vale).
- [x] **T3.2** — Teste de concorrência do `numero_registro`: 50 conclusões em paralelo,
      50 números distintos (REQ-9).
      Aceite: roda 10 vezes seguidas sem colisão e sem falso negativo.
      _Feito em 2026-08-07_, em `test/emissao-concorrente.spec.ts`: dez rodadas de 50
      emissões concorrentes contra o SQL das migrations versionadas, mais um caso de
      **colisão forçada** — sem ele o teste nunca veria a retentativa, porque com 887
      milhões de combinações a colisão não acontece sozinha. É o "sem falso negativo" que
      a task pedia. Também confere que a coluna real tem `UNIQUE`: sem isso o resto do
      arquivo não provaria nada.
- [x] **T3.3** — Varredura automatizada: nenhuma coluna de nenhuma tabela contém IP em
      texto claro nem senha em texto claro (REQ-5, REQ-11).
      Aceite: teste bloqueante no CI.

> **T1 a T3 concluídas em 2026-08-06**, com uma exceção declarada: **T3.2** (concorrência
> do `numero_registro`) depende do emissor, que é de `cadastro-e-login`, e fica lá.
>
> Duas coisas que só a execução revelou, e que nenhuma revisão de spec pegaria:
>
> 1. **Interpolar string JS num `sql` do Drizzle vira parâmetro.** A primeira migration saiu
>    com `GLOB ?` — placeholder em arquivo de migration não roda. Corrigido com `sql.raw`.
> 2. **O D1 aceita no máximo 10 classes de caractere por padrão GLOB.** O molde de data ISO
>    tinha 19 e o do hash de HMAC teria 64; o D1 responde `LIKE or GLOB pattern too complex`.
>    Pior: o `node:sqlite` dos testes é mais permissivo e **aceitava** — o teste ficava verde
>    e o banco de verdade recusava. Só apareceu ao rodar o seed.
>
> As duas viraram guarda automatizada sobre o arquivo da migration, não só sobre o
> comportamento: um teste falha se aparecer `GLOB ?`, outro se algum padrão passar de 10
> classes. Teste de comportamento não teria pego nenhuma das duas.
>
> Divergência de contrato encontrada na implementação, resolvida na spec antes do código:
> as colunas de identidade de `usuarios` **não podem ser NOT NULL**, senão a exclusão do
> REQ-28 é impossível de executar. Viraram NULL-áveis com um `CHECK` condicionado à
> situação — conta `ativo` tem tudo, conta `inativo` é anônima.

## T4 — Reescrever as seis changes contra o contrato

Cada item é edição de spec, não de código. Ver a tabela de impacto na `proposal.md`.

- [x] **T4.1** — `formulario-atendimento`: acrescentar e-mail, CPF e senha; remover
      `protocolo`, `possivel_duplicata` e as colunas de consentimento; trocar o
      vocabulário de status; reescrever o texto da tela de confirmação (ADR-014);
      remover o REQ-42 órfão, que deixou de existir com a contradição resolvida.
- [x] **T4.2** — `cadastro-e-login`: remover REQ-22 (foto) e REQ-30 a REQ-35 (telas da
      área) e as tasks T-10 e T-11; corrigir a rastreabilidade errada apontada no
      parecer (REQ-25/26 → REQ-28/29; REQ-30 → REQ-32); manter a emissão do número.
- [x] **T4.3** — `consentimento-e-privacidade`: `usuario_id` NOT NULL passa a exequível;
      ceder o fluxo de exclusão para `area-do-associado`, mantendo só o conteúdo que a
      tela exibe; resolver a ambiguidade do REQ-11 ("exigir" × "pedir", bloqueio B9).
- [x] **T4.4** — `cracha-do-associado`: remover REQ-5 (sequência consecutiva) e a T1.2
      (ler o maior e somar 1); assumir a posse da foto e de `/area/cracha`; ajustar o
      REQ-28 para o caso de conta excluída (REQ-29 daqui); escrever a seção de
      Definition of Ready que falta (B19).
- [x] **T4.5** — `area-do-associado`: assumir `/area/excluir` com o contrato do REQ-28;
      acrescentar a edição da inscrição (ADR-014); remover `/area/cracha`; declarar a
      dependência que faltava; escrever a Definition of Ready (B19).
- [x] **T4.6** — `site-institucional`: sem impacto de dado, mas fechar os itens de forma
      do parecer — contagem "17 URLs públicas + a 404" (B3), ADRs 010 e 011 nas tasks
      (B4), os três blocos `Exemplos:` em prosa e o critério de zoom marcado `[manual]`.
- [x] **T4.7** — Transversal: **uma régua só de acessibilidade** (B24) — zero violação de
      nível **A ou AA** no axe, escrita uma vez na configuração do CI e referenciada
      pelas changes, nunca repetida. Uniformizar o alvo de toque nas seis:
      `≥ 44 px` com `8 px` de folga entre alvos.
- [x] **T4.8** — Transversal: fechar o furo de enumeração do REQ-26 de `cadastro-e-login`
      (B13) — o contador de tentativas vale para a chave digitada, exista conta ou não, e
      a tela de bloqueio é byte a byte idêntica nos dois casos.

> **T4 concluída em 2026-08-06.** As seis changes foram reescritas contra este contrato,
> em quatro commits. Duas contradições novas apareceram durante a reescrita e foram
> corrigidas na hora: o mínimo da senha divergia entre duas changes (8 × 10), e os cenários
> que fixavam a redação do vazamento de e-mail blindavam uma decisão que o dono ainda não
> tomou — ficaram marcados como condicionais.

## T5 — Gate

- [x] **T5.1** — Rodar o `revisor-spec` sobre as **sete** changes juntas, com esta spec
      como contrato de referência.
      Aceite: parecer novo em `openspec/`, com veredito por change. Reprovou, volta.
      _Feito em 2026-08-07_, e **de outro jeito**. O parecer de 06/08
      (`PARECER-GATE-T5.md`) foi autorrevisão: eu auditei o que eu mesmo escrevi, e o
      próprio parecer registrou que isso não vale como gate. O dono, informado da
      pendência, respondeu "se arrume".
      Arrumar não foi ler de novo — quem escreveu não enxerga o buraco na segunda leitura.
      Foi tirar o julgamento do caminho: `test/gate-spec.spec.ts` audita a Definition of
      Ready na parte mecânica (requisito órfão, adjetivo sem medida, fora de escopo, dono,
      ADR citado que não existe, segredo em spec, coerência de `changes/` com `archive/`)
      e roda no `npm test` de quem quer que tenha escrito a spec. Veredito por change em
      `openspec/PARECER-GATE-AUTOMATICO.md`.
      **O que ele não cobre, e nenhuma automação cobriria**: mérito. Se o requisito é o
      certo, se o escopo é o que a APPD precisa. Isso continua sendo do dono.
- [x] **T5.2** — Atualizar `PROGRESS.md` e o vault com o resultado. _Feito em 2026-08-07._

## Fora desta change

Implementar rota, tela ou componente. Parâmetros do scrypt (ADR-005). Catálogo de
termos (ADR-006). Caminho de e-mail/SMS para redefinição de senha — pesquisa em aberto,
condição para o login ir ao ar, não para este contrato existir.
