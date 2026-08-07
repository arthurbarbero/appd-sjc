# Proposal: Conta, senha e sessão

- ID: PROP-20260805-cadastro-e-login Status: em discussão
- Origem: `openspec/README.md` (change 3 das previstas para a Fase 3) · ADR-002
  (senha com scrypt e sessão em cookie selado, 2026-08-05) · `PROGRESS.md`, item
  "Escrever as changes de OpenSpec antes da parte com banco"
- Autor do registro: Claude Code (especificador) Dono do conteúdo: Arthur Barbero
- Data: 2026-08-05 Versão: v1
- Nível na régua `fluxo-spec`: **Grande** — módulo novo, primeira tabela do D1,
  dado pessoal persistido, difícil de reverter depois que houver conta criada.

## Motivação (por quê)

O site institucional está de pé com 12 rotas públicas, mas a parte que justifica ter
banco de dados não existe: ninguém consegue criar conta, entrar, ver a própria
inscrição ou ter um crachá. Hoje o associado só existe no papel da secretaria.

Três coisas dependem desta change e não andam sem ela:

1. **O crachá** (`cracha-do-associado`) precisa de um associado identificado por um
   número estável. Sem conta, não há a quem emitir.
2. **O formulário de atendimento** (`formulario-atendimento`) precisa saber de quem é
   a inscrição para que ela apareça depois em "Minhas inscrições" — e para que o
   salvamento parcial, previsto em `docs/campos-formulario.md`, seja possível.
3. **Os direitos do titular pela LGPD** (consultar e apagar os próprios dados) só têm
   onde acontecer se existir uma área autenticada.

A stack de auth já foi decidida e provada em spike no runtime workerd real (ADR-002).
O que falta não é risco técnico: é o contrato escrito que diz o que o sistema faz,
com que critério, e o que ele explicitamente não faz.

## Escopo (o que entra)

- O **comportamento** da tabela `usuarios`: quem grava a senha, quem emite o número,
  quem escreve `situacao`. A tabela em si é de `modelo-de-dados`.
- **Geração do `numero_registro`** no formato `APPD-<ano>-<sequencial de 5 dígitos>`,
  único e imutável, ao concluir o cadastro. **Dono único** no projeto (ADR-013).
- **Login** em `/entrar`, **logout**, e a **guarda de rota** de `/area/*` — uma só, para
  as rotas das duas changes donas.
- **Limite de tentativas de login** com bloqueio temporário, que **não enumera usuários**
  (bloqueio B13 do gate).
- **Sessão em cookie selado** com `nuxt-auth-utils`, chave em Cloudflare Secret
  (`NUXT_SESSION_PASSWORD`), nunca versionada.
- **Recuperação de senha**: caminho humano pela secretaria (garantido) e fluxo por
  e-mail **condicional** à existência de uma solução de custo zero — ver risco R-1.
- Fixação e medição dos **parâmetros do scrypt** (N, r, p) contra o limite de CPU do
  Worker, com o resultado registrado em ADR-005.

**Saiu do escopo na v2** (ADR-012 e ADR-013): a tela de cadastro — a conta nasce no
formulário de atendimento; a foto — é de `cracha-do-associado`; e as quatro telas de
`/area/*` — são de `area-do-associado`.

## Fora de escopo (o que NÃO entra)

- **As tabelas** — colunas, tipos e restrições são de `modelo-de-dados`.
- **A tela que cria a conta** — é o formulário de atendimento (ADR-012). `/cadastro`
  vira redirecionamento 301 para lá.
- **A foto** — envio, recorte, limite e armazenamento são inteiramente de
  `cracha-do-associado` (ADR-013), junto com `/area/cracha` e `/verificar/<numero>`.
- **As telas de `/area/*`** — painel, dados, inscrições e exclusão são de
  `area-do-associado` (ADR-013). Daqui vem só a guarda de rota.
- **O texto da política de privacidade**, a página `/privacidade`, a página "Seus
  direitos" e o registro de consentimento para **dado sensível** (tipo de deficiência,
  Art. 11 da LGPD). Fica na change `consentimento-e-privacidade`. Aqui só existe o
  aceite da política no cadastro, gravado com versão e data/hora.
- **Painel administrativo**, qualquer visão da secretaria sobre contas de terceiros,
  aprovação manual de cadastro e alteração de status de associado.
- **Login social** de qualquer provedor. Decisão consciente e registrada no ADR-002:
  o público tem baixa afinidade digital e nem todo mundo tem conta Google.
- **Confirmação de e-mail no cadastro** e qualquer promessa de mensagem enviada —
  depende do mesmo bloqueio do risco R-1.
