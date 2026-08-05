# Proposal: Formulário de Atendimento — persistir, validar dos dois lados e devolver protocolo

- ID: PROP-20260805-formulario-atendimento Status: em discussão
- Origem: `openspec/README.md` (change 4 da Fase 3) · `docs/campos-formulario.md`
  (levantamento de 2026-08-05) · `docs/prompts-design/formulario.md` (desenho aprovado)
  · tela em demonstração já implementada em `app/pages/atendimento/inscricao.vue`
- Autor do registro: Claude Code (especificador)
- Dono do conteúdo: Arthur Barbero (dono do projeto); regra de negócio do atendimento é
  da APPD-SJC
- Data: 2026-08-05 Versão: v1

## Motivação (por quê)

A tela do Cadastro de Atendimento 2026 existe, tem os 15 campos do formulário oficial e
valida no cliente — **mas não envia nada**. Quem preenche hoje vê uma confirmação que o
próprio código chama de demonstração e sai sem nada: nenhuma linha gravada, nenhum
protocolo, nenhuma fila. É a tela que mais importa do site e é a única que não cumpre o
que promete.

O que dói, em ordem:

1. **A inscrição não existe depois do envio.** Não há tabela, não há rota, não há
   número para a pessoa citar quando ligar para a sede.
2. **A validação mora só no cliente.** Qualquer `curl` grava o que quiser no dia em que
   a rota nascer, inclusive com opção fora da lista oficial e sem consentimento.
3. **Erro de preenchimento é risco real de abandono.** Quem preenche costuma ser um
   familiar cuidador no celular, ou a própria pessoa com deficiência motora usando
   teclado ou leitor de tela. Refazer 15 campos porque o telefone veio com um dígito a
   menos é o custo que faz desistir — e é exatamente o que um recarregamento de página
   provoca.
4. **Dado de saúde sem registro de consentimento é infração, não detalhe.** O campo 12
   é dado sensível do Art. 11 da LGPD. Persistir isso sem versão de termo e data/hora de
   aceite gravadas é pior do que não persistir.

## Escopo (o que entra)

- Tabela `inscricoes_atendimento` no D1, via Drizzle, com **migration versionada** em
  `drizzle/migrations` (nunca `push` direto).
- Rota `POST /api/atendimento/inscricao` que recebe, valida, persiste e devolve
  protocolo.
- **Um único schema Zod** em `shared/`, importado pelo cliente e pelo servidor. O
  servidor revalida tudo e não confia em nada que veio do cliente.
- Protocolo de inscrição único, imutável e nunca reaproveitado, exibido na confirmação.
- Os quatro estados da tela: vazio, erro por campo com resumo no topo, enviando,
  sucesso.
- Confirmação que diz o que acontece agora, por qual canal e em quanto tempo — sem
  inventar prazo que a APPD não assumiu.
- Idempotência: envio repetido (clique duplo, retentativa depois de erro de rede) não
  cria duas inscrições.
- Guarda anti-abuso proporcional: limite por hora e limite de tamanho de payload, sem
  CAPTCHA.
- Colunas de consentimento do Art. 11 (versão do termo e data/hora do aceite), cujo
  conteúdo é definido pela change `consentimento-e-privacidade`.

## Fora de escopo (o que NÃO entra)

- **Consentimento do Art. 11 em si** — texto do termo, versionamento, política de
  privacidade, revogação e retenção são da change `consentimento-e-privacidade`. Aqui só
  nascem as colunas que guardam versão e data/hora.
- **Conta de usuário** — cadastro, login, sessão e vínculo entre inscrição e associado
  são da change `cadastro-e-login`. A tabela desta change **não** ganha `usuario_id`
  agora; o vínculo vira migration quando aquela change definir a tabela de usuários.
- **Painel de quem lê as inscrições** — listagem, filtro, triagem e exportação ficam
  para `painel-admin` (V1.1). Ver o risco R1 abaixo.
