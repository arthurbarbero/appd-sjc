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

## Correção 2 — o tipo de deficiência fica, mas condicionado ao consentimento

> **Esta correção foi reescrita no mesmo dia.** A primeira versão mandava tirar o bloco
> "Tipo de deficiência" da verificação em qualquer hipótese. O dono apontou o erro: ele
> nunca disse que nunca deveria aparecer — disse que aparece **se houver consentimento**.
> Ver [ADR-019](adr/adr-019-consentimento-governa-a-verificacao-publica.md).

`Verificar.dc.html` exibe o bloco **sempre**. Na implementação ele é **condicional**: só
aparece quando a pessoa marcou o opt-in em `/area/cracha`. Sem a marca, a rota nem consulta
o campo.

O exemplo do canvas — "Deficiência física — usuária de cadeira de rodas" — vira o valor real
da inscrição, sem descrição livre. E a frase de declaração passa a ser **variável**: ela cita
tipo de deficiência quando ele não está sendo exibido, e para de citar quando está. Dizer
"não mostramos" logo acima de um bloco que mostra faria quem confere parar de acreditar no
resto da frase.

## Correção 3 — duas frases do crachá que o ADR-015 desatualizou

`Cracha.dc.html` afirma, no rodapé do conteúdo:

| O canvas escreveu                                                                              | O que vale                                                                                                                            |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| "Sua foto fica guardada só para o crachá. Ela nunca aparece na página pública de verificação." | A foto **aparece** na verificação pública. É a razão de a página existir (ADR-015).                                                   |
| "Se você não marcar, o crachá não diz nada sobre isso, e a página pública também não."         | Meia verdade: **não marcar** de fato tira dos dois. Mas **marcar** passa a publicar nos dois, e o texto precisa dizer isso (ADR-019). |

As duas frases estavam certas quando o prompt foi escrito, em 2026-08-05. O ADR-015 é de
dois dias depois.

## Correção 4 — a foto na verificação vai embutida

O desenho mostra a foto como bloco de imagem comum. Na implementação ela é **embutida na
resposta HTML** (`data:` URI), sem URL de imagem endereçável, e com
`Cache-Control: private, no-store`. Sem isso a foto viraria arquivo estático público, que
é o que o REQ-18 revogado proibia inteiro — o que sobrou da proibição é exatamente isto.

## O que já foi implementado deste handoff

**Tudo.** Fatia 2 (armazenamento), Fatia 3 (recorte e compressão), Fatia 4 (cartão frente e
verso, exportação PNG e PDF, impressão A4, opt-in) e Fatia 5 (a verificação pública). A
change foi validada item a item e arquivada em 2026-08-07 — ver
[VALIDACAO.md](../openspec/archive/cracha-do-associado/VALIDACAO.md).
