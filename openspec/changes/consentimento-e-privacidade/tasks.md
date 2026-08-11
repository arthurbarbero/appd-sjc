# Tasks: Consentimento específico do Art. 11 e privacidade do titular

Deriva de SPEC-consentimento-e-privacidade. Fatias verticais: cada uma entrega algo
verificável
e tem critério de aceite próprio. Dono padrão: Claude Code na execução, Arthur Barbero na
aprovação — quando for diferente, está escrito.

Ordem importa. T1 antes de qualquer código; T2 e T3 antes de qualquer tela.

## T1 [FEITO 2026-08-07] — ADR-006: onde vive o texto das versões do termo

- Dono da decisão: Arquiteto (Arthur Barbero assina)
- Depende de: nada
- Entrega: [`docs/adr/adr-006-conteudo-de-pagina-vive-no-codigo.md`](../../../docs/adr/adr-006-conteudo-de-pagina-vive-no-codigo.md).
- **Decisão do dono, 2026-08-07**: conteúdo de página vive no código, versionado no git;
  não existe conteúdo de página em banco de dados. Vale além do termo. A imutabilidade do
  REQ-2 passa a ser propriedade do git e da CI — o hash é conferido no `npm test`, sem
  código de runtime. O banco continua guardando o **aceite** (quem, qual hash, quando),
  que é registro de fato, não conteúdo.
- Aceite: atendido. **T4 destravada.**

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

## T4 [FEITO 2026-08-11] — Catálogo de termos versionado, com verificação de integridade

- Depende de: T1
- Entrega: a versão `v1` do termo do Art. 11, o manifesto com `termo_id`, `versao`,
  `data_vigencia`, `tipo_mudanca` e `hash`, e a função de resolução de versão vigente.
- Aceite: passam os 9 cenários de "Versionamento do termo", incluindo o de imutabilidade e o
  de vigência futura. O teste de integridade fica vermelho se o texto de `v1` for alterado.
- Nota: o texto de `v1` precisa de revisão do dono antes de virar hash — depois de publicado,
  só se corrige com `v2`.
- **Entregue** em `shared/termos.ts`: manifesto com os cinco campos, `validarCatalogo` (recusa
  no carregamento o que estiver fora de formato), `versaoVigente`, `versaoPorHash`,
  `precisaNovoAceite` e `conferirIntegridade`. 30 testes em `test/termos.spec.ts`.
- **O teste de integridade é bloqueante e detecta remoção**: além de conferir o hash declarado
  contra o texto, há um caso que adultera um catálogo de mentira e exige que a conferência
  acuse. Teste de integridade que não fica vermelho quando o texto muda é carimbo.
- **Ressalva, escrita em vez de escondida**: dos 9 cenários, o de "mudança material exige novo
  aceite" está fechado **na regra** (`precisaNovoAceite`, 7 testes) e **aberto na tela** — o
  aviso em destaque no próximo acesso autenticado é interface, e interface espera a T3. O
  cenário de "publicar versão nova não invalida aceite antigo" roda contra catálogo de teste:
  só existe uma versão publicada, e inventar uma `v2` de mentira no catálogo real seria pior
  que o gap.

## T5 [FEITO 2026-08-11] — Tabela `consentimentos` no D1 e migration

- Depende de: ~~`cadastro-e-login` ter criado `usuarios` (bloqueio externo)~~ — **o bloqueio
  caiu em 2026-08-07**: `usuarios` e `consentimentos` existem em `server/database/schema.ts`
  e nas migrations desde que `modelo-de-dados` foi arquivada (ADR-013 pôs tabela e coluna
  lá). O que resta aqui é **conferir** o schema contra o contrato de dados desta spec e
  percorrer o aceite abaixo, não criar tabela.
- Entrega: schema em `server/database/schema.ts` conforme o contrato de dados da spec, com a
  migration gerada por `npm run db:generate`, índice em `(usuario_id, termo_id, registrado_em)`.
- Aceite: a migration aplica limpo em banco local (`npm run db:migrate`); teste prova
  que a linha gravada não contém IP nem user-agent (REQ-10) e que o registro é append-only (REQ-9).
  Seed só com dado fictício explícito.
