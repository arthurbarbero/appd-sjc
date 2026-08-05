# Proposal: Cadastro, login e área do associado

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

- Tabela `usuarios` no D1, via Drizzle, com **migration versionada** (`db:generate`),
  nunca `push` direto no banco.
- **Cadastro de conta** em `/cadastro`: nome, data de nascimento, telefone, e-mail e
  senha, mais foto opcional e aceite da política de privacidade com versão e data/hora.
- **Geração do `numero_registro`** no formato `APPD-<ano>-<sequencial de 5 dígitos>`,
  único e imutável, ao concluir o cadastro.
- **Login** em `/entrar`, **logout**, e guarda de rota para `/area/*`.
- **Limite de tentativas de login** com bloqueio temporário.
- **Sessão em cookie selado** com `nuxt-auth-utils`, chave em Cloudflare Secret
  (`NUXT_SESSION_PASSWORD`), nunca versionada.
- **Recuperação de senha**: caminho humano pela secretaria (garantido) e fluxo por
  e-mail **condicional** à existência de uma solução de custo zero — ver risco R-1.
- **Área do associado**: painel `/area` e as quatro rotas `/area/dados`,
  `/area/inscricoes`, `/area/cracha` e `/area/excluir`.
- **Exclusão de conta** em página própria, com dupla confirmação por caixas de seleção.
- Fixação e medição dos **parâmetros do scrypt** (N, r, p) contra o limite de CPU do
  Worker, com o resultado registrado em ADR.

## Fora de escopo (o que NÃO entra)

- **O crachá em si** — layout, geração da imagem, download para impressão e a página
  pública `/verificar/<numero>`. Fica na change `cracha-do-associado`. Aqui existe
  apenas o bloco "Meu crachá" no painel, como ponto de entrada e como destino do envio
  de foto.
- **O formulário de atendimento** e o modelo de dados de inscrição. Fica na change
  `formulario-atendimento`. Aqui, "Minhas inscrições" entrega apenas o estado vazio
  funcional descrito em REQ-30.
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

- **Toca dado pessoal?** Sim. Nome, data de nascimento, telefone, e-mail, endereço e
  foto de pessoas com deficiência. **Não** toca dado sensível: tipo de deficiência não
  é perguntado nem exibido em nenhuma tela desta change. Gate de revisão antes do
  deploy.
- **Toca produção / custo real?** Não há produção ainda (nada deployado, conta
  Cloudflare inexistente). Custo permanece R$ 0: nenhum serviço novo é contratado. Se a
  solução de e-mail exigir cartão, ela **não entra** — ver R-1.
- **Arquitetura/stack afetada?** A decisão de fundo já está tomada (ADR-002). Três
  decisões novas nascem aqui e **são do arquiteto**, não desta spec: os parâmetros do
  scrypt (vira ADR-005), onde persistir o contador de tentativas de login, e o destino
  dos dados na exclusão de conta (apagar versus anonimizar).
- **Absorção de escopo declarada:** o `openspec/README.md` prevê `area-do-associado`
  como change 6, separada. Por decisão do dono nesta change, a área do associado entra
  **aqui**. O README precisa ser atualizado para não ficar com uma change fantasma na
  lista — tarefa T-14.
- **Conflito de origem declarado:** `shared/utils/registro.ts` e a seção "Dívidas
  conscientes" do `PROGRESS.md` afirmam que a spec do número de registro nasceria em
  `cracha-do-associado`. Isso muda: o número é **gerado no cadastro**, então a spec de
  geração é desta change e a de exibição é da outra. Os dois comentários precisam ser
  corrigidos — tarefa T-14.
- **Dependências e quem é tocado:**
  - `server/database/schema.ts` (hoje vazio) e `drizzle/migrations` (hoje inexistente).
  - `shared/utils/registro.ts` — ganha a regra de verdade, além da formatação.
  - Dependência de biblioteca nova: `nuxt-auth-utils` (ainda não está no
    `package.json`). Precisa de verificação no workerd antes de virar tarefa fechada.
  - Interface `ArmazenamentoFoto` (CLAUDE.md) — a foto vai como BLOB no D1, porque R2
    exige cartão.
  - Design das telas `/cadastro`, `/entrar` e `/area/*`: os prompts existem em
    `docs/prompts-design/`, mas **nenhuma delas foi gerada e aprovada no Claude
    Design**. Pela regra central do CLAUDE.md, nenhuma tela é implementada antes disso.

## Premissas e questões abertas

- **P-1**: `scrypt` do `node:crypto` continua disponível sob `nodejs_compat`. Provado no
  spike (commit `b7e321d`); é flag de compatibilidade, não contrato eterno.