- **Salvamento parcial / rascunho** — depende de conta criada. Decisão registrada na
  spec (D6): fica fora da V1.
- **Consulta do protocolo pela pessoa** ("acompanhe sua inscrição") — fora da V1.
- **Edição ou cancelamento da inscrição pela pessoa** — fora da V1; correção é por
  telefone com a sede.
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
  (`CLAUDE.md`). Mas cria a primeira tabela com dado pessoal do projeto.
- **Arquitetura/stack afetada?** Dentro do que o ADR-001 já decidiu (Workers + D1 +
  Drizzle). Três decisões novas são estruturais e viram ADR (ver abaixo).
- **Custo?** Zero. Volume esperado da associação cabe com folga no free tier do D1.
- **Dependências / quem é tocado:**
  - `consentimento-e-privacidade` → **bloqueia a publicação** desta change.
  - `cadastro-e-login` → destrava salvamento parcial e o vínculo inscrição↔associado
    (ambos fora da V1).
  - `cracha-do-associado` → dona do formato `APPD-<ano>-<sequencial>`; esta change usa
    **outro** espaço de numeração para não confundir protocolo com registro de
    associado.
  - `area-do-associado` → consome a tabela e o **vocabulário de status** que esta change
    define (`Na fila`, `Em atendimento`, `Encerrada`); mudar esses valores quebra o
    REQ-9 de lá.
  - `painel-admin` (V1.1) → consumidor dos dados gravados aqui e único autorizado a
    mudar status.
  - `site-institucional` → a tela já está no ar em modo demonstração; esta change
    remove o aviso de demonstração.

## Decisões que precisam virar ADR (rascunho meu, assinatura do dono)

1. **ADR-007 — Protocolo de inscrição em espaço de numeração próprio.** Proposta:
   `ATD-<ano>-<sequencial de 5 dígitos>`, derivado do `id` autoincrement, separado do
   `APPD-<ano>-<sequencial>` do crachá. Motivo: inscrição não é associação; o mesmo
   formato para as duas coisas envenena o `/verificar/<numero>` público. **Custo:** o
   mock de design e a tela de demonstração mostram `APPD-2026-00042` na confirmação e
   precisam trocar o prefixo (troca de texto, não de layout).
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
- **Contradição achada entre changes (bloqueia o gate, não a redação):** a tabela
  `consentimentos` de `consentimento-e-privacidade` tem `usuario_id` NOT NULL, e o
  formulário de atendimento é preenchido **sem conta** na V1. O aceite do Art. 11 feito
  aqui não cabe lá como está. Registrado no REQ-42 da spec, com dono e caminho de
  decisão. Nenhuma das duas specs resolve isso sozinha.
- **Risco R1 (P0, precisa de resposta da APPD):** ninguém lê as inscrições na V1 —
  `painel-admin` é V1.1. Um formulário que grava num banco que ninguém abre é pior do
  que um formulário honesto que manda ligar. **Pergunta para a associação:** quem recebe
  e como, enquanto o painel não existe? Enquanto não houver resposta, a change não é
  publicada em domínio da APPD.
- **Questão aberta (P0):** em quanto tempo a associação retorna o contato? A
  confirmação precisa dizer isso e **não vamos inventar prazo**. Sem resposta, a tela
  usa a frase honesta definida na spec (REQ-17).
- **Questão aberta:** "CADASTRO DE ATENDIMENTO 2026" tem o ano no nome
  (`docs/pendencias-appd.md`, item 11). Se a inscrição for por ciclo anual, falta uma
  coluna de ciclo. A spec grava o ano do recebimento, o que cobre o caso mínimo.

## Próximo passo no fluxo

proposal → **spec** (`spec.md`, nesta mesma pasta) → critério de aceite Gherkin (dentro
da spec) → tasks (`tasks.md`) → validação item a item → `openspec/archive/`.
