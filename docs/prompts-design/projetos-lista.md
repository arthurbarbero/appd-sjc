# Prompt — Projetos (lista)

Rota `/projetos`. Lista os quatro projetos: Bocha Paralímpica, Oficina Mão na Roda,
Artesão da Inclusão e Informática Nota 10. É a única tela do site que precisa mostrar,
lado a lado, um projeto com dado confirmado e três sem — sem que os três pareçam
abandonados.

## A espinha

**Decisão que a tela ajuda a tomar:** "existe uma atividade contínua para mim, e como eu
entro?" Diferente do atendimento, projeto não é sessão marcada: é turma, treino, oficina,
com dia e lugar. Quem chega aqui quer saber quando e onde, e o que precisa fazer para
começar.

**O que o olho vê primeiro, segundo, terceiro:**

1. O que é um projeto na APPD, em uma frase, e como ele difere do atendimento.
2. Como se entra num projeto hoje — inclusive a parte incômoda.
3. Os quatro projetos, com o que se sabe de cada um, dito na cara.

**O estado que manda nesta tela: informação em revisão.** O Informática Nota 10 existe e
está funcionando — confirmado presencialmente pelo dono em 2026-08-05 — mas horários,
turmas e responsável não estão confirmados. Mão na Roda e Artesão da Inclusão também não
publicam dia nem horário. Só a Bocha tem os dois. A lista precisa mostrar isso **no
próprio card**, como estado normal de um projeto ativo, e não como erro ou pendência.
Marcação escondida em nota de rodapé faz a pessoa ir até o local no dia errado.

**O atrito real que a tela assume:** os quatro projetos **não são opções** do campo "Tipo
de Atendimento" do formulário. Hoje só dá para pedir marcando `Outro` e escrevendo o
nome. A tela diz isso como instrução — "escolha Outro e escreva o nome do projeto" — e
não como desculpa. Instrução clara resolve; pedido de desculpas só assusta.

**Contribuição não entra aqui.** O valor aparece uma vez só, no campo 15 do formulário.

**Estados:** padrão (um card com horário, três em revisão); lista com nenhum horário
confirmado; foco de teclado no card; leitura em 360px.

---

## O prompt