- **Conferido, não criado**: o schema já casava com o contrato — as oito colunas, o índice
  `(usuario_id, termo_id, registrado_em)` e os três `CHECK`. Nenhuma migration nova.
- **Entregue** em `test/consentimento.spec.ts`: as colunas são lidas do banco migrado (o que
  vale é o arquivo que vai para o D1), nenhuma delas guarda IP ou user-agent, nenhum `values`
  de consentimento cita cabeçalho, e a varredura de `server/**` prova que não existe `UPDATE`
  nem `DELETE` sobre a tabela — em Drizzle ou em SQL solto.

## T6 [FEITO 2026-08-11] — Gravação do aceite e recusa no servidor

- Depende de: T4, T5
- Entrega: a rota que grava o aceite e a validação de servidor que recusa envio sem
  consentimento válido ou com hash desconhecido.
- Aceite: passam os 8 cenários de "Consentimento específico e destacado", incluindo o 422 com
  cliente contornado, o "aceitar a política geral não vale", o hash exibido prevalecendo sobre
  o vigente, e a falha de banco que não deixa gravação parcial.
- **Entregue**: `termoHash` entra no contrato do envio (`shared/inscricao.ts`), a tela manda o
  hash da versão que resolveu ao abrir, e `cadastro.post.ts` grava a versão **resolvida pelo
  hash exibido** — não a vigente no instante do POST. Hash fora do catálogo é 422 pedindo
  releitura. Os dois 422 rodam no workerd real, no `npm run aceite`.
- **Defeito consertado junto**: `excluir.post.ts` gravava a revogação com `versao: 'v1'` fixa e
  `hash` de 64 zeros — o marcador de lugar que já tinha saído do cadastro em 2026-08-07,
  sobrevivendo aqui. Agora a revogação aponta para o termo que a pessoa aceitou, lido do
  histórico dela.
- **Ressalva**: o bloco 7 do formulário exibe hoje uma **paráfrase** do termo, não o texto do
  catálogo. O hash gravado é o do texto do catálogo, então "hash do que foi exibido" só fica
  literalmente verdadeiro quando a T7 trocar aquele bloco pelo componente que renderiza o
  texto versionado. Enquanto isso, a versão registrada está certa e o que está em tela diz a
  mesma coisa em outras palavras — mas as palavras não são as mesmas, e isso fica escrito.

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
- **Metade entregue em 2026-08-11**: a gravação da revogação está correta (aponta para o termo
  que a pessoa aceitou) e o cenário das linhas anteriores intactas está coberto pela varredura
  de append-only da T5. O que falta é o **texto** do bloco "O que a associação precisa manter",
  e ele depende da PB-1 — prazo de conservação não se inventa.

## T12 [FEITO 2026-08-11] — Proibição transversal do dado sensível

- Depende de: `cracha-do-associado` (bloqueio externo para a tela; o teste pode vir antes)
- Entrega: teste de regressão que varre a resposta de `/verificar/<numero>` — HTML, atributos,
  comentários, metadados e payload JSON — procurando qualquer valor do campo 12.
- Aceite: passam os 2 cenários de "O dado sensível nunca vaza para o público". O teste é
  bloqueante no CI: se alguém expuser o dado, o build quebra.
- **Entregue em três camadas**, que pegam coisas diferentes: `test/vazamento.spec.ts` lê o
  **fonte** das rotas e barra a intenção errada antes de virar resposta (projeção coluna a
  coluna, consulta ao campo 12 só dentro da condicional do consentimento); o `npm run aceite`
  varre o **DOM hidratado** e o **JSON da API**; e agora também o **HTML como o servidor
  manda**, antes de qualquer JavaScript — dado que viaja no payload e some na hidratação já
  viajou, e quem lê o fonte da página o encontra.
- Os dois cenários rodam com o opt-in nos dois estados: sem consentimento o tipo não aparece
  em lugar nenhum; com consentimento aparece, porque o ADR-019 decidiu que o consentimento
  governa os dois destinos.

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
