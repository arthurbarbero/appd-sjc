# Handoff das telas do crachá e da verificação — 2026-08-07

Telas geradas pelo dono no Claude Design, projeto `appd-sjc`, e lidas por DesignSync:
`templates/cracha/Cracha.dc.html`, `templates/cracha/Cartao.dc.html` e
`templates/verificar/Verificar.dc.html`.

**Aprovadas.** Fecham a T0.4 de `cracha-do-associado`, que travava as fatias 3, 4 e 5. O
que segue são as correções que a implementação aplica — todas por regra escrita ou por
decisão do dono, nenhuma por gosto.

## O que veio certo, e vale dizer

- **Os seis estados do crachá**, incluindo os três que costumam faltar: recorte com
  moldura 4:5 e instrução de teclado no corpo do texto, preparo com `progressbar`
  **determinado** (não roda-viva infinita) e erro de foto que diz o tamanho obtido e o que
  fazer, com dois caminhos de saída.
- **O opt-in do tipo de deficiência nasce desmarcado**, e o texto diz, sem eufemismo, que
  marcar deixa a palavra impressa "visível para qualquer pessoa que veja o documento".
- **A pré-visualização de impressão** em A4 com marcas de corte e a instrução de imprimir
  em 100%, que é o erro que faz o crachá sair do tamanho errado.
- **Sem foto, os botões de baixar ficam desabilitados com o motivo escrito ao lado**
  (`aria-describedby`), não apenas esmaecidos.
- **A verificação pública** com a resposta idêntica para número inexistente e mal digitado,
  a situação inativa em âmbar e sem linguagem de acusação, e o bloco "Recebeu uma ligação
  da APPD?" com o selo `A CONFIRMAR` visível.

## Correção 1 — fontes por CDN do Google

As três telas trazem `<link>` para `fonts.googleapis.com`. **Não vai para o código.**

Carregar fonte do Google entrega o IP de cada visitante a um terceiro, sem base legal e
sem o visitante saber. É a terceira vez que aparece: o canvas volta a gerar CDN porque não
sabe da decisão. Não é erro do dono.

## Correção 2 — tipo de deficiência na verificação pública

`Verificar.dc.html` exibe um bloco "Tipo de deficiência" e o declara na frase do que a
página mostra. **Sai.**

Não é discordância de desenho: é o campo 12, dado sensível do Art. 11 da LGPD, numa página
pública sem autenticação. O dono decidiu manter a foto e o contato de cuidador, e deixar o
tipo de deficiência de fora — [ADR-015](adr/adr-015-verificacao-publica-exibe-foto-e-cuidador.md).

Junto sai o exemplo "Deficiência física — usuária de cadeira de rodas", e a frase de
declaração passa a ser: "Esta página não mostra endereço, telefone, data de nascimento nem
tipo de deficiência."

## Correção 3 — duas frases do crachá que o ADR-015 desatualizou

`Cracha.dc.html` afirma, no rodapé do conteúdo:

| O canvas escreveu                                                                              | O que vale                                                                                                     |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| "Sua foto fica guardada só para o crachá. Ela nunca aparece na página pública de verificação." | A foto **aparece** na verificação pública. É a razão de a página existir (ADR-015).                            |
| "Se você não marcar, o crachá não diz nada sobre isso, e a página pública também não."         | A verificação **nunca** mostra o tipo de deficiência, marcado ou não. O opt-in vale só para o crachá impresso. |

As duas frases estavam certas quando o prompt foi escrito, em 2026-08-05. O ADR-015 é de
dois dias depois.

## Correção 4 — a foto na verificação vai embutida

O desenho mostra a foto como bloco de imagem comum. Na implementação ela é **embutida na
resposta HTML** (`data:` URI), sem URL de imagem endereçável, e com
`Cache-Control: private, no-store`. Sem isso a foto viraria arquivo estático público, que
é o que o REQ-18 revogado proibia inteiro — o que sobrou da proibição é exatamente isto.

## O que já foi implementado deste handoff

O componente de recorte e compressão (`app/components/AppdFoto.vue`), com os estados de
recorte, preparo e erro, mais o armazenamento (Fatia 2). A tela `/area/cracha`, o cartão
frente e verso e a página `/verificar` seguem por implementar — fatias 4 e 5.
