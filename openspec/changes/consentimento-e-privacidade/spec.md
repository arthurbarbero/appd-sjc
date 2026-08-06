# Spec: Consentimento específico do Art. 11 e privacidade do titular

- ID: SPEC-consentimento-e-privacidade Deriva de: PROP-20260805-consentimento-e-privacidade
- Dono do conteúdo: Arthur Barbero Aprovador da spec: Arthur Barbero
- Versão: v2 Data: 2026-08-06 Status: rascunho
- **Fonte da verdade das tabelas**: [`modelo-de-dados`](../modelo-de-dados/spec.md)

> **v2 (2026-08-06)** — reescrita contra o contrato de dados, depois do gate. Mudou:
> `usuario_id NOT NULL` passou a ser exequível (ADR-012); o fluxo de exclusão foi cedido
> para `area-do-associado` (ADR-013), ficando aqui só o conteúdo que a tela exibe; e a
> ambiguidade "exigir × pedir" do REQ-11 foi resolvida (bloqueio B9 do gate).

## Objetivo

Entregar o consentimento específico e destacado para o dado de saúde coletado no campo 12 do
formulário, com registro versionado do aceite, e as duas telas onde a pessoa entende e exerce
os direitos sobre os próprios dados.

## Base legal citada (verificada na fonte)

Todos os dispositivos abaixo foram conferidos no texto compilado da **Lei 13.709/2018 (LGPD)**
em `planalto.gov.br`, em 2026-08-05. Nenhum artigo é citado nesta spec sem essa conferência.

| Dispositivo   | O que sustenta                                                         |
| ------------- | ---------------------------------------------------------------------- |
| Art. 5º, II   | dado referente à saúde é dado pessoal sensível                         |
| Art. 8º, §1º  | consentimento por escrito em cláusula destacada das demais             |
| Art. 8º, §4º  | finalidades determinadas; autorização genérica é nula                  |
| Art. 8º, §5º  | revogação a qualquer momento, gratuita e facilitada; ratifica anterior |
| Art. 8º, §6º  | alteração de informação exige informar o titular, com destaque         |
| Art. 9º       | acesso facilitado às informações sobre o tratamento (incisos I a VII)  |
| Art. 9º, §2º  | mudança de finalidade incompatível exige informar antes                |
| Art. 11, I    | dado sensível: consentimento específico e destacado, fins específicos  |
| Art. 16       | eliminação após o término, com as hipóteses de conservação I a IV      |
| Art. 18, I-IX | os direitos do titular                                                 |
| Art. 18, VIII | informação sobre a consequência de não consentir                       |
| Art. 19, I-II | confirmação/acesso: imediato simplificado ou até 15 dias completo      |
| Art. 41       | indicação do encarregado e divulgação pública do contato               |

> O prazo de 15 dias do Art. 19 vale para **confirmação de existência e acesso**, não para
> todos os direitos do Art. 18. A spec não estende esse prazo aos demais direitos, e a tela não
> pode dar a entender que ele vale para tudo.

## Requisitos

Cada REQ é verificável por um cenário de aceite. A coluna de rastreabilidade está no fim.

### Termo versionado

- **REQ-1**: O sistema DEVE manter um catálogo de versões do termo de consentimento do Art. 11,
  em que cada versão tem: `termo_id` (identificador do termo), `versao` (string monotônica,
  formato `vN`), `data_vigencia` (data ISO-8601), `tipo_mudanca` (`material` ou `editorial`) e
  `hash` (SHA-256 do texto exato, em hexadecimal minúsculo).
- **REQ-2**: O sistema DEVE tratar versão publicada como **imutável**: alterar o texto de uma
  versão já vigente faz o hash divergir do declarado, e a verificação de integridade DEVE
  falhar (teste automatizado bloqueante). Correção de texto se faz publicando versão nova.
- **REQ-3**: O sistema DEVE considerar vigente, em um instante `t`, a versão de maior
  `data_vigencia` menor ou igual a `t`. Versão com `data_vigencia` no futuro NÃO é exigida
  antes dessa data.
- **REQ-4**: A publicação de versão nova NÃO DEVE alterar, apagar nem invalidar nenhum registro
  de aceite existente (Art. 8º, §5º).

### Consentimento

- **REQ-5**: A caixa de seleção do consentimento do Art. 11 DEVE ser um controle **próprio,
  separado e desmarcado por padrão**, com rótulo que nomeia a finalidade específica. Ela NÃO
  DEVE compartilhar controle, `name` nem submissão com qualquer outro aceite (termos de uso,
  política geral, comunicação), e NÃO DEVE poder ser pré-marcada por parâmetro de URL, valor
  padrão de servidor ou `checked` no HTML (Art. 8º, §1º e §4º; Art. 11, I).
- **REQ-6**: Com a caixa desmarcada, o cliente NÃO DEVE enviar o formulário e DEVE exibir erro
  associado ao próprio controle, com texto que explica **por que** o consentimento é necessário
  e **qual é a consequência de não consentir** (Art. 18, VIII).