- **Cadastro de voluntário** (decisão da Fase 1: vira assunto no formulário de contato).
- **Revogação imediata de sessão** e lista de sessões ativas. O cookie selado não
  permite; a dívida está aceita no ADR-002.

## Impacto

- **Toca dado pessoal?** Sim. Nome, data de nascimento, telefone, e-mail, CPF e endereço
  de pessoas com deficiência. **Não** toca dado sensível: tipo de deficiência não é
  perguntado, lido nem exibido em nenhuma rota desta change. Gate de revisão antes do
  deploy.
- **Toca produção / custo real?** Não há produção ainda (nada deployado, conta
  Cloudflare inexistente). Custo permanece R$ 0: nenhum serviço novo é contratado. Se a
  solução de e-mail exigir cartão, ela **não entra** — ver R-1.
- **Arquitetura/stack afetada?** A decisão de fundo já está tomada (ADR-002). Resta uma
  decisão do arquiteto: os parâmetros do scrypt (vira ADR-005). As outras duas da v1
  foram resolvidas — o contador de tentativas vai para o D1 com chave em HMAC, e o
  destino dos dados na exclusão está no `modelo-de-dados` REQ-28.
- ~~**Absorção de escopo declarada**~~ — **desfeita** pelo ADR-013: vale a fronteira do
  `openspec/README.md`, e `area-do-associado` continua sendo change própria.
- **Conflito de origem declarado:** `shared/registro.ts` e a seção "Dívidas
  conscientes" do `PROGRESS.md` afirmam que a spec do número de registro nasceria em
  `cracha-do-associado`. Isso muda: o número é **gerado no cadastro**, então a spec de
  geração é desta change e a de exibição é da outra. Os dois comentários precisam ser
  corrigidos — tarefa T-14.
- **Dependências e quem é tocado:**
  - `server/database/schema.ts` (hoje vazio) e `drizzle/migrations` (hoje inexistente).
  - `shared/registro.ts` — ganha a regra de verdade, além da formatação.
  - Dependência de biblioteca nova: `nuxt-auth-utils` (ainda não está no
    `package.json`). Precisa de verificação no workerd antes de virar tarefa fechada.
  - `modelo-de-dados` — **dependência dura**: as tabelas precisam existir antes.
  - `formulario-atendimento` — chama a emissão do número e o hash da senha desta change.
  - Design das telas desta change (`/entrar`, redefinição de senha): os prompts existem
    em `docs/prompts-design/`, mas **nenhuma foi gerada e aprovada no Claude Design**.
    Pela regra central do CLAUDE.md, nenhuma tela é implementada antes disso.

## Premissas e questões abertas

- **P-1**: `scrypt` do `node:crypto` continua disponível sob `nodejs_compat`. Provado no
  spike (commit `b7e321d`); é flag de compatibilidade, não contrato eterno.
- **P-2**: o volume da associação cabe no free tier do D1 (100 mil requisições/dia,
  500 MB). Um cadastro de associação municipal fica ordens de grandeza abaixo disso.
- **P-3**: a APPD aceita que a recuperação de senha passe pela secretaria por telefone
  enquanto não houver e-mail. **A confirmar com a associação** — é trabalho humano
  recorrente que estamos criando para elas.
- **P-4 (nova, ADR-012)**: toda pessoa atendida passa a ter senha, porque o formulário
  cria a conta. Isso multiplica o volume de "esqueci minha senha" e torna o R-1 mais
  caro do que era quando a conta era opcional.
- **Q-1** (dono do projeto): o cadastro revela que um e-mail já existe? Ver risco R-6.
- **Q-2** (APPD + jurídico): **o prazo de retenção** do que a associação mantém após a
  exclusão. O que é apagado já está fechado (`modelo-de-dados` REQ-28); falta o prazo
  que a tela exibe.
- ~~**Q-3** (arquiteto): onde persistir o contador de tentativas.~~ **Respondida**: D1,
  em tabela própria, com a chave em HMAC (REQ-26b) — senão o mecanismo antienumeração
  vira ele mesmo uma lista de e-mails em texto claro.

## Riscos registrados

- **R-1 · bloqueante** — recuperação por e-mail sem solução de custo zero definida.
  Tratado em REQ-28 e REQ-29, e detalhado abaixo.
- **R-2 · alta** — parâmetros do scrypt não definidos nem medidos contra a CPU do Worker.
  Tratado em REQ-7 e na tarefa T-1.
- **R-3 · média** — cookie selado não é revogável: um cookie roubado vale até expirar.
  Dívida aceita no ADR-002; mitigada em REQ-12 (prazo curto) e REQ-14 (não prometer o
  que o logout não faz).
- **R-4 · média** — o sequencial do número de registro pode colidir em cadastros
  simultâneos. Tratado em REQ-4, com restrição de unicidade no banco.
