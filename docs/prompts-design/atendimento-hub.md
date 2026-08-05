# Prompt — Atendimento (hub)

Rota `/atendimento`. É a porta do Público 1. Reúne os cinco serviços, explica as regras
do atendimento na APPD e leva ao cadastro. **Não repete o conteúdo de cada serviço** —
uma frase por serviço e o link para a página dele.

## A espinha

**Decisão que a tela ajuda a tomar, e em quanto tempo:** em cerca de 15 segundos, a
pessoa descobre se a APPD atende o que ela precisa, qual dos cinco serviços é o dela, e
duas condições que mudam a decisão: a vaga entra em fila e o atendimento é de manhã.

**O que o olho vê primeiro, segundo, terceiro:**

1. "Atendimento" e a frase que diz que são cinco frentes e um cadastro só.
2. As duas condições práticas: fila e período da manhã.
3. Os cinco serviços, cada um levando a uma página diferente.

**O erro do site atual que esta tela corrige:** hoje cinco blocos diferentes levam ao
mesmo formulário do Google, e as regras aparecem só depois. Aqui o hub escolhe por
descrição, não por tentativa, e as regras vêm antes do botão.

**O que esta tela deliberadamente não faz:** não explica fisioterapia, não lista
indicação clínica, não descreve sessão. Isso é da página do serviço. Hub que repete
conteúdo vira página longa que ninguém termina e que precisa ser editada em dois lugares.

**Contribuição não entra aqui.** Decisão do dono em 2026-08-05: o valor aparece uma vez
só, no campo 15 do formulário.

**Estados:** padrão; com faixa de aviso temporário no topo (recesso ou mudança de
horário); foco de teclado percorrendo os cinco cards; leitura em 360px.

---

## O prompt