- **REQ-7**: O servidor DEVE recusar, com HTTP 422 e corpo indicando o campo, qualquer envio sem
  consentimento válido — mesmo que o cliente tenha sido contornado. O servidor nunca confia no
  cliente.
- **REQ-8**: No aceite, o sistema DEVE gravar uma linha na tabela `consentimentos` com:
  `usuario_id`, `termo_id`, `versao`, `hash` do texto exibido, `evento = 'aceite'`,
  `registrado_em` (ISO-8601 em UTC, com precisão de segundo) e `origem` (rota de onde veio).
- **REQ-9**: A tabela `consentimentos` DEVE ser **append-only** na aplicação: revogação e
  re-aceite geram linhas novas; o código NÃO DEVE executar `UPDATE` nem `DELETE` sobre linhas
  de evento já gravadas, exceto na execução de um pedido de exclusão (REQ-17).
- **REQ-10**: O sistema NÃO DEVE gravar endereço IP nem user-agent no registro de consentimento
  — o registro precisa de versão, momento e origem, e nada além disso.
- **REQ-11**: Quando a versão vigente muda e o `tipo_mudanca` é `material`, o sistema DEVE
  **pedir** novo aceite de quem já tem conta, exibindo o aviso da alteração no próximo acesso
  autenticado, com o teor do que mudou em destaque (Art. 8º, §6º; Art. 9º, §2º).

  O aviso é **dispensável, não bloqueante**: a pessoa fecha e continua usando a conta, e o
  tratamento anterior permanece válido enquanto o novo aceite não vem. Ele **reaparece uma vez
  por sessão**, no primeiro acesso autenticado, até ser aceito ou até a versão mudar de novo.
  Não há limite de vezes: enquanto o aceite não vem, o pedido continua sendo devido.

  > **Bloqueio B9 do gate.** A v1 dizia "DEVE exigir" no requisito e "o sistema pede" no
  > cenário. Exigir e pedir são coisas diferentes: um leitor implementaria modal bloqueante,
  > outro um aviso dispensável — e não havia cenário para o caso mais provável, que é a pessoa
  > fechar o aviso e seguir. Bloqueante está errado aqui: travar a conta de quem não aceitou
  > um termo novo é coagir consentimento, o oposto do que o Art. 8º pede.

- **REQ-12**: Quando o `tipo_mudanca` é `editorial`, o sistema NÃO DEVE exigir novo aceite de
  quem já aceitou versão anterior.
- **REQ-13**: A revogação do consentimento DEVE estar a no máximo **dois cliques** de
  `/seus-direitos`, ser gratuita, registrar `evento = 'revogacao'` e **não** apagar a conta
  (Art. 8º, §5º; Art. 18, IX). Antes de confirmar, a tela DEVE informar a consequência concreta
  em texto, sem tom de ameaça.

### Direitos do titular

- **REQ-14**: `/seus-direitos` DEVE oferecer, cada um com título em linguagem simples e um
  verbo de ação: confirmação de existência de tratamento, acesso aos dados, correção,
  portabilidade, informação sobre compartilhamento, revogação do consentimento e exclusão
  (Art. 18, I a IX).
- **REQ-15**: O pedido de **cópia dos dados** DEVE entregar, para a pessoa autenticada, um
  arquivo JSON legível por máquina contendo todos os campos pessoais armazenados e o histórico
  completo de eventos de consentimento (versão, hash, evento, data e hora), mais uma
  apresentação em tela do mesmo conteúdo. A foto do crachá entra como arquivo separado, nunca
  embutida em endereço público.
- **REQ-16**: A **correção** de dado DEVE gravar o valor novo e registrar data e hora da
  alteração, sem exigir contato por outro canal para os campos que a pessoa mesma preencheu.
- **REQ-17**: **O fluxo de exclusão não é desta change** (ADR-013). A tela `/area/excluir` é de
  `area-do-associado` e o contrato do que é apagado está em
  [`modelo-de-dados`](../modelo-de-dados/spec.md) REQ-28, escrito uma vez só.

  > A v1 tinha três telas (pedido, confirmação, recibo) e uma caixa de seleção; `cadastro-e-login`
  > tinha uma página e duas caixas; `area-do-associado` tinha outra coisa. Três contratos para a
  > mesma tela — bloqueios B6 e B23 do gate. O dono decidiu em 2026-08-06: **uma página, um
  > modal de confirmação**. E o REQ-17 da v1 era, além disso, **inexequível**: mandava apagar o
  > tipo de deficiência sem chave para achá-lo (B7), o que só se resolveu com o ADR-012.

  O que continua sendo desta change é o **conteúdo** que a tela exibe: o que é retido, por quê,
  e a base legal de cada item (Art. 16, I), com o prazo de conservação. Enquanto a APPD não
  definir (PB-1), o texto traz `[A CONFIRMAR]` **no corpo**, e nem esta change nem
  `area-do-associado` passam no gate de archive.

