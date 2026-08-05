# Prompt — Home

## A espinha

**Decisão que a tela ajuda a tomar, e em quanto tempo:** em 5 segundos, a pessoa
descobre se este site resolve o problema dela — pedir atendimento, doar, ou ajudar de
outro jeito — e clica.

**O que o olho vê primeiro, segundo, terceiro:**

1. Quem é a associação e onde fica, em uma frase.
2. **Preciso de atendimento** — a ação primária, sozinha, sem concorrente visual.
3. **Doar** — secundária, claramente subordinada.

**O erro central do site atual, que esta tela corrige:** hoje a home tem seis blocos
visualmente idênticos e cinco deles levam ao mesmo formulário. Não é escolha, é ruído.
Aqui, cada card leva à página daquele serviço.

**Estados:** padrão; faixa de aviso no topo (usada quando houver recesso ou mudança de
horário); navegação em 320px de largura; foco de teclado percorrendo cabeçalho e ações.

---

## O prompt

> Home institucional responsiva (desktop 1280px e mobile 360px) da APPD São José dos
> Campos, associação sem fins lucrativos de pessoas com deficiência, fundada em 2006.
> Use o design system do projeto `appd-sjc`: fundo branco, texto `#1a1a1a`, ação
> principal `#8b0000` preenchida com texto branco, verde `#4e5d2e` no rodapé, amarelo
> `#bbb070` só com texto escuro, borda `#8d7158`, tipografia Atkinson Hyperlegible com
> corpo de 17px, cantos retos sem arredondamento, sem sombra, espaçamento base 8.
> Três públicos chegam aqui: a pessoa com deficiência e sua família, que precisa pedir
> atendimento; o doador; e quem quer ser voluntário. A tela é para quem tem pressa,
> baixa familiaridade digital, e muitas vezes usa leitor de tela ou só o teclado — a
> ação principal precisa ser óbvia sem rolar a página. A estética é institucional
> direta, quase de serviço público bem-feito: contraste alto, blocos retangulares
> delimitados por borda, hierarquia por tamanho e peso de texto, nada decorativo na
> frente do conteúdo. **Evite** a estética de startup — nada de fundo creme, serifa
> decorativa, degradê, cartão flutuante com sombra, ícone ilustrado colorido, foto de
> banco de imagem com pessoa sorrindo, ou faixa gigante ocupando a tela inteira antes do
> conteúdo. **Prefira** densidade honesta: a informação começa no primeiro terço da
> tela.
>
> Conteúdo, nesta ordem:
>
> 1. **Cabeçalho** — bloco reservado de logo (48px, quadrado, use um retângulo sólido
>    `#8b0000` com o texto LOGO; o arquivo real ainda não chegou), nome "APPD São José
>    dos Campos", e menu com Início, Atendimento, Projetos, Doar, Sobre nós, Contato.
>    Item atual marcado por barra inferior de 3px **e** por `aria-current="page"`. Um
>    link "Entrar" discreto no canto, fora do menu principal. Em mobile, menu em botão
>    com rótulo textual "Menu", nunca só o ícone de três riscos.
> 2. **Abertura** — título "Associação das Pessoas com Deficiência de São José dos
>    Campos" e a frase "Atendimento, reabilitação e convivência para pessoas com
>    deficiência e suas famílias, desde 2006." Sem imagem de fundo atrás do texto.
> 3. **Duas ações**, lado a lado no desktop e empilhadas no mobile, visualmente
>    diferentes entre si: a primária "Preciso de atendimento", preenchida em `#8b0000`,
>    com a linha de apoio "Cadastro gratuito. Você entra na fila e a associação entra em
>    contato."; a secundária "Quero doar", contornada, com "PIX, doação de equipamento
>    ou alimento."
> 4. **Aviso importante**, em bloco amarelo `#bbb070` com texto escuro, ícone e borda
>    esquerda: "As sessões de atendimento acontecem somente no período da manhã. As
>    vagas são chamadas conforme abrem."
> 5. **O que fazemos** — dois grupos com títulos próprios. "Atendimento": cinco cards
>    (Fisioterapia, Psicologia, Serviço Social, Orientações Gerais, Empréstimo de
>    Equipamentos). "Projetos": quatro cards (Bocha Paralímpica, Oficina Mão na Roda,
>    Artesão da Inclusão, Informática Nota 10). Cada card tem título, uma linha de
>    descrição e o link "Ver como funciona" — e **cada um leva a uma página diferente**,
>    nunca todos ao mesmo destino. Card com borda de 2px, sem sombra, sem ícone
>    ilustrado.
> 6. **Outras formas de ajudar** — doação de itens (fraldas geriátricas, cadeiras de
>    rodas e de banho, alimentos não perecíveis) e voluntariado, com link para o contato.
> 7. **Rodapé** em verde `#4e5d2e` com texto branco: endereço (Rua Acássia Pereira 136,
>    Campos dos Alemães, São José dos Campos/SP), CNPJ 08.074.883/0001-96, telefone
>    (12) 3346-0605, e-mail appdsjc@gmail.com, redes sociais, e os links Política de
>    Privacidade e Seus direitos.
>
> Requisitos de acessibilidade que valem como requisito de layout, não como enfeite:
> link "Pular para o conteúdo" como primeiro elemento focável; um único `h1`; hierarquia
> de headings sem pular nível; foco visível com anel de 3px `#8b0000` e 2px de folga em
> todos os elementos interativos; alvos de toque de no mínimo 44px com 8px de folga
> entre eles; nada sinalizado apenas por cor; texto nunca justificado; largura de linha
> entre 60 e 75 caracteres.
>
> Renderize também: a variação em 360px de largura; e a home com a faixa de aviso do
> item 4 ausente, para eu ver o espaçamento sem ela.

---

## Aceite visual

- [ ] A ação "Preciso de atendimento" é a coisa mais evidente da tela, sem rolar.
- [ ] "Quero doar" é claramente secundária — contorno, não preenchimento.
- [ ] Os nove cards levam a nove destinos distintos.
- [ ] Nenhum card usa ícone ilustrado ou sombra.
- [ ] O item atual do menu é marcado por barra **e** por atributo, não só por cor.
- [ ] O aviso amarelo tem texto escuro. Se vier com texto branco, reprova (2,20:1).
- [ ] Foco visível em cabeçalho, cards, ações e rodapé.
- [ ] Em 360px nada estoura horizontalmente e os alvos continuam com 44px.
- [ ] Corpo de texto em 17px ou mais; nada abaixo de 15px em lugar nenhum.
- [ ] Nenhum texto sobre imagem.

## Se sair errado

- **Veio com faixa gigante e foto de gente sorrindo**: peça no chat "remova a imagem de
  abertura; o conteúdo começa no primeiro terço da tela, sem foto atrás de texto".
- **Os nove cards viraram uma grade uniforme sem distinção**: peça a separação em dois
  grupos com títulos, "Atendimento" e "Projetos", com espaçamento maior entre grupos do
  que entre cards.
- **Cantos arredondados**: use o painel de Tweaks para zerar o raio — não gasta token.
- **Ficou creme e serifado**: reforce "fundo branco puro, Atkinson Hyperlegible, cantos
  retos" e cite o design system `appd-sjc` de novo.
