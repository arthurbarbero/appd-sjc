# Proposal: acabamento de interface

- ID: PROP-20260820-acabamento-de-interface
- Origem: revisão do dono em vídeo, 2026-08-20 — inventário em
  [`docs/revisoes/revisao-dono-2026-08-20.md`](../../../docs/revisoes/revisao-dono-2026-08-20.md)
- Dono do conteúdo: Arthur Barbero · Execução: Claude Code
- Status: **aprovado pelo dono em 2026-08-20** — segue para a spec

## Por que existe

O v0.2.0 está no ar e o ciclo de conta funciona. O que o dono percorreu em 20/08 não foi
função faltando: foi **acabamento**. Trinta apontamentos em doze telas, e a maioria deles
é o mesmo defeito reaparecendo com nomes diferentes — "pequenininho", "espremido",
"cortado", "quebrado", "não vai até o fim".

**Não são trinta problemas, são cinco.** O maior deles tem endereço:
`p { max-width: var(--medida) }` em `app/assets/css/base.css:50`, com `--medida: 68ch`,
aplicado a **todo** parágrafo do site, dentro de um container de 1120px
(`app/layouts/default.vue:142`). Uma regra tipográfica boa (68 caracteres é medida de
leitura correta) aplicada num lugar largo demais produz exatamente a queixa que apareceu
em sete telas independentes. Corrigir onde ela foi vista sete vezes seria repetir o erro
que a `consentimento-e-privacidade` já ensinou em 11/08: **o marcador de lugar tinha um
sobrevivente na rota vizinha**.

A segunda razão de existir é que três apontamentos são **defeito**, não gosto: a foto
enviada não aparece no cartão da área, a página salta para baixo ao clicar na navegação
da área, e o recorte da foto deixa a imagem em branco se a pessoa sair antes de confirmar.
Esses não esperam design.

## Escopo

### Fase 1 — a causa comum, e os defeitos

O que não depende de decisão nova nem de tela nova.

- **Sistema de largura**: separar "medida de leitura" de "largura do bloco". Tirar o
  `max-width` global do `p`, criar a regra explícita de onde a medida se aplica (texto
  corrido) e onde não se aplica (campo de formulário, cartão, tabela, bloco em coluna
  estreita), e padronizar a centralização entre telas — o T2 do inventário. Cobre T1, C2,
  C3, A3 (largura), P2 e a queixa de `/sobre`.
- **Os três defeitos**: B1 (foto ausente no cartão de `/area`), B2 (salto de rolagem na
  navegação da área) e B3 (recorte em branco). B2 é o mais grave dos três: piorou durante
  a própria gravação, de "acontece ao trocar de aba" para "acontece a cada clique".
- **Erro de campo sem o "✕"** (T5): é uma regra do design system, não uma tela.

### Fase 2 — cabeçalho e navegação

Precisa de decisão de forma, e por isso vem depois do desenho.

- Cabeçalho em largura intermediária: só o símbolo, links na mesma linha (T3).
- Menu estreito: ícone hambúrguer e painel deslizando da direita, por cima do conteúdo
  (T4).
- Área do associado: cabeçalho mínimo, menu à esquerda, conteúdo à direita, navegação
  sem recarregar a página (A1). É a mudança de maior superfície da change — muda a
  estrutura de cinco rotas de `/area`.

### Fase 3 — conteúdo e campos, tela por tela

Trabalho miúdo, sem risco estrutural, e independente entre si.

- Início: H1, H2, H3 — tirar as legendas dos botões e as linhas de apoio das duas seções.
- Cadastro: C1 (bloco amarelo), C4 (endereço em caixa normal), C6 (**Estado e País**, o
  único item da change que toca o modelo de dados), C7 (máscara de CPF), C8 (zoom do
  recorte no telefone).
- Área: A2 (cartão de registro), A3 (campos travados no lugar da explicação), A4
  (WhatsApp lado a lado), A5 (salvar só com alteração, e voltar ao topo), A6 (botão Sair
  fora da paleta).
- Excluir conta: E1 — sai o parágrafo da ficha em papel.
- Sobre: P3 — equalizar as duas biografias.
- Contato: P4 — pré-preencher quem está autenticado.

### Fase 4 — crachá impresso: **saiu desta change**

O dono mandou a foto do crachá físico em 2026-08-20, destravando K3. Ela confirmou o
pedido — o cartão real é uma tira deitada, frente à esquerda e verso à direita — e
mostrou que o trabalho não é o que este proposal supôs:

1. **Cada metade é paisagem; a nossa é retrato.** Não é girar o PDF, é redesenhar o cartão.
2. **Cinco campos que o modelo não tem**: CRAS, Credencial de Transporte, Emissão,
   Validade e Contato de Emergência. Em `usuarios` existem `nome`, `cpf`, `nascimento`,
   `telefone`, `cuidadorNome` e `cuidadorContato`.
3. **A frente do cartão real imprime `CID G82.4 · TETRAPLEGIA · Cadeirante` e o CPF**, em
   corpo grande. É o que o ADR-019 governa, e o oposto do que a nossa tela promete hoje:
   "Hoje o seu crachá não mostra o seu tipo de deficiência", com opt-in. Replicar o cartão
   como ele é revogaria essa promessa por decisão de layout.

Nada disso é acabamento de interface, e por decisão de 2026-08-20 **K1 e K2 viram change
própria**, com proposal separado. Fica registrado o caminho recomendado para ela: copiar a
**forma** (tira deitada, disposição, faixa azul, marca, brasão) e manter o **conteúdo** sob
a regra já decidida — deficiência só se a pessoa marcar.