- **REQ-18**: Executada a exclusão, esta change DEVE gravar uma linha nova em `consentimentos`
  com `evento = 'revogacao'`. As linhas anteriores **permanecem intactas** — são a prova de que
  o tratamento teve base legal, e por isso a FK não tem `ON DELETE CASCADE`
  (`modelo-de-dados` REQ-25).
- **REQ-19**: Não há recibo em rota própria nem número de protocolo. A confirmação é um bloco na
  mesma página, com data, hora e o telefone para cobrar caso algo não aconteça. **PB-5 fica sem
  objeto**: o `numero_registro` já identifica a pessoa, e o projeto não tem segundo espaço de
  numeração (ADR-012).
- **REQ-20**: Cancelar NÃO DEVE gravar nada. Requisito da tela de `area-do-associado`; fica aqui
  como contrato que aquela change consome.

### As duas páginas

- **REQ-21**: `/privacidade` DEVE ter as 15 seções na ordem definida em
  `docs/prompts-design/privacidade.md`, com sumário navegável visível (aberto no mobile, nunca
  atrás de botão) e cada seção começando pela explicação em linguagem simples, com o
  dispositivo legal depois, em bloco secundário rotulado "No termo da lei".
- **REQ-22**: Nenhuma seção DEVE ter parágrafo com mais de 5 linhas renderizadas, texto em duas
  colunas, texto justificado, acordeão fechado escondendo conteúdo, ou numeração de cláusula.
- **REQ-23**: As páginas NÃO DEVEM publicar prazo de retenção, nome ou contato de encarregado,
  prazo operacional de resposta ou formato de protocolo que não tenham sido decididos pela
  APPD. Onde falta decisão, a marcação `[A CONFIRMAR]` aparece no corpo do texto, com contraste
  igual ao do texto ao redor.
- **REQ-24**: `/privacidade` DEVE declarar explicitamente que o tipo de deficiência não aparece
  no crachá sem opt-in e **nunca** aparece na verificação pública, e que a foto do crachá nunca
  é publicada em endereço aberto.

### Proibição transversal

- **REQ-25**: A resposta de `/verificar/<numero>` NÃO DEVE conter tipo de deficiência, sob
  nenhuma forma — nem no corpo renderizado, nem no HTML, nem no JSON, nem em metadado. O crachá
  só exibe o dado mediante opt-in próprio, separado do consentimento de coleta.

### Acessibilidade (bloqueante — WCAG 2.2 AA)

- **REQ-26**: Cada uma das cinco telas (`/privacidade`, `/seus-direitos` e as três do fluxo de
  exclusão) DEVE ter exatamente um `h1`, hierarquia de títulos sem pular nível, e a ordem do
  sumário igual à ordem dos `h2`.
- **REQ-27**: Todo elemento focável DEVE ter foco visível de 3px em `#0f4c93` com 2px de folga,
  e todo o fluxo DEVE ser operável só por teclado, sem armadilha de foco.
- **REQ-28**: Todo alvo interativo DEVE ter no mínimo 44x44 CSS px, incluindo o rótulo clicável
  da caixa de seleção de consentimento e o da confirmação de exclusão.
- **REQ-29**: Toda mensagem de erro DEVE estar ligada ao campo por `aria-describedby`, ser
  anunciada em região `aria-live="polite"`, e usar texto + ícone — nada sinalizado só por cor.
- **REQ-30**: Corpo de texto em 17px, nada abaixo de 15px, largura de linha entre 60 e 75
  caracteres, e `prefers-reduced-motion` respeitado.

## Comportamento esperado

**Caminho feliz (consentir)** — a pessoa autenticada abre o formulário, lê o bloco do
consentimento, marca a caixa desmarcada, envia. O servidor valida, grava uma linha em
`consentimentos` com versão vigente, hash e carimbo UTC, e prossegue com a inscrição.

**Caminho feliz (mudar de ideia)** — a pessoa abre `/seus-direitos`, escolhe "Retirar o
consentimento", lê a consequência, confirma. Grava-se `evento = 'revogacao'`; a conta continua
existindo; o aceite anterior continua na tabela como histórico.

**Bordas e falhas:**

- Consentimento desmarcado → erro no próprio campo, resposta preservada, foco movido para o
  controle com problema. Nunca "erro no formulário".
- Cliente contornado → 422 do servidor, sem gravação parcial.
- Versão vigente muda entre a renderização da tela e o envio → o servidor grava a versão cujo
  **hash foi efetivamente exibido** à pessoa, não a versão vigente no instante do POST. Se o
  hash enviado não existir no catálogo, recusa com 422 e pede releitura do termo.
- Duas abas abertas, aceite enviado duas vezes → duas linhas de `aceite` para a mesma versão
  é ruído aceitável, não erro; a leitura sempre considera o **último** evento por `termo_id`.
- Pedido de exclusão de quem tem inscrição ativa na fila → a tela avisa, antes de confirmar,
  que a pessoa sai da fila e que o crachá deixa de ser verificado.
