# Proposal: Formulário de Atendimento — criar a conta, persistir e validar dos dois lados

- ID: PROP-20260805-formulario-atendimento Status: em discussão
- Origem: `openspec/README.md` (change 4 da Fase 3) · `docs/campos-formulario.md`
  (levantamento de 2026-08-05) · `docs/prompts-design/formulario.md` (desenho aprovado)
  · tela em demonstração já implementada em `app/pages/atendimento/inscricao.vue`
- Autor do registro: Claude Code (especificador)
- Dono do conteúdo: Arthur Barbero (dono do projeto); regra de negócio do atendimento é
  da APPD-SJC
- Data: 2026-08-06 Versão: v2 (reescrita contra `modelo-de-dados`, depois do gate)

## Motivação (por quê)

A tela do Cadastro de Atendimento 2026 existe, tem os 15 campos do formulário oficial e
valida no cliente — **mas não envia nada**. Quem preenche hoje vê uma confirmação que o
próprio código chama de demonstração e sai sem nada: nenhuma linha gravada, nenhum
número, nenhum registro. É a tela que mais importa do site e é a única que não cumpre o
que promete.

O que dói, em ordem:

1. **A inscrição não existe depois do envio.** Não há tabela, não há rota, não há
   número para a pessoa citar quando ligar para a sede.
2. **E, existindo, ela seria da associação, não da pessoa.** Hoje a APPD baixa uma
   planilha e divide à mão; quem preencheu nunca mais alcança o próprio cadastro para
   corrigir um telefone. Por isso esta change cria a conta junto (ADR-012): o ganho real
   sobre o Google Forms é a pessoa poder voltar e editar.
3. **A validação mora só no cliente.** Qualquer `curl` grava o que quiser no dia em que
   a rota nascer, inclusive com opção fora da lista oficial e sem consentimento.
4. **Erro de preenchimento é risco real de abandono.** Quem preenche costuma ser um
   familiar cuidador no celular, ou a própria pessoa com deficiência motora usando
   teclado ou leitor de tela. Refazer 15 campos porque o telefone veio com um dígito a
   menos é o custo que faz desistir — e é exatamente o que um recarregamento de página
   provoca.
5. **Dado de saúde sem registro de consentimento é infração, não detalhe.** O campo 12
   é dado sensível do Art. 11 da LGPD. Persistir isso sem versão de termo e data/hora de
   aceite gravadas é pior do que não persistir.

## Escopo (o que entra)

- Rota `POST /api/atendimento/inscricao` que recebe, valida e grava — **numa única
  transação** — a conta, a inscrição e o aceite do Art. 11.
- **Três campos novos**: e-mail, CPF e senha (ADR-012). Nenhum dos 15 originais muda.
- **Um único schema Zod** em `shared/`, importado pelo cliente e pelo servidor. O
  servidor revalida tudo e não confia em nada que veio do cliente.
- Os quatro estados da tela: vazio, erro por campo com resumo no topo, enviando,
  sucesso.
- Confirmação que diz o que de fato acontece — interesses registrados, a APPD entra em
  contato, e o caminho para a pessoa editar o cadastro depois. Sem fila, sem prazo.
- Idempotência: envio repetido (clique duplo, retentativa depois de erro de rede) não
  cria duas contas.
- Guarda anti-abuso proporcional: limite por hora e limite de tamanho de payload, sem
  CAPTCHA.

**Não entra mais no escopo desta change:** criar tabela ou coluna. Isso é de
[`modelo-de-dados`](../modelo-de-dados/spec.md), que passou a ser dependência dura.

## Fora de escopo (o que NÃO entra)

- **Consentimento do Art. 11 em si** — texto do termo, versionamento, política de
  privacidade, revogação e retenção são da change `consentimento-e-privacidade`. Aqui só
  se **grava** o aceite na tabela que aquela change é dona.
- **As tabelas** — colunas, tipos e restrições são de `modelo-de-dados`.
- **Login, sessão e o hash da senha** — são de `cadastro-e-login`, que também emite o
  `numero_registro` (ADR-013). Esta change coleta a senha e chama; não implementa.
- **Painel de quem lê as inscrições** — listagem, filtro, triagem e exportação ficam
  para `painel-admin` (V1.1). Deixou de ser bloqueio de publicação (ADR-014), continua
  sendo a próxima entrega de valor.
- **Salvamento parcial / rascunho** — decisão registrada na spec (D6): fora da V1,
  apesar de agora existir conta.
- **Edição da inscrição pela pessoa** — o requisito existe (ADR-014), mas a tela é de
  `area-do-associado`. Aqui só se garante que a gravação inicial não a impeça.
- **E-mail ou WhatsApp de confirmação** — não há canal de envio de custo zero decidido
  (ver `PROGRESS.md`, pendência de e-mail). A confirmação é a própria tela.
- **Mudar qualquer um dos 15 campos** — rótulo, ordem e obrigatoriedade são réplica
  fiel. As duas exceções de forma já decididas estão registradas na spec (D1).
- **Alterar as opções do campo 13** para incluir Bocha, Mão na Roda, Artesão e
  Informática — é pendência da APPD (`docs/pendencias-appd.md`, item 1b).

