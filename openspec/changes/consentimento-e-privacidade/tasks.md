# Tasks: Consentimento específico do Art. 11 e privacidade do titular

Deriva de SPEC-consentimento-e-privacidade. Fatias verticais: cada uma entrega algo
verificável
e tem critério de aceite próprio. Dono padrão: Claude Code na execução, Arthur Barbero na
aprovação — quando for diferente, está escrito.

Ordem importa. T1 antes de qualquer código; T2 e T3 antes de qualquer tela.

## T1 — ADR-006: onde vive o texto das versões do termo

- Dono da decisão: Arquiteto (Arthur Barbero assina)
- Depende de: nada
- Entrega: `docs/adr/adr-006-<slug>.md` decidindo entre catálogo versionado no repo (com hash
  conferido em teste) e linhas em tabela no D1, com alternativas e consequências.
- Aceite: o ADR responde como a imutabilidade da versão publicada (REQ-2) é garantida e como o
  catálogo é lido em runtime no workerd. Sem esse ADR, T4 não começa.

## T2 — Levar PB-1 a PB-5 à APPD

- Dono: Arthur Barbero
- Depende de: nada. **Roda em paralelo com tudo.**
- Entrega: as cinco perguntas da seção "Pendências bloqueantes" da spec incorporadas a
  `docs/pendencias-appd.md`, marcadas P0, e levadas à associação.
- Aceite: cada PB tem resposta escrita, ou uma data marcada para a resposta. PB-1 e PB-2
  precisam de apoio jurídico da associação — não são decisão do projeto nem do dono do repo.

## T3 — Gerar e aprovar as duas telas no Claude Design

- Dono: Arthur Barbero (opera o canvas)
- Depende de: nada
- Entrega: `/privacidade` e `/seus-direitos`, geradas a partir de
  `docs/prompts-design/privacidade.md`, mais o handoff bundle. **As telas do fluxo de
  exclusão saíram** desta change (ADR-013) e são de `area-do-associado`.
- Aceite: as listas de "Aceite visual" do prompt, referentes a estas duas telas, todas
  marcadas. Nenhuma tela entra em código antes disso — é a regra central do `CLAUDE.md`.

## T4 — Catálogo de termos versionado, com verificação de integridade

- Depende de: T1
- Entrega: a versão `v1` do termo do Art. 11, o manifesto com `termo_id`, `versao`,
  `data_vigencia`, `tipo_mudanca` e `hash`, e a função de resolução de versão vigente.
- Aceite: passam os 9 cenários de "Versionamento do termo", incluindo o de imutabilidade e o
  de vigência futura. O teste de integridade fica vermelho se o texto de `v1` for alterado.
- Nota: o texto de `v1` precisa de revisão do dono antes de virar hash — depois de publicado,
  só se corrige com `v2`.

## T5 — Tabela `consentimentos` no D1 e migration

- Depende de: `cadastro-e-login` ter criado `usuarios` (bloqueio externo)
- Entrega: schema em `server/database/schema.ts` conforme o contrato de dados da spec, com a
  migration gerada por `npm run db:generate`, índice em `(usuario_id, termo_id, registrado_em)`.
- Aceite: a migration aplica limpo em banco local (`npm run db:aplicar:local`); teste prova
  que a linha gravada não contém IP nem user-agent (REQ-10) e que o registro é append-only (REQ-9).
  Seed só com dado fictício explícito.

## T6 — Gravação do aceite e recusa no servidor

- Depende de: T4, T5
- Entrega: a rota que grava o aceite e a validação de servidor que recusa envio sem
  consentimento válido ou com hash desconhecido.
- Aceite: passam os 8 cenários de "Consentimento específico e destacado", incluindo o 422 com
  cliente contornado, o "aceitar a política geral não vale", o hash exibido prevalecendo sobre
  o vigente, e a falha de banco que não deixa gravação parcial.

## T7 — Componente da caixa de consentimento

- Depende de: T3, T4
- Entrega: o controle separado, desmarcado por padrão, com rótulo de finalidade específica,
  erro ligado por `aria-describedby` e região `aria-live`, alvo de 44px com 8px de folga e
  rótulo clicável.
- Aceite: passam os cenários de caixa desmarcada, querystring que não pré-marca, envio
  bloqueado no cliente com resposta preservada e foco movido, e erro identificável em escala
  de cinza.