- Banco indisponível no momento do aceite → a inscrição **não** é aceita; a pessoa vê erro que
  diz para tentar de novo, e nada é gravado. Consentimento gravado pela metade é pior que
  nenhum.

## Contrato de dados — tabela `consentimentos`

**Não mora aqui.** As colunas, tipos e restrições estão em
[`modelo-de-dados`](../modelo-de-dados/spec.md) REQ-21 a REQ-25. Esta change é a **dona do
comportamento**: quem grava aceite, quem grava revogação, e a garantia de que a tabela é
append-only na aplicação.

Três coisas mudaram em relação à v1, e todas vêm do ADR-012:

1. **`usuario_id NOT NULL` passou a ser exequível.** O formulário de atendimento cria a conta,
   então toda inscrição pertence a um usuário. Era o bloqueio B5, que arrastava junto o B7
   (apagar o tipo de deficiência sem chave) e o B17 (listar "minhas inscrições" sem vínculo).
2. **As colunas de consentimento saíram de `inscricoes_atendimento`.** O aceite mora só aqui.
   Dois registros do mesmo aceite é o começo de dois históricos que divergem — e faria a
   revogação do REQ-13 não alcançar a inscrição, que é justamente onde o dado sensível está.
3. **Não há coluna `protocolo`.** Ela existiria para ancorar o aceite de quem não tem conta;
   com o cadastro embutido, ficou sem função.

## Fora de escopo (explícito)

Repetido da proposal porque é aqui que corta scope creep: **não** entra a coleta dos 15 campos
(`formulario-atendimento`), **não** entra a conta (`cadastro-e-login`), **não** entram o crachá
e a tela de verificação (`cracha-do-associado` — aqui só a proibição de expor o dado), **não**
entra a rota `/certificados` (fora do escopo do site novo, decisão do dono de 2026-08-05),
**não** entra o texto do presidente em `/sobre` (`site-institucional`), **não** entra painel
administrativo (V1.1), **não** entra envio de e-mail, e **não** entram anonimização e bloqueio
automatizados (Art. 18, IV).

## Premissas e dependências

- `usuarios.id` existe (change `cadastro-e-login`). Enquanto não existir, o registro de aceite
  não pode ser implementado — só o catálogo de termos e as duas páginas estáticas.
- Design das telas em `docs/prompts-design/privacidade.md`; **nenhuma tela é implementada antes
  do design aprovado no Claude Design** (regra central do `CLAUDE.md`).
- Onde vive o texto das versões do termo é decisão de arquitetura → **ADR-006**, antes do
  código.
- Runtime: Cloudflare Workers + D1 (ADR-001). SHA-256 via WebCrypto, disponível no workerd.

## Pendências bloqueantes

Nenhuma delas se inventa. Nenhuma delas impede escrever o código; **todas** impedem o gate de
archive desta change e a publicação no domínio da APPD.

### PB-1 — Prazo de retenção e a obrigação legal que o justifica

- **Pergunta**: por quanto tempo a associação precisa guardar a ficha de atendimento depois que
  a pessoa pede exclusão, e **qual norma** obriga isso? O Art. 16, I autoriza conservar para
  cumprir obrigação legal ou regulatória — mas não diz qual é a obrigação nem por quanto tempo,
  e isso depende da atividade da APPD.
- **Trava**: REQ-17 e a seção 9 de `/privacidade`. Precisa de apoio jurídico da associação.
- **Enquanto isso**: `[A CONFIRMAR]` no corpo do texto. Nenhum prazo é inventado.

### PB-2 — Encarregado (DPO) e canal de contato

- **Pergunta**: quem é o encarregado pelo tratamento de dados? Ou a APPD se enquadra como
  agente de tratamento de pequeno porte, dispensado da indicação pela Resolução CD/ANPD
  nº 2/2022 — hipótese a ser **confirmada com apoio jurídico**, porque essa dispensa está em
  regulamento da ANPD, não na lei. Em qualquer cenário, qual canal de contato publicamos?
- **Trava**: REQ-23 e a seção 3 de `/privacidade` (Art. 41, §1º exige divulgação pública).
- **Enquanto isso**: `[A CONFIRMAR]` no lugar do nome e do contato.

### PB-3 — Destino dos 37 certificados individuais

- **Pergunta**: os PDFs com nomes de participantes seguem públicos e indexáveis no site atual
  (risco R1 de `docs/pendencias-appd.md`). A APPD despublica, restringe a quem se identifica,
  ou mantém como está?
- **Trava**: nada nesta change — o dono decidiu em 2026-08-05 que a rota fica fora do escopo do
  site novo. Fica registrado porque o site antigo continua no ar enquanto o novo é construído.

### PB-4 — Prazo operacional de resposta e quem responde

- **Pergunta**: quem atende os pedidos de titular na associação, e em quanto tempo a APPD se
  compromete a responder? O Art. 19 fixa prazo para confirmação e acesso; para os demais
  direitos, o compromisso é da associação.
