# Spec: crachá impresso

- ID: SPEC-20260821-cracha-impresso
- Proposal: [`proposal.md`](proposal.md), com as seis decisões do dono em 2026-08-21
- Decisão estrutural nova: [ADR-020](../../../docs/adr/adr-020-cid-no-cadastro-e-no-cracha.md)

## Objetivo

Fazer o crachá gerado pelo site servir ao que o cartão de papel da APPD serve: uma tira
deitada, frente e verso lado a lado, com os dados que a pessoa precisa mostrar na porta do
ônibus, do posto e do atendimento.

O que muda de fundo, e é maior que o layout: **o projeto passa a guardar diagnóstico**. O
ADR-020 governa isso, e esta spec o aplica.

## As seis decisões do dono, e o que cada uma abriu

| Decisão                                          | O que ela obriga                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **CID entra no formulário**                      | campo, coluna, consentimento próprio, opt-in de impressão, proibição em `/verificar` |
| **Validade fica para depois**                    | nada de campo nem de regra agora; o verso não promete vigência                       |
| **Nosso número no lugar de `00001/CD`**          | `APPD-2026-XXXXXX` no cartão, e o sorteio continua                                   |
| **Identidade inspirada no cartão atual**         | faixa, marca e disposição; exceção deliberada ao v2 do design system                 |
| **Emissão sim; contato de emergência se houver** | emissão é derivada, não campo; contato reaproveita o do cuidador                     |
| **CRAS e Credencial de Transporte opcionais**    | dois campos novos, os dois sem obrigatoriedade                                       |

## Requisitos

### Forma do cartão (REQ-1 a REQ-6)

- **REQ-1** — O crachá é uma **tira deitada**: frente à esquerda, verso à direita, na mesma
  folha. Substitui o empilhado de hoje no PDF e na tela de impressão.
- **REQ-2** — Cada metade é **paisagem**, na proporção do cartão da associação.
- **REQ-3** — Há **margem branca para corte** em volta da tira, e a folha continua A4.
- **REQ-4** — A geração continua **inteira no navegador**, sem enviar nada para fora — o
  comportamento que o REQ-24 de `cracha-do-associado` exigia declarar e que deixou de ser
  declarado na tela por decisão do dono. Aqui ele é requisito de funcionamento, não de
  texto.
- **REQ-5** — A pré-visualização mostra a tira **em escala legível**, e não no tamanho
  físico reduzido que o dono achou pequeno demais a 100%.
- **REQ-6** — O número impresso é o **nosso**: `APPD-2026-XXXXXX`. O formato sequencial do
  cartão de papel não volta — ele vaza a lista de associados por contagem.

### Identidade visual (REQ-7 a REQ-9)

- **REQ-7** — O cartão é **inspirado no da associação**: faixa superior com o nome por
  extenso, marca, e a disposição de blocos que a pessoa já reconhece.
- **REQ-8** — Esta é uma **exceção declarada** ao design system v2, que existe para não
  herdar a estética do material antigo. Vale aqui porque o crachá é documento de
  identificação, e reconhecimento tem valor de uso — não vale para nenhuma tela do site.
- **REQ-9** — Contraste, tamanho de texto e alvo continuam sob a regra do projeto. Um
  documento impresso não é desculpa para texto de 8px.

### O CID (REQ-10 a REQ-17) — o que o ADR-020 obriga

- **REQ-10** — O CID é campo **opcional** do formulário. O cadastro conclui sem ele, o
  crachá sai sem ele, a verificação funciona sem ele.
- **REQ-11** — Coletar o CID exige **consentimento próprio**, separado do consentimento do
  campo 12, com termo versionado e hash registrado como qualquer outro aceite.
- **REQ-12** — O texto desse consentimento nomeia a finalidade: guardar o CID para que ele
  possa constar do crachá. Não usa "recomendado", "ajuda" nem "facilita" — a mesma regra do
  REQ-25 de `cracha-do-associado`.
- **REQ-13** — Imprimir o CID exige **opt-in próprio**, separado do consentimento de coleta
  **e** do opt-in do tipo de deficiência. Nasce desmarcado.
- **REQ-14** — O texto do opt-in diz o que a impressão significa: que o cartão é mostrado a
  terceiros e o diagnóstico estará nele.
- **REQ-15** — O CID **nunca** aparece em `/verificar`, sob nenhuma condição. Não há opt-in
  que o libere ali.
- **REQ-16** — Retirar o consentimento **apaga o CID** e desliga o opt-in de impressão, numa
  transação só — o mesmo desenho que a retirada do campo 12 já usa.