**A foto não vai para o repositório.** É o crachá de uma pessoa identificada, com CPF, CID
e endereço, e este repositório é público — versioná-la seria o vazamento que a T12 de
`consentimento-e-privacidade` proíbe, e que o `CLAUDE.md` já proíbe em regra própria.
Fica no computador do dono e entra como referência descrita em texto.

## Fora de escopo

- **Projetos** — o dono suspendeu: "a maioria nem está mais funcionando; deixa assim e
  depois eu vou ver" (14:32). Mexer agora é retrabalho garantido.
- **Os `[A CONFIRMAR]`** — ele revisa em bloco, é conteúdo dele (14:22).
- **O envio do formulário de contato** (P5) — continua parado na pendência da APPD (qual
  e-mail recebe). Cabe aqui só o rótulo do botão, que hoje não diz o destino; o envio, não.
- **Redefinição de senha e painel administrativo** — outra change, outro ADR.
- **A T7 de `consentimento-e-privacidade`** (componente da caixa de consentimento).
  Continua sendo dela. Esta change encosta no bloco 7 apenas pelo formato do erro (T5).

## As três dúvidas, respondidas pelo dono em 2026-08-20

1. **C5, campo Número** — "deixa do jeito que tá". O campo sai da change inteiro: nem a
   validação, nem a dica "Sem número? Escreva s/n".
2. **K4, as duas linhas do crachá** — confirmado, e são as que ele seleciona com o mouse
   em 11:30: **"O arquivo é gerado aqui no seu navegador."** e **"Nada é enviado para
   fora."**, logo abaixo dos botões de download. Saem as duas.

   Registro a ressalva, porque a decisão é dele e o custo é real: essas duas linhas são a
   única vez em que a tela diz que a foto não sobe para servidor nenhum. Sem elas, a
   garantia continua verdadeira no código e some da tela.

3. **A foto do crachá físico** — entregue. Ver a Fase 4, que muda de tamanho por causa
   dela.

## A regra dos 15 campos, emendada pelo dono

O `CLAUDE.md` diz, em "O que NÃO fazer": _"Não alterar os 15 campos do formulário de
atendimento — réplica fiel do form real (rótulos, ordem, obrigatoriedade)"_. Levantei C6
e C4 como conflito; o dono resolveu em 2026-08-20, e a resolução vale para o projeto
inteiro, não só para esta change:

> "Estamos aumentando, não mudando o form. Endereço em caixa normal não é mudar, é deixar
> melhor — na verdade já tínhamos passado por essa regra outras vezes."

**A regra protege os 15 campos originais contra alteração; ela não proíbe acrescentar.**
O precedente é do próprio projeto: o CEP virou o campo 16 por decisão do dono em
2026-08-06, registrado em `docs/campos-formulario.md`. C6 segue o mesmo caminho e vira os
campos **17 (Estado)** e **18 (País)**. C4 troca o controle do campo 5 de `textarea` para
caixa de uma linha, sem tocar rótulo, ordem nem obrigatoriedade.

Duas observações de desenho que a spec precisa resolver, e que não mudam a decisão:

- O ViaCEP, que já preenche rua, bairro e município, **também devolve a UF** — Estado pode
  chegar preenchido sem a pessoa digitar, do mesmo jeito que os outros três.
- País, numa associação que atende São José dos Campos e região, é campo de valor único.
  A spec define se ele entra como campo editável ou como valor fixo exibido.

**Tarefa de rito que sai daqui**: a redação da regra no `CLAUDE.md` bloqueia acréscimo
sem querer, e já causou este levantamento duas vezes. Ela é emendada junto com a change,
e `docs/campos-formulario.md` ganha os campos 17 e 18 com a data e o dono da decisão.

## Impacto

- **Toca dado sensível?** Não. Nenhum item chega perto do campo 12; A3 exibe dado que a
  pessoa já vê hoje, apenas em outro formato.
- **Toca produção / custo real?** Sim, no sentido de que tudo isto vai ao ar em
  `appd-sjc.appd-sjc.workers.dev` a cada push. Mesmo Worker, mesmo D1, custo zero.
- **Schema**: **um item toca** — C6, Estado e País no endereço. `modelo-de-dados` está
  arquivada, então vale o adendo dela: coluna nova cabe, tabela nova reabriria a change.
  São duas colunas em `usuarios`, com migration e valor padrão para as linhas existentes.
- **Aceite**: a suíte que existe (`npm test`, 233 testes; `npm run aceite`, 169
  verificações) tem regressão de interface e vai reprovar em vários pontos desta change —
  é a intenção. Cada fase atualiza o que quebrou e acrescenta o seu.
- **Acessibilidade**: T4 (painel deslizante) e A1 (menu lateral) são navegação, e por isso
  entram com critério Gherkin de teclado e foco desde a spec, não como passada final. É
  a mesma armadilha da T13 de `consentimento-e-privacidade`, que segue aberta justamente
  por ter sido deixada para o fim.

## Próximo passo no fluxo

proposal (este) → **revisão do dono** → spec com critérios Gherkin → tasks → design das
telas da Fase 2 no Claude Design → implementação, fase a fase.

**Nada começa antes da spec**, e a Fase 2 não começa antes do design aprovado — a regra
do `openspec/README.md` vale inteira.