- **R-5 · média** — prazo de retenção após a exclusão ainda em aberto (Q-2). O contrato
  do que é apagado está fechado; a tela não vai ao ar sem o prazo.
- **R-6 · média** — o cadastro revela quem já é associado. Tratado em REQ-18 e detalhado
  abaixo. **Três portas, não uma** — ver a seção.
- **R-7 · alta** — as telas desta change não têm design aprovado no Claude Design.
- ~~**R-8 · alta** — colisão de escopo com `area-do-associado`.~~ **Fechado** pelo
  ADR-013: vale a fronteira do README, e esta change fica com a guarda de rota.

### R-1 — o bloqueante

A recuperação de senha por e-mail depende de enviar e-mail, e **não existe solução de
custo zero definida** para isso. O projeto opera com R$ 0 e sem cartão cadastrado
(ADR-001), o que elimina a maior parte dos serviços de envio. Consequência aceita nesta
change:

1. O caminho **humano** é o caminho garantido: a secretaria refaz a senha por telefone.
   Ele não é plano B nem letra miúda — está especificado em REQ-28 e aparece em toda
   tela de falha de login.
2. O fluxo por e-mail está **especificado e condicional** (REQ-29): a implementação só
   começa quando existir um caminho de custo zero aprovado pelo dono. Até lá, nenhuma
   tela promete e-mail enviado, e o botão do fluxo não é publicado.
3. Nada nesta change fica bloqueado por R-1 além do próprio REQ-29. Login, logout e a
   guarda de rota seguem normalmente.

**O que mudou com o ADR-012, e é sério:** quando a conta era opcional, o caminho humano
atendia poucas pessoas. Agora **toda** pessoa que pede atendimento tem senha, e o volume
de esquecimento passa a ser proporcional ao cadastro inteiro — trabalho recorrente que
estamos criando para uma secretaria pequena. Por isso a pesquisa de e-mail ou SMS
gratuito virou item nomeado do `PROGRESS.md`, com a restrição escrita: custo zero, sem
cartão, e nenhuma conta externa criada sem o dono mandar.

### R-6 — a inconsistência que a spec expõe

O login foi desenhado para **nunca revelar** se um e-mail tem conta (ADR-002 e
`docs/prompts-design/login.md`), porque associação de pessoas com deficiência é
exatamente o lugar onde essa informação não pode vazar. Mas o cadastro, no desenho
atual, diz "Este e-mail já tem uma conta" — o que entrega a mesma informação por outra
porta: basta tentar cadastrar o e-mail de alguém.

A saída padrão do mercado (aceitar o cadastro em silêncio e mandar um e-mail explicando
que a conta já existe) **depende de e-mail** e cai dentro de R-1. Portanto, com o que
existe hoje, as opções reais são duas: aceitar o vazamento no cadastro, ou entregar uma
mensagem genérica que deixa a pessoa sem saber o que fazer.

**São três portas, não uma** (apontamento C.2 do gate): a mensagem do cadastro, a de
troca de e-mail em `/area/dados`, e — a pior — o bloqueio por tentativas. A terceira já
foi fechada no REQ-26a: o contador vale para a chave digitada, exista conta ou não.
Ela era a mais grave porque permitia **varrer uma lista** de e-mails, enquanto a do
cadastro exige que o atacante já saiba o alvo.

**Recomendação do especificador**: aceitar o vazamento no cadastro e na troca de e-mail,
com a mesma redação nos dois, **e** manter o bloqueio fechado. O custo de usabilidade da
mensagem genérica recai sobre quem tem menos facilidade digital; o custo de privacidade
do bloqueio aberto recai sobre todo mundo. **A decisão é do dono (Q-1)** e vira ADR — não
é da spec decidir. Enquanto ela não sair, os cenários que fixam a redação estão marcados
`[condicional a Q-1]`.

### R-8 — resolvido

A disputa pela área do associado, aberta quando duas changes foram escritas em paralelo
reivindicando as mesmas quatro rotas, foi decidida pelo
[ADR-013](../../../docs/adr/adr-013-fronteira-de-rotas-entre-changes.md): vale a
fronteira do `openspec/README.md`. `area-do-associado` é dona das telas,
`cracha-do-associado` é dona de `/area/cracha`, e esta change fica com a guarda de rota
e a sessão. As tarefas T-10 e T-11 saem daqui.

O registro fica porque a recomendação do especificador — "manter uma só dona da área" —
era a certa, e o padrão que gerou o problema está anotado no vault como
`aprendizados/specs-em-paralelo-colidem`.

## Próximo passo no fluxo

proposal → **spec** (`spec.md`, nesta pasta) → critério de aceite (dentro da spec) →
gate de Definition of Ready → tasks (`tasks.md`) → implementação → validação → archive.
