# Spec: pedidos da APPD

- ID: SPEC-20260821c-pedidos-da-appd
- Proposal: [`proposal.md`](proposal.md)
- Decisão nova: [ADR-022](../../../docs/adr/adr-022-modo-atendimento-para-mutirao.md)

## Objetivo

Corrigir o que a associação apontou. Três dos cinco pontos são correção de fato — o site diz
coisa que não corresponde ao que a APPD faz —, e um deles anuncia um projeto que acabou.

## Bocha Paralímpica (REQ-1 a REQ-5)

- **REQ-1** — O projeto **sai de `PROJETOS`** em `shared/conteudo.ts`, com página, horários,
  locais e responsável.
- **REQ-2** — A rota `/projetos/bocha-paralimpica` **deixa de existir**, e quem chegar por
  link antigo recebe a 404 do site, que já oferece caminho de volta.
- **REQ-3** — `Bocha Paralímpica` **sai de `ATENDIMENTOS`**, o vocabulário do campo 13.
- **REQ-4** — Nenhuma menção sobra em texto que a pessoa lê: home, hub de atendimento, 404,
  ajuda do campo 13.
- **REQ-5** — **Não há tratamento de compatibilidade para o que já está gravado.** Decisão do
  dono: "sobre bocha olímpica no banco deixa lá, é só teste agora que tem lá". O valor some
  do vocabulário e pronto — inscrição de teste que o carregue passa a ser recusada na
  correção, e isso é aceito.

  Fica dito por que a alternativa não foi tomada: se houvesse cadastro real com Bocha, tirar
  o valor da lista tornaria **o cadastro inteiro inválido** na próxima vez que a pessoa
  abrisse `/area/inscricoes` para corrigir qualquer outra coisa. O caminho seria o do
  `DEFICIENCIA_NAO_CONSENTIDA`: o gravado continua legível, só a oferta some. **No dia em
  que houver dado real, esta decisão precisa ser revista antes de a próxima oferta sair.**

## O CEP volta a substituir (REQ-6 a REQ-9)

- **REQ-6** — Quando o CEP consultado é **diferente** do que preencheu o endereço da última
  vez, a busca **substitui** rua, bairro, município e estado.
- **REQ-7** — Quando o CEP é **o mesmo**, nada é substituído. Sem isso, sair e voltar ao
  campo apagaria a correção que a pessoa acabou de digitar — e ninguém pediu isso.
- **REQ-8** — Vale nas duas telas que buscam CEP: `/atendimento/inscricao` e `/area/dados`.
  Régua duplicada é régua que diverge.
- **REQ-9** — A tela diz o que aconteceu: quando substitui, aparece uma linha em região viva
  dizendo que o endereço foi preenchido pelo CEP. Quem escreveu o complemento dentro do
  campo da rua perde o que escreveu, e precisa ver que perdeu.

## O limite de cadastros (REQ-10 a REQ-16)

- **REQ-10** — O teto do **público** não muda: 12 cadastros por IP a cada 15 minutos.
- **REQ-11** — Existe um **modo atendimento**, que eleva o teto do aparelho que o ligou.
- **REQ-12** — Ligar o modo exige uma **senha guardada em Cloudflare Secrets**, e nada mais.
  Sem o segredo configurado, o modo **não liga** — falha fechada, como o segredo do limite.
- **REQ-13** — O modo vale por **tempo limitado** e para **aquele navegador**, num cookie
  selado. Não é uma configuração global do site: mutirão que esquece de desligar não deixa a
  porta aberta para sempre.
- **REQ-14** — O modo atendimento **não muda mais nada**. Não dispensa consentimento, não
  altera validação, não dá acesso a dado de ninguém. Ele mexe num número, e só.
- **REQ-15** — O teto do modo atendimento é **provisório** até a APPD dizer quantas pessoas
  cabem num mutirão (`docs/pendencias-appd.md`, item 4c). O valor fica num lugar só, nomeado,
  para a troca ser de uma linha.
- **REQ-16** — O identificador continua **nunca gravado em claro** (HMAC, `modelo-de-dados`
  REQ-30). O modo atendimento não abre exceção a isso.

## Os dois rótulos (REQ-17, REQ-18)

- **REQ-17** — O campo 23 passa a se chamar **"Número do CRAS"**. No crachá o rótulo continua
  `CRAS`, como no cartão de papel.
- **REQ-18** — A ajuda do campo 24 passa a citar o **"Acesso Já"**, que é o nome que a pessoa
  ouviu no balcão — "passe municipal" é o nome do documento, e quem tem a credencial nem
  sempre sabe que são a mesma coisa.

## Acessibilidade (bloqueante)

- **REQ-19** — O aviso do REQ-9 é anunciado por leitor de tela, e não só desenhado.
- **REQ-20** — A tela do modo atendimento, se houver, é operável só por teclado, e o campo de
  senha tem rótulo próprio.
- **REQ-21** — axe A/AA sem violação nas telas tocadas.

## Contrato de dados

Nenhuma coluna nova, nenhuma migration. O modo atendimento vive em cookie selado e em
Cloudflare Secrets; a tabela `tentativas` continua como está.

## Fora de escopo

- Qualquer forma nova de autenticação (decisão do dono).
- O painel administrativo e o cadastro feito pelo atendente — estão na proposal daquela
  change.
- A página do projeto no Facebook, que continua no ar anunciando treinos. É pergunta para a
  associação (`docs/pendencias-appd.md`, item 4d).