- **Trava**: REQ-23 e o bloco "Como pedir" de `/seus-direitos`.
- **Enquanto isso**: a tela cita o prazo do Art. 19 como referência da lei e marca o
  compromisso operacional como `[A CONFIRMAR]`.

### PB-5 — Formato do número de protocolo (SEM OBJETO desde 2026-08-06)

- **Pergunta**: existe número de protocolo para pedido de titular? Qual formato?
- **Trava**: nenhuma. O ADR-012 eliminou o protocolo: com o cadastro embutido no
  formulário, o `numero_registro` já identifica a pessoa e o projeto não tem segundo espaço
  de numeração. Fica registrada para quem for ler o parecer do gate e procurar por ela.
- **Enquanto isso**: `[A CONFIRMAR]`. Formato de protocolo não se inventa.

## Critério de aceite (Gherkin)

### Funcionalidade: Consentimento específico e destacado

```gherkin
Cenário: A caixa de consentimento nasce desmarcada e separada
  Cobre REQ-5
  Dado que a versão vigente do termo "deficiencia-art11" é "v1"
  Quando uma pessoa autenticada abre o formulário de atendimento
  Então a caixa de consentimento do dado de deficiência aparece desmarcada
  E ela é um controle próprio, sem compartilhar name nem submissão com outro aceite
  E o rótulo nomeia a finalidade específica do tratamento

Cenário: Parâmetro de URL não pré-marca o consentimento
  Cobre REQ-5
  Dado que uma pessoa autenticada abre o formulário com a querystring "?consentimento=1"
  Quando a página termina de carregar
  Então a caixa de consentimento continua desmarcada

Cenário: Envio bloqueado no cliente com o consentimento desmarcado
  Cobre REQ-6, REQ-29
  Dado que uma pessoa preencheu os 15 campos e deixou a caixa de consentimento desmarcada
  Quando ela aciona "Enviar"
  Então o envio não acontece
  E aparece um erro ligado à caixa por aria-describedby, anunciado em região aria-live
  E o texto do erro diz por que o consentimento é necessário e o que acontece sem ele
  E as respostas já preenchidas permanecem no formulário
  E o foco vai para a caixa de consentimento

Cenário: Servidor recusa envio sem consentimento mesmo com o cliente contornado
  Cobre REQ-7
  Dado um POST direto para a rota de inscrição, sem o campo de consentimento
  Quando o servidor processa a requisição
  Então a resposta é HTTP 422 indicando o campo de consentimento
  E nenhuma linha é gravada em "consentimentos"
  E nenhuma inscrição é gravada

Cenário: Aceitar a política geral não vale como consentimento do Art. 11
  Cobre REQ-5, REQ-7
  Dado um POST com o aceite dos termos gerais e sem o consentimento do dado de deficiência
  Quando o servidor processa a requisição
  Então a resposta é HTTP 422 indicando o campo de consentimento
  E nenhuma linha é gravada em "consentimentos"

Cenário: O aceite grava versão do termo, hash e data e hora
  Cobre REQ-8, REQ-10
  Dado que a versão vigente do termo "deficiencia-art11" é "v1", com hash "<hash-v1>"
  E que a pessoa "usuario-1" marcou a caixa de consentimento
  Quando ela envia o formulário com sucesso
  Então existe exatamente uma linha em "consentimentos" com usuario_id "usuario-1",
        termo_id "deficiencia-art11", versao "v1", hash "<hash-v1>" e evento "aceite"
  E registrado_em está em ISO-8601 UTC com precisão de segundo
  E origem registra a rota de onde veio o envio
  E a linha não contém endereço IP nem user-agent

Cenário: Marcar e desmarcar antes de enviar não grava nada
  Cobre REQ-8
  Dado que a pessoa marcou e depois desmarcou a caixa de consentimento
  Quando ela sai da página sem enviar
  Então nenhuma linha é gravada em "consentimentos"

Cenário: Falha do banco no aceite não deixa consentimento pela metade
  Cobre REQ-8
  Dado que a gravação em "consentimentos" falha
  Quando a pessoa envia o formulário com o consentimento marcado
  Então a inscrição não é gravada
  E a pessoa vê um erro que pede para tentar novamente
  E nenhuma linha parcial permanece em "consentimentos"
```

### Funcionalidade: Versionamento do termo

