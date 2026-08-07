# PIX: o que está no QR e como conferir

O QR de `/doar` é o arquivo `public/marca/pix-appd.svg`, versionado no repositório. Este
documento existe para que ele **não seja uma caixa-preta**: chave de PIX que ninguém
consegue verificar é vetor de golpe, e um QR trocado num commit passaria despercebido.

O script que gerou o arquivo era ferramenta de uma vez só e foi removido do repositório
(decisão do dono, 2026-08-06: código que não serve à API nem ao site não fica versionado).
O que importa dele está aqui.

## O payload conferido

```
00020101021126360014br.gov.bcb.pix0114080748830001965204000053039865802BR5908APPD SJC6015SAO JOSE CAMPOS62070503***63040AAE
```

Lendo por partes, no formato BR Code (EMV®QRCPS), em que cada campo é
`<id><comprimento><valor>`:

| Campo   | Valor             | O que é                                            |
| ------- | ----------------- | -------------------------------------------------- |
| `00`    | `01`              | versão do formato                                  |
| `01`    | `11`              | estático: serve para qualquer valor, quantas vezes |
| `26`    | ↓                 | conta do recebedor                                 |
| `26/00` | `br.gov.bcb.pix`  | domínio do arranjo                                 |
| `26/01` | `08074883000196`  | **a chave: o CNPJ da APPD**                        |
| `52`    | `0000`            | categoria do comerciante: não especificada         |
| `53`    | `986`             | moeda: real                                        |
| `58`    | `BR`              | país                                               |
| `59`    | `APPD SJC`        | nome do recebedor                                  |
| `60`    | `SAO JOSE CAMPOS` | cidade                                             |
| `62/05` | `***`             | identificador da transação: livre                  |
| `63`    | `0AAE`            | CRC16                                              |

**A chave é o CNPJ `08.074.883/0001-96`**, o mesmo que aparece no rodapé de todas as
páginas e no registro público da associação. Qualquer pessoa consegue conferir se o QR
manda dinheiro para a APPD ou para outro lugar — que é o ponto.

## O CRC

Os quatro últimos caracteres são um **CRC16/CCITT-FALSE** (polinômio `0x1021`, valor
inicial `0xFFFF`) calculado sobre todo o payload anterior, incluindo os literais `6304`.
É exigência do Banco Central e serve para o app detectar QR corrompido — **não** para
provar que a chave está certa.

## Como conferir de verdade

O CRC bater não significa que o banco aceita. A única conferência que vale é **escanear
com o app de um banco** e ver o nome do recebedor.

Feito em 2026-08-05 pelo dono: o QR escaneia e resolve para a APPD.

Refazer essa conferência é obrigatório sempre que o payload mudar. Se alguém alterar o
SVG, o diff mostra — e o motivo de o payload estar escrito aqui é justamente esse.
