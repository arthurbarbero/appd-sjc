# Proposal: crachá impresso

- ID: PROP-20260821-cracha-impresso
- Origem: revisão do dono em vídeo, 2026-08-20 (10:50 a 11:26), mais a foto do crachá
  físico entregue por ele no mesmo dia
- Dono do conteúdo: Arthur Barbero · Execução: Claude Code
- Status: **aprovado pelo dono em 2026-08-21**, com as seis decisões abaixo — spec escrita

## Por que existe

O crachá que o site gera hoje sai **empilhado**: frente numa página, verso na outra. O
dono pediu os dois **lado a lado**, "uma tripa deitada, da esquerda para a direita", com a
margem branca para corte — e mandou a foto do cartão que a associação usa hoje, para
replicarmos.

Isso começou como a Fase 4 da change `acabamento-de-interface`. **Saiu de lá em 20/08**,
quando a foto chegou e mostrou que o trabalho não é diagramação. É outra coisa, e por três
motivos independentes.

## O que a foto mostrou

O cartão real é uma tira deitada de proporção ~3:1, frente à esquerda e verso à direita —
o pedido do dono confirmado. Mas **cada metade é paisagem**, e a nossa é retrato. Não é
girar o PDF: é redesenhar o cartão.

### 1. Cinco campos que o modelo não tem

| No cartão real               | Em `usuarios`                           |
| ---------------------------- | --------------------------------------- |
| Nome                         | `nome` ✓                                |
| Nascimento                   | `nascimento` ✓                          |
| CPF                          | `cpf` ✓                                 |
| Número APPD (`00001/CD`)     | `numeroRegistro` — outro formato        |
| **CRAS**                     | não existe                              |
| **Credencial de Transporte** | não existe                              |
| **Emissão**                  | não existe                              |
| **Validade**                 | não existe                              |
| **Contato de Emergência**    | `cuidadorContato` — não é a mesma coisa |
| Cuidador / Responsável       | `cuidadorNome` ✓                        |

Cinco colunas novas, e uma delas — **validade** — não é só um campo: é uma regra de
negócio. O verso do cartão real diz "Válida somente com a **contribuição solidária em
dia**", e o site não sabe nada sobre pagamento. Prometer validade sem saber disso seria
imprimir uma informação que ninguém pode sustentar.

### 2. A frente do cartão real expõe dado de saúde

Está impresso, em corpo grande: **`CID G82.4 · TETRAPLEGIA · Cadeirante`**, mais o CPF.

É exatamente o que o [ADR-019](../../../docs/adr/adr-019-consentimento-governa-a-verificacao-publica.md)
governa, e o oposto do que a nossa tela promete hoje: _"Hoje o seu crachá não mostra o seu
tipo de deficiência"_, com opt-in explícito e desmarcado por padrão.

**Replicar o cartão como ele é revogaria essa promessa por decisão de layout** — sem ADR,
sem consentimento novo, sem a pessoa saber. O que proponho: copiar a **forma** e manter o
**conteúdo** sob a regra já decidida. Deficiência só se a pessoa marcar; CID nunca, porque
é diagnóstico e o site não o coleta nem deveria.

### 3. A identidade visual não está no design system

Faixa azul com o nome por extenso, brasão de São José dos Campos em marca d'água, blocos
arredondados verdes sobre fundo bandeira. Nada disso está no `DESIGN.md`, e o v2 do design
system foi escrito justamente para **não** herdar a estética do material antigo
([design-system](../../../docs/adr/)). Replicar aqui é uma exceção deliberada — o crachá é
documento de identificação, não página de site, e parecer com o cartão que a associação já
usa tem valor de reconhecimento.

Isso precisa ser decidido, não deduzido.

## Escopo

### O que entra

- **Layout em tira deitada**: frente e verso lado a lado, na mesma folha, com margem de
  corte. Substitui o empilhado de hoje no PDF e na tela de impressão.
- **Cada metade em paisagem**, seguindo a proporção do cartão real.
- **A identidade do cartão**: faixa, marca e disposição, na medida em que a decisão de
  identidade visual permitir.
- **Rever a escala da pré-visualização** (K1): a 100% ela parece pequena.

### O que fica de fora, e por quê

- **CID e diagnóstico.** O site não coleta, não deve coletar, e imprimir contraria o
  ADR-019. O tipo de deficiência continua sob opt-in.
- **Validade.** Depende de saber se a contribuição está em dia, e o site não sabe. Entra
  quando existir essa informação — não antes.
- **CRAS e Credencial de Transporte**, até o dono decidir se a associação quer coletá-los:
  são campos novos no formulário, e a regra dos 15 vale (acrescentar é decisão dele).
- **O número no formato `00001/CD`.** O nosso é `APPD-2026-XXXXXX`, sorteado de propósito
  para não vazar a lista de associados por sequência. Voltar ao sequencial reabriria isso.

## As seis decisões do dono — 2026-08-21

| Pergunta                         | Resposta                               |
| -------------------------------- | -------------------------------------- |
| CID no crachá?                   | **Sim — e entra também no formulário** |
| Validade?                        | **Fica para depois**                   |
| Número sequencial do cartão?     | **Usar o nosso**, `APPD-AAAA-XXXXXX`   |
| Identidade visual?               | **Inspirada no cartão atual**          |
| Emissão e contato de emergência? | **Emissão sim; contato se houver**     |
| CRAS e Credencial de Transporte? | **Campos opcionais no formulário**     |

**A primeira decisão é a que muda o projeto**, e por isso virou
[ADR-020](../../../docs/adr/adr-020-cid-no-cadastro-e-no-cracha.md) em vez de virar linha de
spec. O site passa a guardar **diagnóstico**, não mais categoria de deficiência — `G82.4`
tem código e classificação clínica, `Física` não. E o crachá vai no bolso: é o dado mais
exposto que este projeto vai produzir.

A decisão tem uso real e legítimo — o CID é o que os serviços pedem na porta, e um cartão
sem ele obriga a pessoa a carregar laudo à parte. O que o ADR faz não é discutir a decisão,
é registrar as três travas sem as quais ela não se sustenta: consentimento próprio para
guardar, opt-in próprio para imprimir, e **nunca** em `/verificar`.

Duas coisas ficam de fora por consequência, e não por escolha minha:

- **Validar o código contra a tabela oficial do CID** — o site não é sistema de saúde.
- **A frase "válida com a contribuição em dia"**, que o cartão de papel estampa: sem
  validade, ela não tem o que sustentar.

## Impacto

- **Toca dado sensível?** **Sim, no ponto mais delicado do projeto.** Um crachá impresso é
  levado no bolso e mostrado a terceiros — mais exposto que a página de verificação. Cada
  campo que entrar aqui precisa passar pelo mesmo crivo do ADR-019.
- **Toca produção / custo real?** Não. Mesmo Worker, mesmo D1, geração no navegador.
- **Schema**: cinco colunas novas em `usuarios` — `cid`, `cidNoCracha`, `cras`,
  `credencialTransporte`, `contatoEmergencia`. Nenhuma tabela nova, então o adendo de
  `modelo-de-dados` segue respeitado.
- **Aceite**: a suíte tem verificações do crachá que vão reprovar — é a intenção. A tela de
  impressão tem gate próprio desde `cracha-do-associado`.

## Próximo passo no fluxo

proposal (este) → **revisão do dono**, com as três decisões → spec com critérios Gherkin →
tasks → implementação.

**Nada começa antes da spec.** E, diferente da `acabamento-de-interface`, aqui há decisão
de identidade visual em jogo: se ela for para o canvas, vale a regra do `CLAUDE.md`.