```gherkin
Cenário: Toda versão do catálogo declara os campos obrigatórios
  Cobre REQ-1
  Dado o catálogo de versões do termo "deficiencia-art11"
  Quando o catálogo é carregado
  Então cada versão tem termo_id, versao no formato "vN", data_vigencia em ISO-8601,
        tipo_mudanca igual a "material" ou "editorial", e hash SHA-256 em hexadecimal
        minúsculo
  E o carregamento falha se qualquer um desses campos estiver ausente ou fora do formato

Cenário: Publicar versão nova não invalida aceite antigo
  Cobre REQ-4
  Dado que "usuario-1" aceitou a versão "v1" em "2026-08-10T10:00:00Z"
  Quando a versão "v2" é publicada com data_vigencia "2026-09-01"
  Então a linha de aceite de "usuario-1" continua com versao "v1" e o mesmo registrado_em
  E nenhuma linha existente em "consentimentos" foi alterada nem apagada
  E o tratamento dos dados de "usuario-1" permanece válido

Cenário: Quem se cadastra depois da vigência recebe a versão nova
  Cobre REQ-3
  Dado que "v2" tem data_vigencia "2026-09-01"
  Quando uma pessoa abre o formulário em "2026-09-02"
  Então o termo exibido é a versão "v2"
  E o aceite dela grava versao "v2"

Cenário: Versão com vigência futura ainda não é exigida
  Cobre REQ-3
  Dado que "v2" tem data_vigencia "2026-09-01"
  Quando uma pessoa abre o formulário em "2026-08-20"
  Então o termo exibido é a versão "v1"

Cenário: Mudança material exige novo aceite de quem já tem conta
  Cobre REQ-11
  Dado que "usuario-1" aceitou a versão "v1"
  E que a versão "v2", vigente, foi publicada com tipo_mudanca "material"
  Quando "usuario-1" faz o próximo acesso autenticado
  Então ele vê um aviso em destaque com o teor do que mudou
  E o sistema pede o aceite da versão "v2"
  E, enquanto ele não aceita, a conta continua acessível e o aceite de "v1" segue registrado

Cenário: Mudança editorial não exige novo aceite
  Cobre REQ-12
  Dado que "usuario-1" aceitou a versão "v1"
  E que a versão "v2", vigente, foi publicada com tipo_mudanca "editorial"
  Quando "usuario-1" faz o próximo acesso autenticado
  Então nenhum novo aceite é pedido
  E nenhuma linha nova é gravada em "consentimentos"

Cenário: Texto de versão publicada é imutável
  Cobre REQ-2
  Dado que a versão "v1" declara o hash "<hash-v1>"
  Quando o texto do arquivo da versão "v1" é alterado
  Então a verificação de integridade do catálogo falha
  E o teste automatizado de integridade fica vermelho

Cenário: Aceite de hash desconhecido é recusado
  Cobre REQ-2, REQ-7
  Dado um POST cujo hash de termo não existe no catálogo
  Quando o servidor processa a requisição
  Então a resposta é HTTP 422 pedindo releitura do termo
  E nenhuma linha é gravada em "consentimentos"

Cenário: Vale o hash que foi exibido, não o vigente no instante do envio
  Cobre REQ-8
  Dado que a pessoa abriu o formulário exibindo a versão "v1"
  E que "v2" entrou em vigência antes de ela clicar em "Enviar"
  Quando ela envia o formulário
  Então a linha gravada registra versao "v1" e o hash exibido a ela
```

### Funcionalidade: Revogação do consentimento

```gherkin
Cenário: Revogar está a no máximo dois cliques e não apaga a conta
  Cobre REQ-13
  Dado que "usuario-1" está autenticado em "/seus-direitos"
  Quando ele aciona "Retirar o consentimento" e confirma
  Então a revogação foi concluída em no máximo dois cliques a partir de "/seus-direitos"
  E é gravada uma linha com evento "revogacao" e registrado_em em ISO-8601 UTC
  E a conta de "usuario-1" continua existindo e acessível
  E nenhum custo é cobrado no processo

Cenário: A consequência da revogação é informada antes de confirmar
  Cobre REQ-13
  Dado que "usuario-1" abriu o cartão "Retirar o consentimento"
  Quando a tela é exibida
  Então o texto informa que sem esse dado a associação pode não conseguir organizar o
        atendimento
  E o texto informa que retirar o consentimento não apaga a conta

Cenário: Revogação preserva o histórico do aceite anterior
  Cobre REQ-9
  Dado que "usuario-1" tem uma linha de evento "aceite" da versão "v1"
  Quando ele revoga o consentimento
  Então a linha de "aceite" continua na tabela, inalterada
  E existem duas linhas para "usuario-1": "aceite" e "revogacao"
  E a leitura do estado atual considera o último evento por termo_id
```

### Funcionalidade: O conteúdo que a tela de exclusão exibe

A **tela** é de `area-do-associado` (ADR-013). Os cenários abaixo verificam só o que é
contrato desta change: o texto do que é retido, a base legal e o registro da revogação.

```gherkin
Cenário: O bloco do que é retido cita a base legal item a item
  Cobre REQ-17, REQ-23
  Dado que "usuario-1" abre a tela de exclusão da conta
  Quando a tela é exibida
  Então o bloco "O que a associação precisa manter" lista cada item com a base legal
  E o que a lei obriga a guardar, e por quanto tempo, aparece marcado "[A CONFIRMAR]" no
        corpo do texto enquanto a PB-1 não for respondida
  E o texto não usa tom de ameaça nem sugere que a exclusão é desaconselhada

Cenário: A exclusão registra a revogação sem apagar o histórico
  Cobre REQ-18
  Dado que "usuario-1" tem duas linhas em "consentimentos", um aceite e uma alteração
  Quando a exclusão da conta é executada
  Então as duas linhas anteriores continuam intactas
  E existe uma terceira linha com evento "revogacao"
  E nenhuma linha de "consentimentos" foi apagada nem alterada

Cenário: Não há recibo em rota própria nem protocolo inventado
  Cobre REQ-19, REQ-23
  Dado que "usuario-1" confirmou a exclusão
  Quando a confirmação é exibida
  Então ela é um bloco na mesma página, não uma rota nova
  E mostra a data, a hora e o telefone para cobrar se nada acontecer
  E nenhum número de protocolo é gerado
```