> Página de lista de projetos de um site institucional responsivo (desktop 1280px, mobile
> 360px) da APPD São José dos Campos, associação de pessoas com deficiência.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
> Quem lê é a pessoa com deficiência, um familiar cuidador ou alguém procurando atividade
> para o filho ou a mãe. Ela quer dia, horário e endereço — e vai desistir se precisar
> abrir quatro páginas para descobrir que três não têm horário publicado. A estética é de
> **quadro de avisos honesto**: cada projeto ocupa um bloco largo, com o que se sabe em
> texto, e o que não se sabe dito em uma linha, no mesmo tamanho de letra. **Evite** a
> estética de catálogo de curso — cartão com foto de capa, selo de "inscrições abertas",
> contagem de vagas, badge colorido sem texto, ícone ilustrado colorido, foto de banco de
> imagem com pessoa sorrindo, faixa gigante antes do conteúdo, degradê, vidro fosco,
> sombra pesada, serifa decorativa, fundo creme e animação de entrada ao rolar.
> **Prefira** quatro blocos de largura total, empilhados, com título grande, uma frase,
> uma linha de "quando e onde" e um link — e que o bloco sem horário tenha exatamente o
> mesmo peso visual do bloco com horário.
>
> Conteúdo, nesta ordem, usando o texto real abaixo:
>
> 1. **Trilha de navegação**: Início › Projetos.
> 2. **`h1`**: "Projetos". Abaixo, em 19px: "Além do atendimento, a APPD mantém quatro
>    atividades contínuas: esporte, oficina de manutenção, artesanato e informática."
> 3. **Bloco "Como entrar num projeto"**, em amarelo `#bbb070` com texto escuro, ícone
>    textual e borda esquerda de 4px, acima dos projetos, com três itens em lista: "A
>    entrada é pelo mesmo cadastro de atendimento."; "No campo Tipo de Atendimento,
>    escolha **Outro** e escreva o nome do projeto."; "Se preferir, ligue para a
>    Secretaria: (12) 3346-0605." Escreva como instrução, não como aviso de problema.
> 4. **Os quatro projetos** — quatro blocos de largura total, borda de 1px `#e2e5e9`,
>    raio de 10px, sombra discreta, empilhados com 24px entre eles. Cada bloco tem:
>    título em 22px, uma frase de descrição, uma linha "Quando e onde" e o link "Ver o
>    projeto" com destino próprio. Sem foto, sem ícone ilustrado. Os quatro:
>    - **Bocha Paralímpica** — "Esporte de precisão criado para pessoas com deficiência
>      motora severa. O treino é sentado e vale mais mira do que força." Quando e onde:
>      "Segundas, quartas e sextas na Praça de Esportes Pedro Otávio; terças e quintas no
>      Centro Esportivo Palmeiras São José. Das 13h às 16h30."
>    - **Oficina Mão na Roda** — "Manutenção de cadeira de rodas, muletas, andadores e
>      bengalas, para quem não tem como pagar o conserto." Quando e onde: selo "A
>      confirmar" e a linha "Dias, horários e local ainda não confirmados."
>    - **Artesão da Inclusão** — "Oficinas de artesanato e apoio para vender as peças,
>      com renda para a pessoa com deficiência e para quem cuida dela." Quando e onde:
>      selo "A confirmar" e a linha "Dias, horários e local ainda não confirmados."
>    - **Informática Nota 10** — "Aulas de informática para pessoas com deficiência usarem
>      o computador com mais autonomia." Quando e onde: selo "A confirmar" e a linha "O
>      projeto está funcionando. Horários, turmas e responsável ainda não confirmados."
> 5. **"Não é isso que você procura?"** — bloco curto em superfície `#f7f8f9` com raio de
>    10px: "A APPD também faz atendimento de fisioterapia, psicologia, serviço social,
>    orientações gerais e empréstimo de equipamentos." e o link "Ver os atendimentos".
> 6. **Chamada para ação**, em bloco destacado: título "Quer participar de um projeto?",
>    texto "O primeiro passo é o cadastro. Ele é gratuito e leva poucos minutos. Lembre de
>    escolher Outro e escrever o nome do projeto.", botão primário "Fazer meu cadastro" e,
>    abaixo, "Prefere falar com uma pessoa? (12) 3346-0605" com link de telefone e de
>    WhatsApp. Não mencione valor de contribuição em lugar nenhum desta página.
> 7. **Rodapé** igual ao da home: endereço (Rua Acássia Pereira 136, Campos dos Alemães,
>    São José dos Campos/SP), CNPJ 08.074.883/0001-96, telefone (12) 3346-0605, celulares
>    (12) 99165-7059 da Secretaria e (12) 99124-7257 do Serviço Social, e-mail
>    appdsjc@gmail.com.
>
> O selo **"A confirmar"** é um componente, e é o coração desta tela: retângulo em linha,
> borda de 1px `#6f7782`, raio de 6px, fundo `#f7f8f9`, texto escuro em 15px com o rótulo
> escrito por extenso. Ele nunca é sinalizado só por cor, nunca aparece sozinho — vem
> sempre colado à frase que diz **o que** falta confirmar — e não escurece, não apaga nem
> reduz o bloco do projeto. Projeto em revisão continua sendo projeto ativo.
>
> Acessibilidade como requisito de layout: um `h1` só; headings em sequência sem pular
> nível; foco visível com anel de 3px `#0f4c93` e 2px de folga em todo elemento
> interativo, inclusive no bloco de projeto inteiro; alvos de toque de no mínimo 44px com
> 8px de folga; nada sinalizado só por cor; texto nunca justificado; largura de linha
> entre 60 e 75 caracteres; nada abaixo de 15px.
>
> Renderize também, além do estado padrão:
>
> - a **lista sem nenhum horário confirmado** — os quatro blocos com o selo "A confirmar",
>   inclusive a Bocha — para eu ver se a página aguenta o cenário em que a associação
>   ainda não devolveu nada, sem parecer site abandonado;
> - o **foco de teclado** no bloco da Oficina Mão na Roda;
> - a versão em **360px**, com os quatro blocos empilhados e a linha "Quando e onde"
>   quebrando em duas, sem rolagem horizontal.

---

## Aceite visual

- [ ] O bloco em revisão tem o mesmo peso visual do bloco com horário — não é cinza, não
      está esmaecido, não está menor.
- [ ] O selo "A confirmar" traz texto e vem junto da frase que diz o que falta.
- [ ] A instrução de escolher "Outro" aparece antes dos projetos **e** ao lado do botão.
- [ ] A instrução soa como caminho, não como desculpa ou aviso de defeito.
- [ ] Os quatro blocos levam a quatro destinos distintos.
- [ ] Nenhuma menção a valor de contribuição.
- [ ] O bloco amarelo tem texto escuro. Se vier com texto branco, reprova (2,20:1).
- [ ] "Fazer meu cadastro" é a única ação preenchida da página.
- [ ] Nenhum projeto tem foto de capa ou ícone ilustrado.
- [ ] Em 360px nada estoura horizontalmente e os alvos continuam com 44px.

## Se sair errado

- **Os projetos em revisão vieram apagados** (cinza, opacidade menor, cadeado): peça
  "todos os quatro blocos com o mesmo contraste e o mesmo tamanho; o que muda é a frase,
  não a intensidade".
- **O selo virou uma bolinha colorida**: peça o selo com o texto "A confirmar" escrito,
  com borda e sem depender de cor.
- **Virou grade de três colunas com cartão pequeno**: peça blocos de largura total,
  empilhados — a linha "Quando e onde" precisa caber em uma ou duas linhas de texto.
- **A instrução do campo "Outro" ficou com tom de pedido de desculpas**: peça a
  reescrita em imperativo curto, sem "infelizmente" e sem "no momento".
- **Ficou creme e serifado**: reforce "fundo branco, Atkinson Hyperlegible, neutros
  cinza-frios" e cite o design system `appd-sjc` versão 2 de novo.
