# Proposal: cartão fiel e cadastro aberto

- Data: 2026-08-21
- Origem: dois Jams gravados pelo dono depois da subida de 20/08
  - [Jam 1](https://jam.dev/c/da543e69-e2ee-4ef5-9a8d-7dfe19f550a2) — 4m56s, cabeçalho,
    crachá e formulário
  - [Jam 2](https://jam.dev/c/f7327ae5-7df7-4e0f-beba-2e217e8d87c6) — 5m00s, CID,
    obrigatoriedade, impressão e o defeito da página em branco
- Change anterior: [`cracha-impresso`](../cracha-impresso/proposal.md), ainda não arquivada

## O que aconteceu

O dono revisou a subida de ontem em dois vídeos seguidos. Saíram treze pedidos, um elogio
("essa área aqui é até bom ver assim") e uma frase que vale mais que os treze:

> o cartão tinha que estar noventa por cento igual aquele lá, não o que você fez

A ressalva 2 do [parecer de ontem](../cracha-impresso/VALIDACAO.md) dizia que a identidade
era **inspirada**, não replicada, e que o dono podia querer mais fidelidade. Queria. A
ressalva estava certa em existir e errada em ter sido resolvida por decisão minha de
escopo — o cartão é o documento da associação, e o que ele deve parecer não é escolha de
quem escreve o CSS.

## O defeito que ninguém pediu para procurar

Enquanto eu investigava a queixa "cliquei em PDF e a página foi lá pra baixo, isso aqui é
um erro crítico", a medição mostrou outra coisa: **toda página da área do associado tem
cerca de 4.800 px de vazio branco no fim**, e tem desde a change passada. O PDF não causava
nada — ele só dava motivo para rolar até lá.

A causa é uma linha de CSS escrita para resolver um problema real:

```css
.area-moldura > nav {
  grid-row: 2 / span 200; /* a coluna da esquerda ao lado de N itens, sem wrapper */
}
```

`span 200` cria duzentas linhas implícitas. Cada uma vazia mede zero — mas o `row-gap` de
24 px entre elas, não. Duzentas linhas × 24 px ≈ 4.800 px de nada, exatamente o que a
medição achou: a moldura tem 5.760 px e o conteúdo acaba em 1.229 px.

O que se aprende aqui não é sobre grid. É que **o truque que economiza um wrapper cobra o
preço em outro lugar**, e o preço não aparece em nenhum teste que olhe conteúdo. Nenhum
dos 375 testes reprova uma página que tem tudo no lugar certo e cinco telas de branco
depois.

## As decisões que o dono tomou hoje

Perguntei três coisas em que a interpretação mudava o trabalho. As respostas:

| Pergunta                                        | Decisão                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Até onde vai "todo lugar tem que ser opcional"? | Só deficiência, tipo de atendimento e melhores dias. Identidade, contato e login continuam |
| Até onde vai a cópia do cartão de papel?        | Aparência **e** campos, com CPF e endereço, sem opt-in — menos o CID                       |
| O `+55` muda o dado guardado?                   | Sim, formato internacional. Sem migração: o que está lá é teste                            |

### O custo das duas primeiras, escrito antes de eu executá-las

**O CID perde o opt-in de impressão.** O ADR-020 tem três travas, e a terceira era
"guardar não é imprimir": consentir em ceder o diagnóstico e consentir em estampá-lo num
cartão que se mostra na rua eram decisões separadas. O dono mandou juntá-las ao
consentimento de coleta. A trava que **fica de pé, inteira e sem exceção**, é a primeira:
o CID nunca aparece em `/verificar`.

**CPF e endereço passam a ser impressos.** Um crachá perdido na rua entrega CPF, endereço
e diagnóstico juntos. É o que o cartão de papel da APPD já faz hoje, e é dele que este
crachá é cópia — mas o cartão de papel não é o padrão de segurança do projeto, é o
material que o projeto foi escrito para substituir. Fica registrado que a decisão é do
dono e o motivo dela é reconhecimento, não segurança.

## Os treze pedidos

### Do Jam 1

1. **O cabeçalho quebra em duas linhas** entre ~1.085 e ~1.150 px e de novo entre ~865 e
   ~1.000 px. "Não é a fonte, é o pixel." Dito duas vezes no mesmo vídeo.
2. **"Mudar a minha foto" desce** para baixo do cartão, e a frase "Seu crachá fica pronto
   assim que você envia a foto" sai — ele a selecionou com o mouse ao dizer "isso aqui
   você pode apagar".
3. **O cartão mostra todos os campos, sempre**, mesmo vazios: "é melhor do que não existir
   o campo. Quando não preenchido não coloca nada na frente."
4. **Telefone com `+55`** automático.
5. **O bloco "3b. Para o seu crachá" não pode existir.** CRAS e credencial vão para o
   início do bloco de atendimento; contato de emergência vai para baixo do contato do
   cuidador, com o texto de que pode ficar em branco se for a mesma pessoa.

### Do Jam 2

6. **O CID sobe** para o bloco de quem vai ser atendido, como campo opcional.
7. **Deficiência deixa de ser obrigatória** — "eu posso não ter nenhuma deficiência e
   querer ser voluntário".
8. **O verso rotula o contato**: "pessoa de contato", "número de contato".
9. **O cartão 90% igual ao de papel.**
10. **A folha de impressão sem vão** entre frente e verso: "a pessoa vai imprimir e vai
    dobrar aqui".
11. **O vazio branco no fim da página** — o "erro crítico".
12. **"Este formulário ainda não envia" sai** da página de contato.

### E um que ele não viu

13. **O PNG e o PDF ainda desenham o cartão antigo**, em pé, sem CID, CRAS, credencial,
    emissão nem contato. A change de ontem trocou o componente da tela e deixou
    `cracha-arquivo.ts` como estava. Quem baixou o arquivo levou o cartão de anteontem —
    e o dono baixou três.

## O que esta change não faz

- **Validade e "contribuição em dia"**, que estão no cartão de papel. Decisão do dono de
  ontem, mantida: o site não sabe se a contribuição está em dia, e imprimir seria
  sustentar o que não se pode.
- **Os logos de PIX, Caixa e Sicoob** do verso. São dados de recebimento da associação, e
  colocá-los num documento que vai ao bolso de terceiros é decisão de quem responde pela
  conta — não minha.
- **Migração dos telefones já gravados.** O dono dispensou: os cadastros existentes são de
  teste.