### Funcionalidade: Acesso, correção e portabilidade

```gherkin
Cenário: A cópia dos dados inclui o histórico de consentimentos
  Cobre REQ-15
  Dado que "usuario-1" tem um evento "aceite" da versão "v1" e um evento "revogacao"
  Quando ele pede a cópia dos seus dados
  Então ele recebe um arquivo JSON com todos os campos pessoais armazenados
  E o JSON contém os dois eventos, cada um com versao, hash, evento e registrado_em
  E a tela apresenta, sem baixar arquivo, os mesmos campos do JSON: para cada evento,
        a versão, o hash, o tipo do evento e a data e hora
  E a foto do crachá vem como arquivo separado, sem endereço público

Cenário: Corrigir um dado grava o valor novo com data e hora
  Cobre REQ-16
  Dado que "usuario-1" tem o telefone "(12) 3346-0000" cadastrado
  Quando ele corrige o telefone para "(12) 3346-0605" pela área do associado
  Então o valor armazenado passa a ser "(12) 3346-0605"
  E a data e a hora da alteração ficam registradas
  E não é exigido contato por outro canal para concluir a correção

Cenário: Confirmação de existência de tratamento é respondida na tela
  Cobre REQ-14
  Dado que "usuario-1" está autenticado em "/seus-direitos"
  Quando ele aciona "Confirmar que a APPD tem dados meus"
  Então a tela responde se há ou não tratamento de dados dele
  E o texto cita o prazo do Art. 19 apenas como referência da lei, aplicado à confirmação
        e ao acesso
  E o compromisso operacional da associação aparece como "[A CONFIRMAR]" enquanto a PB-4
        não for respondida
```

### Funcionalidade: Legibilidade da política

```gherkin
Cenário: O sumário é navegável e leva a um alvo focável
  Cobre REQ-21, REQ-27
  Dado que uma pessoa abre "/privacidade"
  Quando ela aciona um item do sumário "Nesta página"
  Então a navegação vai para a seção correspondente
  E o alvo recebe foco visível
  E a ordem dos itens do sumário é igual à ordem dos h2 da página

Cenário: O sumário fica aberto no mobile
  Cobre REQ-21
  Dado um viewport de 360px de largura
  Quando "/privacidade" carrega
  Então o sumário está visível e expandido
  E não está escondido atrás de um botão

Cenário: Linguagem simples antes do termo jurídico
  Cobre REQ-21, REQ-22
  Dado que uma pessoa abre "/privacidade"
  Quando ela lê qualquer seção
  Então a primeira coisa da seção é a explicação em linguagem simples
  E o dispositivo legal aparece depois, em bloco rotulado "No termo da lei"
  E nenhum parágrafo passa de cinco linhas renderizadas
  E nenhum conteúdo está em acordeão fechado, em duas colunas ou justificado
  E não há numeração de cláusula do tipo "4.2.1"

Cenário: Nenhum prazo de retenção é publicado antes de a APPD decidir
  Cobre REQ-23
  Dado que a PB-1 não foi respondida
  Quando "/privacidade" é renderizada
  Então a seção de tempo de guarda exibe "[A CONFIRMAR]" no corpo do texto
  E a página não contém nenhum prazo de retenção em dias, meses ou anos
  E a marcação tem o mesmo contraste do texto ao redor

Cenário: A política declara as garantias sobre o dado sensível e a foto
  Cobre REQ-24
  Dado que uma pessoa abre "/privacidade"
  Quando ela lê a seção sobre dado sensível
  Então o texto afirma que o tipo de deficiência não aparece no crachá sem opt-in
  E afirma que ele nunca aparece na página pública de verificação
  E afirma que a foto do crachá nunca é publicada em endereço aberto
  E a seção cita o Art. 11 da LGPD no bloco "No termo da lei"
```

### Funcionalidade: O dado sensível nunca vaza para o público

```gherkin
Cenário: A verificação pública do crachá não expõe tipo de deficiência
  Cobre REQ-25
  Dado um associado com tipo de deficiência "Física" registrado
  Quando qualquer pessoa, sem autenticação, abre "/verificar/<numero>"
  Então a resposta contém apenas nome, número e status
  E o texto "Física" não aparece no HTML renderizado
  E não aparece em nenhum atributo, comentário, metadado ou payload JSON da página

Cenário: O crachá não mostra o tipo de deficiência sem opt-in
  Cobre REQ-25
  Dado um associado que não marcou o opt-in de exibição no crachá
  Quando o crachá dele é gerado
  Então o tipo de deficiência não aparece no crachá
  E o opt-in é um controle separado do consentimento de coleta
```

