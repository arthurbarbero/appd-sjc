# Refino v2 — tirar a cara de 1990

Para as telas **já geradas** (Home, Serviço e Formulário). Não precisa regerar do zero:
cole o bloco abaixo no chat da tela. Regerar gasta cota; refinar não.

Antes de colar, **recarregue o projeto de design system `appd-sjc`** — os 10 arquivos
foram regravados com a v2. Se o app estiver com a versão antiga em cache, ele vai
brigar com o prompt.

---

## Bloco para colar em qualquer uma das três telas

> Atualize esta tela para a versão 2 do design system `appd-sjc`, que acabou de ser
> regravada. As mudanças são estruturais, não de conteúdo — mantenha todo o texto,
> a ordem das seções e os campos exatamente como estão.
>
> 1. **Cantos**: raio de 10px em cartão, bloco de aviso, campo e tabela; 8px em botão;
>    6px em selo. Nada mais com canto reto.
> 2. **Bordas**: troque o marrom por cinza frio. Estrutura (cartão, tabela, grupo de
>    opções) usa borda de 1px `#e2e5e9`. Campo de formulário usa 2px `#6f7782`. Nenhuma
>    borda marrom em lugar nenhum.
> 3. **Superfícies**: o bege `#f5f2ea` sai; use `#f7f8f9`. Cabeçalho de tabela e estado
>    ativo usam `#eef1f4`.
> 4. **Elevação**: cartões e botão primário ganham sombra discreta —
>    `0 1px 2px rgba(20,22,26,.06), 0 1px 3px rgba(20,22,26,.08)` em repouso e
>    `0 4px 12px rgba(20,22,26,.08)` no sobrevoo. Sombra separa superfície, não cria
>    hierarquia.
> 5. **Rodapé**: fundo quase preto `#14161a` com texto branco, no lugar do verde-oliva.
>    O verde `#4e5d2e` continua existindo, mas como acento em selo, não como bloco.
> 6. **Rótulos de campo em caixa alta e baixa**: "Nome", "Telefone para contato",
>    "Endereço (rua/avenida/travessa)", "Possui alguma deficiência", "É WhatsApp". As
>    palavras são as mesmas do formulário oficial; só o CAIXA ALTA sai, porque caixa
>    alta apaga o contorno da palavra e reduz a legibilidade.
> 7. **Tipografia com mais contraste de escala**: título de página em 56px no desktop,
>    título de seção em 36px, subtítulo em 22px, corpo em 17px. Títulos com
>    `letter-spacing: -0.02em`. Corpo com entrelinha 1,65.
> 8. **Mais respiro**: 64px entre seções grandes, 40px dentro de seção, 24px entre
>    elementos irmãos. A página pode ficar mais alta — densidade não é qualidade aqui.
> 9. **Links e foco**: link em `#0f4c93` no lugar do azul cru do navegador; anel de foco
>    de 3px na mesma cor, com 2px de folga. O anel deixa de ser vermelho para não
>    competir com a ação principal.
> 10. **Opções de escolha como blocos clicáveis**: cada checkbox e cada rádio dentro de
>     um retângulo de 44px de altura com raio 6px; ao passar o mouse, fundo `#f7f8f9`;
>     quando marcado, fundo `#fdf2f2` e borda `#8b0000`. A área clicável inclui o
>     rótulo inteiro.
> 11. **Botão primário**: `#8b0000` preenchido, raio 8px, altura 52px, com a sombra do
>     item 4 e um deslocamento de 1px ao ser pressionado.
>
> O que **não** muda: o vermelho `#8b0000` continua sendo a ação principal; o amarelo
> `#bbb070` continua sendo o realce e continua só aceitando texto escuro; todos os
> contrastes continuam em WCAG 2.2 AA; alvos de toque seguem com no mínimo 44px; nada é
> sinalizado só por cor; nenhum texto abaixo de 15px.
>
> Não introduza: degradê, vidro fosco, fundo colorido em seção inteira, ícone
> ilustrado colorido, foto de banco de imagem, animação de entrada ao rolar a página,
> nem cartão com borda colorida à esquerda como enfeite.

---

## Se ainda parecer datado depois disso

Peça uma coisa por vez, nesta ordem — cada item resolve mais do que o anterior:

1. "Aumente o espaço em branco entre as seções em 50%." Densidade excessiva é o que
   mais envelhece uma página.
2. "Reduza o número de blocos com borda: só cartão e aviso têm contorno; o resto se
   separa por espaço." Excesso de caixa dentro de caixa é traço de interface antiga.
3. "Deixe o título da página maior e mais apertado, e aumente o contraste de tamanho
   entre título e corpo."
4. "Alinhe tudo a uma grade de 12 colunas com medianiz de 24px e margem lateral de
   64px no desktop."

## O que não fazer

Não peça Bootstrap, Tailwind ou qualquer framework de UI no Claude Design. A tela final
vira componente Vue com o CSS deste design system — framework no protótipo só gera
código que vai ser jogado fora no handoff, e ainda deixa a tela com cara de template.