## Impacto

- **Toca dado sensível?** Sim — campo 12 é dado de saúde (Art. 11 da LGPD). Gate de
  revisão obrigatório antes de publicar, e dependência dura de
  `consentimento-e-privacidade`.
- **Toca produção?** Não hoje: deploy só em `*.workers.dev` até a APPD aprovar
  (`CLAUDE.md`). Mas é a primeira rota que escreve dado pessoal do projeto.
- **Arquitetura/stack afetada?** Dentro do que o ADR-001 já decidiu (Workers + D1 +
  Drizzle). Duas decisões ainda por assinar viram ADR (ver abaixo).
- **Custo?** Zero. Volume esperado da associação cabe com folga no free tier do D1.
- **Dependências / quem é tocado:**
  - `modelo-de-dados` → **dependência dura**: as tabelas precisam existir antes.
  - `consentimento-e-privacidade` → **bloqueia a publicação** desta change.
  - `cadastro-e-login` → emite o `numero_registro` e faz o hash da senha (ADR-013);
    esta change chama, não reimplementa.
  - `cracha-do-associado` → apenas exibe o `numero_registro`; não há segundo espaço de
    numeração no projeto.
  - `area-do-associado` → consome a inscrição e é dona da **edição** dela.
  - `painel-admin` (V1.1) → consumidor dos dados gravados aqui.
  - `site-institucional` → a tela já está no ar em modo demonstração; esta change
    remove o aviso de demonstração.

## Decisões que precisam virar ADR (rascunho meu, assinatura do dono)

1. ~~**ADR-007 — Protocolo de inscrição em espaço de numeração próprio.**~~ **Sem
   objeto.** O protocolo `ATD-` existia para ancorar o aceite de quem preenchesse sem
   conta. Com o [ADR-012](../../../docs/adr/adr-012-cadastro-embutido-no-formulario.md),
   toda inscrição pertence a um usuário e o `numero_registro` já identifica a pessoa. O
   número 007 foi liberado; a confirmação volta a mostrar `APPD-`, como o mock de design
   já trazia.
2. **ADR-008 — Múltipla escolha guardada como JSON no D1.** Proposta: colunas TEXT com
   array JSON validado contra a lista oficial, em vez de tabelas de junção. Motivo:
   volume pequeno, `json_each` resolve a consulta do futuro painel. **Dívida assumida:**
   filtro por opção fica menos eficiente e sem integridade referencial.
3. **ADR-009 — Anti-abuso sem CAPTCHA.** Proposta: limite por hora com IP **hasheado**
   (HMAC com segredo) e limite de tamanho de payload; nada de CAPTCHA na V1. Motivo:
   CAPTCHA é barreira para exatamente o público deste site. **Dívida assumida:** se
   aparecer abuso real, reavaliar em ADR novo.

## Premissas e questões abertas

- **Premissa:** o volume é de dezenas de inscrições por mês, não milhares. Se estiver
  errado, a guarda anti-abuso e o limite do free tier precisam ser refeitos.
- **Premissa:** a tela desenhada em `docs/prompts-design/formulario.md` está aprovada; o
  que muda aqui é o que acontece depois do clique.
- ~~**Contradição entre changes:** `consentimentos.usuario_id` NOT NULL × formulário sem
  conta.~~ **Resolvida** pelo ADR-012: o formulário cria a conta, e o NOT NULL passa a
  ser exequível.
- ~~**Risco R1 (P0):** ninguém lê as inscrições na V1.~~ **Premissa derrubada** pelo
  ADR-014. A APPD não opera fila nem matrícula: marcar "Fisioterapia" sinaliza interesse
  e alguém entra em contato. Não havia promessa a descumprir — havia uma tela dizendo
  "fila de vagas" sobre um processo que não existe. Corrigido o texto, o risco some. O
  painel continua sendo a próxima entrega de valor.
- ~~**Questão aberta (P0):** em quanto tempo a associação retorna o contato?~~ **Sem
  objeto**: sem fila, não há chamada por ordem, e a tela não exibe prazo nenhum.
- **Questão nova, para a APPD:** pedir **CPF** é pergunta que a associação não faz hoje
  (`docs/pendencias-appd.md`, item 4b). Recusa custa uma migration.
- **Barreira de entrada assumida:** três perguntas a mais, num formulário longo, para um
  público com pouca fluência digital. Mitigações escritas na spec (REQ-7a, REQ-7b):
  senha só com comprimento mínimo, e nenhuma confirmação de e-mail bloqueando o envio.
  Consequência aberta: quem não tem e-mail precisa de ajuda presencial da APPD.
- **Questão aberta:** "CADASTRO DE ATENDIMENTO 2026" tem o ano no nome
  (`docs/pendencias-appd.md`, item 11). Se a inscrição for por ciclo anual, falta uma
  coluna de ciclo. A spec grava o ano do recebimento, o que cobre o caso mínimo.

## Próximo passo no fluxo

proposal → **spec** (`spec.md`, nesta mesma pasta) → critério de aceite Gherkin (dentro
da spec) → tasks (`tasks.md`) → validação item a item → `openspec/archive/`.