### Funcionalidade: Acessibilidade das cinco telas

```gherkin
Esquema do Cenário: Estrutura de títulos e foco em cada tela
  Cobre REQ-26, REQ-27
  Dado que uma pessoa abre "<rota>"
  Quando a página termina de carregar
  Então existe exatamente um elemento h1
  E a hierarquia de títulos não pula nível
  E todo elemento focável exibe foco visível de 3px em "#0f4c93" com 2px de folga
  E a auditoria automatizada com axe não aponta violação de nível A ou AA
  # Régua única do projeto, na configuração do axe no CI, nunca repetida por change.

  Exemplos:
    | rota                  |
    | /privacidade          |
    | /seus-direitos        |
    | /privacidade          |
    | /seus-direitos        |

Cenário: Todo alvo interativo tem pelo menos 44 por 44 pixels
  Cobre REQ-28
  Dado que uma pessoa abre qualquer uma das cinco telas
  Quando os alvos interativos são medidos
  Então nenhum deles tem lado menor que 44 CSS px
  E o rótulo da caixa de consentimento é clicável dentro dessa área

Cenário: O fluxo de exclusão inteiro é operável só por teclado
  Cobre REQ-27
  Dado que "usuario-1" está em "/seus-direitos" usando apenas o teclado
  Quando ele percorre pedido, confirmação e recibo com Tab, Shift+Tab, Enter e Espaço
  Então ele consegue concluir o fluxo sem mouse
  E não há armadilha de foco em nenhuma das três telas
  E a ordem de foco acompanha a ordem visual

Cenário: Erro não é sinalizado só por cor
  Cobre REQ-29
  Dado um erro exibido na caixa de consentimento
  Quando a tela é renderizada em escala de cinza
  Então o erro continua identificável por ícone e por texto

Cenário: Tipografia e movimento respeitam o público do site
  Cobre REQ-30
  Dado que uma pessoa abre "/privacidade"
  Quando a página é renderizada
  Então o corpo do texto tem 17px e nenhum texto fica abaixo de 15px
  E a largura da linha de texto fica entre 60 e 75 caracteres
  E, com "prefers-reduced-motion: reduce" ativo, nenhuma animação é executada
```

## Rastreabilidade

| REQ             | Cenários de aceite                           | Onde nasce                      |
| --------------- | -------------------------------------------- | ------------------------------- |
| REQ-1 a REQ-4   | Versionamento do termo (7 cenários)          | Art. 8º §5º; Art. 11, I         |
| REQ-5 a REQ-7   | Consentimento (5 cenários)                   | Art. 8º §1º e §4º; Art. 11, I   |
| REQ-8 a REQ-10  | Consentimento (3 cenários) + Revogação (1)   | registro do aceite; minimização |
| REQ-11, REQ-12  | Versionamento (2 cenários)                   | Art. 8º §6º; Art. 9º §2º        |
| REQ-13          | Revogação (2 cenários)                       | Art. 8º §5º; Art. 18, IX        |
| REQ-14 a REQ-16 | Acesso, correção, portabilidade (3 cenários) | Art. 18 I, II, III, V; Art. 19  |
| REQ-17 a REQ-20 | Conteúdo da tela de exclusão (3 cenários)    | Art. 16; Art. 18, VI            |
| REQ-21 a REQ-24 | Legibilidade da política (5 cenários)        | Art. 9º; Art. 41 §1º            |
| REQ-25          | Dado sensível nunca público (2 cenários)     | Art. 11; `CLAUDE.md`            |
| REQ-26 a REQ-30 | Acessibilidade (5 cenários, 5 exemplos)      | WCAG 2.2 AA; `CLAUDE.md`        |

Total: **41 cenários** de aceite, cobrindo os 30 requisitos. O esquema de cenário da
acessibilidade roda 5 exemplos, o que dá **45 execuções** de teste.

## Definition of Ready — autoauditoria

- [x] Todo REQ é booleano ou mensurável, sem adjetivo solto.
- [x] Todo REQ tem pelo menos um cenário Gherkin que diz passou ou falhou.
- [x] Bordas e falhas cobertas, não só o caminho feliz.
- [x] Fora de escopo explícito, repetido na spec.
- [x] Origem rastreável e dono nomeado.
- [x] Nenhuma credencial, chave ou dado de pessoa real no texto.
- [ ] **Priorizada** — pendente do coordenador.
- [ ] **Aprovada pelo dono** — pendente. Enquanto isso, status `rascunho`.
- [ ] **PB-1 a PB-5 respondidas** — bloqueiam o archive, não o início do código.

Veredito: **NÃO-READY para archive** (PB-1 a PB-5 abertas e aprovação do dono pendente).
**READY para virar task**, desde que ADR-006 seja escrito antes de qualquer código e o design
das telas seja aprovado antes de qualquer tela.