- Handoff para o Validador: este componente é o ponto único onde o consentimento pode nascer
  errado. Vale teste de regressão dedicado.

## T8 — Página `/privacidade`

- Depende de: T3
- Entrega: as 15 seções na ordem do prompt, sumário navegável, blocos "No termo da lei", e as
  marcações `[A CONFIRMAR]` de PB-1, PB-2, PB-4 e PB-5 no corpo do texto.
- Aceite: passam os 5 cenários de "Legibilidade da política" e os de acessibilidade da rota
  `/privacidade`. Teste que falha se aparecer prazo de retenção em dias, meses ou anos enquanto
  PB-1 estiver aberta.

## T9 — Página `/seus-direitos` e os direitos de leitura

- Depende de: T3, T5
- Entrega: um cartão por direito, o bloco "Como pedir" com os três canais, confirmação de
  existência de tratamento, cópia dos dados em JSON e apresentação em tela.
- Aceite: passam os 3 cenários de "Acesso, correção e portabilidade" e o de confirmação de
  existência. O JSON contém o histórico completo de eventos de consentimento.

## T10 — Revogação do consentimento

- Depende de: T5, T9
- Entrega: o cartão destacado, a tela de consequência e a gravação do evento `revogacao`.
- Aceite: passam os 3 cenários de "Revogação do consentimento" — dois cliques, conta
  preservada, histórico do aceite intacto.

## T11 — Conteúdo da tela de exclusão (a tela é de outra change)

- Depende de: T4, e da PB-1 para sair do `[A CONFIRMAR]`.
- Entrega: o **texto** que `area-do-associado` exibe em `/area/excluir` — o bloco "O que a
  associação precisa manter", com base legal item a item e prazo de conservação —, mais a
  gravação da linha de `evento = 'revogacao'` em `consentimentos`.
- **Não entrega**: a tela, o modal, os botões nem o fluxo. São de `area-do-associado`
  (ADR-013). Três changes escreviam esse fluxo antes; agora, uma.
- Aceite: passam os 3 cenários de "O conteúdo que a tela de exclusão exibe"; as linhas
  anteriores de `consentimentos` continuam intactas depois da exclusão.

## T12 — Proibição transversal do dado sensível

- Depende de: `cracha-do-associado` (bloqueio externo para a tela; o teste pode vir antes)
- Entrega: teste de regressão que varre a resposta de `/verificar/<numero>` — HTML, atributos,
  comentários, metadados e payload JSON — procurando qualquer valor do campo 12.
- Aceite: passam os 2 cenários de "O dado sensível nunca vaza para o público". O teste é
  bloqueante no CI: se alguém expuser o dado, o build quebra.

## T13 — Auditoria de acessibilidade das cinco telas

- Dono da execução: Validador (QA)
- Depende de: T8, T9, T11
- Entrega: axe automatizado nas rotas desta change, mais verificação manual de foco, alvo de
  44px com 8px de folga,
  ordem de foco, contraste do botão desabilitado e `prefers-reduced-motion`.
- Aceite: passam os 5 cenários de "Acessibilidade das cinco telas", incluindo os 5 exemplos do
  esquema de cenário. Zero violação de nível A ou AA. O veredito é do QA, não de quem
  implementou.

## T14 — Gate de validação e archive

- Dono: Arthur Barbero, com parecer do Validador
- Depende de: T4 a T13, e T2 respondida
- Entrega: validação item a item dos 41 cenários contra a entrega, e a movimentação de
  `openspec/changes/consentimento-e-privacidade/` para `openspec/archive/`.
- Aceite: **não passa** enquanto PB-1 a PB-5 estiverem abertas ou enquanto qualquer
  `[A CONFIRMAR]` de prazo, encarregado ou protocolo estiver no ar em página publicada no
  domínio da APPD. Reprovou um cenário, volta para a task de origem.

## Atualização de contexto ao fim

- `PROGRESS.md`: mover a change de "em aberto" para "feito", registrar as PBs que sobraram.
- `docs/pendencias-appd.md`: PB-1 a PB-5 incorporadas e atualizadas com as respostas.
- Skill `guardar-memoria`: registrar no vault a decisão de versionamento do termo e a de
  confirmação por caixa de seleção — as duas valem para além deste projeto.