> Página de índice de serviços ("hub") de um site institucional responsivo (desktop
> 1280px, mobile 360px) da APPD São José dos Campos, associação de pessoas com
> deficiência.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
> Quem lê é a pessoa com deficiência ou um familiar cuidador, muitas vezes com pressa,
> pouca familiaridade digital e usando o celular. Ela chegou de uma busca ou de um link
> no WhatsApp e ainda não sabe qual serviço pedir. A estética é de **balcão de recepção
> bem sinalizado**: pouca coisa na tela, cada opção com um nome claro e uma linha de
> explicação, caminho evidente para quem já sabe o que quer. **Evite** a estética de
> catálogo de produto — grade de nove cartões iguais, selo de "novo", número gigante de
> estatística, ícone ilustrado colorido, foto de banco de imagem com pessoa sorrindo,
> faixa gigante antes do conteúdo, degradê, vidro fosco, sombra pesada, serifa
> decorativa, fundo creme e animação de entrada ao rolar. **Prefira** cinco cartões
> sóbrios de mesma altura, com título grande, uma frase e um link que diz o destino; e
> hierarquia por tamanho de texto e espaço, não por cor de fundo.
>
> Conteúdo, nesta ordem, usando o texto real abaixo:
>
> 1. **Trilha de navegação**: Início › Atendimento.
> 2. **`h1`**: "Atendimento". Abaixo, em 19px: "A APPD atende pessoas com deficiência e
>    suas famílias em cinco frentes. O cadastro é o mesmo para todas e é gratuito."
> 3. **Bloco "Antes de você se cadastrar"**, em amarelo `#bbb070` com texto escuro,
>    ícone textual e borda esquerda de 4px, com dois itens em lista: "As vagas são
>    chamadas conforme abrem — o cadastro entra em fila."; "As sessões acontecem somente
>    no período da manhã." Este bloco fica acima de tudo que explica, nunca no fim.
> 4. **"Como funciona"** — três passos numerados com numeral tipográfico grande, sem
>    ícone desenhado, lado a lado no desktop e empilhados no mobile: "1. Você preenche o
>    cadastro e escolhe o tipo de atendimento."; "2. A associação entra em contato pelo
>    telefone que você informar."; "3. Você fica na fila e é chamada quando abre vaga."
> 5. **"Os cinco atendimentos"** — cinco cards de mesma altura, cada um com título,
>    uma frase e o link "Ver como funciona", e **cada um com destino próprio**. Card com
>    borda de 1px `#e2e5e9`, raio de 10px e sombra discreta; sem ícone ilustrado; o card
>    inteiro é clicável e o link continua visível dentro dele. Os cinco:
>    - Fisioterapia — "Exercícios e técnicas para se mover melhor e com mais autonomia."
>    - Psicologia — "Um espaço reservado para falar do que você está sentindo, com um
>      profissional formado."
>    - Serviço Social — "Ajuda para entender quais direitos existem e onde pedir cada um."
>    - Orientações Gerais — "A primeira conversa: você conta o que precisa e sai sabendo
>      o próximo passo."
>    - Empréstimo de Equipamentos — "Cadeira de rodas, andador, muleta, bengala ou
>      cadeira de banho por tempo determinado."
> 6. **"Procura uma atividade contínua?"** — bloco curto em superfície `#f7f8f9`, com
>    raio de 10px: "A APPD também tem quatro projetos: Bocha Paralímpica, Oficina Mão na
>    Roda, Artesão da Inclusão e Informática Nota 10. Eles têm entrada própria." e o link
>    "Ver os projetos". Sem repetir a descrição de cada projeto aqui.
> 7. **"Onde acontece"** — bloco com fundo `#f7f8f9`, borda `#e2e5e9` e raio de 10px:
>    endereço da sede (Rua Acássia Pereira 136, Campos dos Alemães, São José dos
>    Campos/SP), telefone (12) 3346-0605, celular da Secretaria (12) 99165-7059 e do
>    Serviço Social (12) 99124-7257, e-mail appdsjc@gmail.com. Uma linha marcada
>    `[A CONFIRMAR]` para o horário de funcionamento da secretaria.
> 8. **Perguntas frequentes** — três perguntas em blocos expansíveis, todos **abertos por
>    padrão**: "Preciso pagar para me cadastrar?" ("Não. O cadastro é gratuito."); "Posso
>    pedir mais de um atendimento?" (`[A CONFIRMAR]`); "Quanto tempo demora até me
>    chamarem?" (`[A CONFIRMAR]`).
> 9. **Chamada para ação**, em bloco destacado: título "Pronto para pedir atendimento?",
>    texto "O cadastro é gratuito e leva poucos minutos. Você escolhe o tipo de
>    atendimento no próprio formulário.", botão primário "Fazer meu cadastro" e, abaixo,
>    "Prefere falar com uma pessoa? (12) 3346-0605" com link de telefone e de WhatsApp.
>    Não mencione valor de contribuição em lugar nenhum desta página.
> 10. **Rodapé** igual ao da home.
>
> Trate `[A CONFIRMAR]` como um componente, não como texto solto: um selo em linha, com
> borda de 1px `#6f7782`, raio de 6px, fundo `#f7f8f9`, texto escuro em 15px e o rótulo
> "A confirmar". Ele nunca é sinalizado só por cor e nunca substitui a informação — vem
> ao lado dela, dizendo o que ainda falta.
>
> Acessibilidade como requisito de layout: um `h1` só; headings em sequência sem pular
> nível; foco visível com anel de 3px `#0f4c93` e 2px de folga em todo elemento
> interativo, inclusive no card inteiro; alvos de toque de no mínimo 44px com 8px de
> folga; blocos expansíveis operáveis por teclado com estado anunciado; nada sinalizado
> só por cor; texto nunca justificado; largura de linha entre 60 e 75 caracteres; nada
> abaixo de 15px.
>
> Renderize também, além do estado padrão:
>
> - a mesma página com uma **faixa de aviso temporário** logo abaixo do cabeçalho, texto
>   "A associação está em recesso entre 20 e 30 de dezembro. Os cadastros continuam sendo
>   recebidos." — quero ver se ela convive com o bloco amarelo sem virar parede de
>   destaque;
> - o **foco de teclado** visível no terceiro card, para conferir o anel e a folga;
> - a versão em **360px**, com os cinco cards empilhados e os três passos em coluna.

---

## Aceite visual

- [ ] As duas condições (fila e período da manhã) aparecem antes de qualquer explicação.
- [ ] Os cinco cards levam a cinco destinos distintos.
- [ ] Nenhum card explica o serviço além de uma frase — o hub encaminha, não ensina.
- [ ] Nenhuma menção a valor de contribuição.
- [ ] O bloco amarelo tem texto escuro. Se vier com texto branco, reprova (2,20:1).
- [ ] "Fazer meu cadastro" é a única ação preenchida da página.
- [ ] O selo "A confirmar" tem texto, não é só uma cor.
- [ ] Foco visível no card inteiro, não só no link de dentro.
- [ ] Em 360px nada estoura horizontalmente e os alvos continuam com 44px.
- [ ] Existe alternativa humana (telefone/WhatsApp) ao lado do botão.

## Se sair errado

- **Os cards viraram resumos longos**: peça "cada card tem no máximo uma frase; o texto
  explicativo mora na página do serviço".
- **Apareceu um cartão de projeto junto dos cinco serviços**: peça a separação — os
  projetos são só um bloco de encaminhamento com um link, no item 6.
- **A faixa de recesso ficou amarela igual ao bloco de condições**: peça a faixa em
  superfície neutra `#f7f8f9` com borda, para o amarelo continuar significando uma coisa
  só.
- **Os três passos vieram com ícone desenhado**: peça numeral tipográfico grande em
  `#8b0000` sobre fundo branco, sem círculo colorido nem ilustração.
- **Ficou creme e serifado**: reforce "fundo branco, Atkinson Hyperlegible, neutros
  cinza-frios" e cite o design system `appd-sjc` versão 2 de novo.