- **REQ-17** — A proibição transversal passa a ter dois alvos. O teste que hoje garante que
  o campo 12 não vaza para rota pública cobre o CID, com uma diferença: para o campo 12 há
  exceção sob opt-in; para o CID **não há exceção nenhuma**.

### Campos novos (REQ-18 a REQ-22)

- **REQ-18** — **Campo 22, CID**: texto curto, opcional, com o formato do código
  (`G82.4`) e espaço para a descrição. Governado por REQ-10 a REQ-17.
- **REQ-19** — **Campo 23, CRAS**: texto, opcional.
- **REQ-20** — **Campo 24, Credencial de Transporte**: texto, opcional.
- **REQ-21** — **Campo 25, Contato de emergência**: telefone, opcional. Se estiver vazio e
  houver contato de cuidador, o cartão usa o do cuidador — é o que "se houver" quer dizer.
- **REQ-22** — Os **15 campos originais não mudam**, e o 16 ao 21 tampouco. A regra do
  `CLAUDE.md` vale: acrescentar é decisão do dono, alterar os originais não é.

### Emissão e validade (REQ-23, REQ-24)

- **REQ-23** — A **emissão** é derivada, não campo: é a data em que o cadastro foi criado.
  Ninguém digita, e por isso ninguém erra.
- **REQ-24** — **Não há validade.** Decisão do dono: fica para depois. O verso não imprime
  vigência nem a frase "válida com a contribuição em dia" — o site não sabe se está, e
  imprimir seria sustentar o que não se pode.

### Acessibilidade (bloqueante)

- **REQ-25** — A tela do crachá e a de impressão continuam operáveis só por teclado, com
  foco visível e alvo ≥44px.
- **REQ-26** — Os dois novos controles de consentimento (REQ-11 e REQ-13) são caixas
  próprias, ligadas ao texto por `aria-describedby`, anunciadas em região viva quando o
  envio for recusado por causa delas.
- **REQ-27** — axe A/AA sem violação em `/area/cracha` e `/area/cracha-impressao`, e no
  formulário com os campos novos.

## Contrato de dados

| Coluna                 | Tipo   | Nulo | Observação                                             |
| ---------------------- | ------ | ---- | ------------------------------------------------------ |
| `cid`                  | `text` | sim  | campo 22 — dado de saúde, ADR-020; apagado na retirada |
| `cidNoCracha`          | `int`  | não  | opt-in de impressão, nasce em 0                        |
| `cras`                 | `text` | sim  | campo 23                                               |
| `credencialTransporte` | `text` | sim  | campo 24                                               |
| `contatoEmergencia`    | `text` | sim  | campo 25                                               |

Cinco colunas em `usuarios`, nenhuma tabela nova — o adendo de `modelo-de-dados` continua
respeitado. Todas anuláveis, todas apagadas na exclusão junto das demais colunas pessoais.

O consentimento do CID entra em `consentimentos` como um **termo novo**, com slug próprio,
e não como versão nova do termo do Art. 11: são finalidades diferentes, e o histórico
precisa distinguir uma da outra.

## Fora de escopo

- **Validade e vigência** — decisão do dono, fica para depois.
- **Qualquer relação com pagamento ou contribuição** — o site não sabe, e não é aqui que
  vai passar a saber.
- **Exportação do CID no painel administrativo** — aquela change precisa decidir o que faz
  com este dado antes de existir, e a decisão é dela.
- **Validar o código do CID contra a tabela oficial** — o site não é sistema de saúde. O
  campo aceita o que a pessoa copia do laudo.

## Premissas e dependências

- A identidade visual (REQ-7) precisa de desenho. Se o dono levar ao canvas, vale a regra
  do `CLAUDE.md`; se preferir que eu faça, vale o que valeu na `acabamento-de-interface` —
  medição no lugar do gate de design.
- **A foto do cartão físico não é versionada.** É o crachá de uma pessoa identificada, com
  CPF, CID e endereço, e o repositório é público. O que entra aqui é descrição em medidas.

## Critério de aceite (Gherkin)

### Funcionalidade: A tira deitada

```gherkin
Cenário: O PDF traz frente e verso lado a lado
  Cobre REQ-1, REQ-2, REQ-3
  Dado que uma pessoa com foto abre "/area/cracha"
  Quando ela baixa o PDF
  Então o arquivo tem uma página
  E a frente está à esquerda e o verso à direita, na mesma tira
  E há margem branca em volta da tira para corte

Cenário: O número impresso é o do site
  Cobre REQ-6
  Dado um crachá gerado
  Quando o número é lido no cartão
  Então ele está no formato "APPD-AAAA-XXXXXX"
  E não há número sequencial em lugar nenhum

Cenário: A geração não sai do aparelho
  Cobre REQ-4
  Dado que a pessoa aciona baixar
  Quando o arquivo é gerado
  Então nenhuma requisição de rede acontece

Cenário: A emissão é a data do cadastro, e ninguém a digita
  Cobre REQ-23
  Dado um cadastro criado em uma data conhecida
  Quando o verso é exibido
  Então a emissão mostra aquela data
  E não existe campo de emissão no formulário

Cenário: O cartão não promete validade
  Cobre REQ-24
  Dado um crachá gerado
  Quando o verso é lido
  Então não há data de validade
  E não há frase condicionando o cartão à contribuição
```