- **P-2**: o volume da associação cabe no free tier do D1 (100 mil requisições/dia,
  500 MB). Um cadastro de associação municipal fica ordens de grandeza abaixo disso.
- **P-3**: a APPD aceita que a recuperação de senha passe pela secretaria por telefone
  enquanto não houver e-mail. **A confirmar com a associação** — é trabalho humano
  recorrente que estamos criando para elas.
- **Q-1** (dono do projeto): o cadastro revela que um e-mail já existe? Ver risco R-6.
- **Q-2** (APPD + jurídico): o que exatamente a associação é obrigada a manter após a
  exclusão da conta, e por quanto tempo? Já marcado `[A CONFIRMAR]` no prompt de design.
- **Q-3** (arquiteto): contador de tentativas de login em coluna da própria tabela
  `usuarios` ou em tabela separada? Não há KV nem Redis — a decisão é entre D1 e nada.

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
- **R-5 · média** — exclusão de conta versus o dado que a associação precisa reter (Q-2).
  Tratado em REQ-35, que não vai para produção sem a resposta.
- **R-6 · média** — o cadastro revela quem já é associado. Tratado em REQ-18 e detalhado
  abaixo.
- **R-7 · alta** — nenhuma tela desta change tem design aprovado no Claude Design.
  Bloqueia T-6, T-10 e T-11.
- **R-8 · alta** — **colisão de escopo com a change `area-do-associado`**, escrita em
  paralelo nesta mesma data. Ver a seção abaixo.

### R-1 — o bloqueante

A recuperação de senha por e-mail depende de enviar e-mail, e **não existe solução de
custo zero definida** para isso. O projeto opera com R$ 0 e sem cartão cadastrado
(ADR-001), o que elimina a maior parte dos serviços de envio. Consequência aceita nesta
change:

1. O caminho **humano** é o caminho garantido: a secretaria refaz a senha por telefone.
   Ele não é plano B nem letra miúda — está especificado em REQ-25 e aparece em toda
   tela de falha de login.
2. O fluxo por e-mail está **especificado e condicional** (REQ-26): a implementação só
   começa quando existir um caminho de custo zero aprovado pelo dono. Até lá, nenhuma
   tela promete e-mail enviado, e o botão do fluxo não é publicado.
3. Nada nesta change fica bloqueado por R-1 além do próprio REQ-26. Cadastro, login,
   logout, área e exclusão seguem normalmente.

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

**Recomendação do especificador**: aceitar e registrar, porque o custo de usabilidade da
alternativa recai sobre quem tem menos facilidade digital. **A decisão é do dono do
projeto (Q-1)** e vira ADR — não é da spec decidir. REQ-18 está escrito com a
recomendação e é revisado se a decisão for outra.

### R-8 — duas changes disputam a área do associado

Esta change recebeu a área do associado no escopo por instrução do dono. Ao mesmo tempo,
existe em `openspec/changes/area-do-associado/` uma change própria que reivindica as
mesmas quatro rotas (`/area`, `/area/dados`, `/area/inscricoes`, `/area/excluir`) e que,
no seu fora-de-escopo, devolve a autenticação para cá. **As duas não podem valer ao mesmo
tempo**: dois contratos sobre a mesma tela produzem código que obedece a um e reprova no
gate do outro.

Estado registrado, sem decisão unilateral:

- REQ-30 a REQ-35 desta spec e a change `area-do-associado` **se sobrepõem quase por
  inteiro**. A vizinha é mais detalhada em estados de tela (carregando, sem foto,
  vocabulário de status); esta é mais detalhada no efeito da exclusão sobre os dados.
- A fronteira que a vizinha propõe — autenticação aqui, área lá — é a mesma do
  `openspec/README.md` original.
- **Recomendação do especificador**: manter uma só dona da área. Se a decisão for a
  vizinha, esta change perde REQ-30 a REQ-35 e fica com a guarda de rota de `/area/*`
  (REQ-13) e o vínculo de sessão — e as tarefas T-10 e T-11 saem daqui. Se a decisão for
  esta, a pasta `area-do-associado` é apagada antes de qualquer código.
- **A decisão é do coordenador com o dono do projeto (T-0.5)**, não da spec. Enquanto ela
  não sair, **nenhuma das duas changes libera tarefa de tela da área** — o risco não é
  escrever duas vezes, é implementar contra o contrato errado.

## Próximo passo no fluxo

proposal → **spec** (`spec.md`, nesta pasta) → critério de aceite (dentro da spec) →
gate de Definition of Ready → tasks (`tasks.md`) → implementação → validação → archive.
