# Proposal: crachá impresso

- ID: PROP-20260821-cracha-impresso
- Origem: revisão do dono em vídeo, 2026-08-20 (10:50 a 11:26), mais a foto do crachá
  físico entregue por ele no mesmo dia
- Dono do conteúdo: Arthur Barbero · Execução: Claude Code
- Status: **rascunho** — vira spec depois da revisão do dono

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

## Três decisões que precisam ser suas antes da spec

1. **A identidade visual.** Replicamos a cara do cartão físico — faixa azul, brasão, verde
   — ou o crachá segue o design system do site? A primeira reconhece; a segunda mantém a
   coerência que o v2 construiu. Não dá para as duas.
2. **Emissão e contato de emergência.** Valem a pena como campos novos? Emissão o sistema
   sabe (é a data do cadastro); contato de emergência seria o campo 22, e hoje existe
   `cuidadorContato`, que talvez já sirva.
3. **A foto do cartão físico não pode ser versionada.** É o crachá de uma pessoa
   identificada, com CPF, CID e endereço, e o repositório é público. Fica no seu
   computador; aqui ela entra descrita em texto. Se precisarmos dela na spec, descrevo o
   layout em medidas, não em imagem.

## Impacto

- **Toca dado sensível?** **Sim, no ponto mais delicado do projeto.** Um crachá impresso é
  levado no bolso e mostrado a terceiros — mais exposto que a página de verificação. Cada
  campo que entrar aqui precisa passar pelo mesmo crivo do ADR-019.
- **Toca produção / custo real?** Não. Mesmo Worker, mesmo D1, geração no navegador.
- **Schema**: depende das decisões 1 e 2. Se nenhum campo novo entrar, nenhuma migration.
- **Aceite**: a suíte tem verificações do crachá que vão reprovar — é a intenção. A tela de
  impressão tem gate próprio desde `cracha-do-associado`.

## Próximo passo no fluxo

proposal (este) → **revisão do dono**, com as três decisões → spec com critérios Gherkin →
tasks → implementação.

**Nada começa antes da spec.** E, diferente da `acabamento-de-interface`, aqui há decisão
de identidade visual em jogo: se ela for para o canvas, vale a regra do `CLAUDE.md`.