### Funcionalidade: O CID é opcional, e nada depende dele

```gherkin
Cenário: Cadastro conclui sem CID
  Cobre REQ-10
  Dado uma pessoa preenchendo o formulário sem informar CID
  Quando ela envia
  Então o cadastro é aceito
  E o crachá fica disponível normalmente

Cenário: Informar CID exige consentimento próprio
  Cobre REQ-11, REQ-12
  Dado uma pessoa que preencheu o campo de CID
  Quando ela envia sem marcar o consentimento do CID
  Então o envio é recusado com 422 indicando o consentimento
  E nenhuma linha com CID é gravada

Cenário: O consentimento do CID é separado do consentimento do campo 12
  Cobre REQ-11
  Dado o formulário aberto
  Quando os dois consentimentos são exibidos
  Então são controles distintos, com textos distintos
  E marcar um não marca o outro
  E o termo do CID tem slug próprio no catálogo
```

### Funcionalidade: Imprimir o CID é outra decisão

```gherkin
Cenário: O opt-in de impressão nasce desmarcado
  Cobre REQ-13
  Dado uma pessoa que consentiu em guardar o CID
  Quando ela abre "/area/cracha"
  Então o opt-in de imprimir o CID está desmarcado
  E o crachá não mostra o CID

Cenário: Marcado, o CID aparece no cartão
  Cobre REQ-13
  Dado o opt-in de impressão marcado
  Quando o crachá é gerado
  Então o CID aparece na frente do cartão

Cenário: O texto diz o que a impressão significa
  Cobre REQ-14
  Dado o opt-in exibido
  Então o texto diz que o cartão é mostrado a terceiros
  E que o diagnóstico estará nele
  E não usa "recomendado", "ajuda" nem "facilita"
```

### Funcionalidade: O CID nunca é público

```gherkin
Cenário: A verificação pública não mostra o CID
  Cobre REQ-15, REQ-17
  Dado uma pessoa com CID guardado e o opt-in de impressão MARCADO
  Quando alguém abre "/verificar/<numero>"
  Então o CID não aparece na página
  E não aparece no JSON de "/api/verificar/<numero>"

Cenário: Nenhuma rota pública devolve o CID
  Cobre REQ-17
  Dado o conjunto de rotas públicas do site
  Quando as respostas são varridas
  Então nenhuma contém o campo de CID
```

### Funcionalidade: Retirar apaga

```gherkin
Cenário: Retirar o consentimento do CID apaga o dado e o opt-in
  Cobre REQ-16
  Dado uma pessoa com CID guardado e opt-in de impressão marcado
  Quando ela retira o consentimento do CID
  Então o campo de CID fica vazio
  E o opt-in de impressão fica desligado
  E o histórico registra a retirada com data, versão e impressão digital
  E as três coisas acontecem na mesma transação
```

### Funcionalidade: Os campos novos

```gherkin
Cenário: CRAS, credencial e contato de emergência são opcionais
  Cobre REQ-19, REQ-20, REQ-21
  Dado o formulário preenchido sem esses três campos
  Quando a pessoa envia
  Então o cadastro é aceito

Cenário: Sem contato de emergência, o cartão usa o do cuidador
  Cobre REQ-21
  Dado uma pessoa sem contato de emergência e com contato de cuidador
  Quando o verso é gerado
  Então ele mostra o contato do cuidador

Cenário: Os campos originais continuam intactos
  Cobre REQ-22
  Dado o formulário de atendimento
  Quando seus campos são comparados com docs/campos-formulario.md
  Então os 15 originais mantêm rótulo, ordem e obrigatoriedade
  E os campos 22 a 25 aparecem depois dos existentes
```

## Rastreabilidade

| Decisão do dono         | Requisitos      |
| ----------------------- | --------------- |
| CID no formulário       | REQ-10 a REQ-18 |
| Validade depois         | REQ-24          |
| Nosso número            | REQ-6           |
| Identidade inspirada    | REQ-7 a REQ-9   |
| Emissão e contato       | REQ-21, REQ-23  |
| CRAS e credencial       | REQ-19, REQ-20  |
| Tira deitada (do vídeo) | REQ-1 a REQ-5   |
