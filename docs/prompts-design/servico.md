# Prompt — Página de serviço (template)

Esta tela vale por cinco: Fisioterapia, Psicologia, Serviço Social, Orientações Gerais e
Empréstimo de Equipamentos. Gere com o conteúdo de **Fisioterapia** e trate o resultado
como template. As páginas de projeto (Bocha, Mão na Roda, Artesão, Informática) usam o
mesmo esqueleto com um bloco a mais de horários.

## A espinha

**Decisão que a tela ajuda a tomar:** "isto serve para mim, e eu consigo participar?"
A pessoa precisa entender o que é o serviço, se ela se encaixa, e descobrir **antes de
clicar** que a vaga entra em fila, que o atendimento é de manhã e que existe uma
contribuição sugerida. Hoje ela só descobre isso depois de abrir o formulário do Google
— e quem trabalha de manhã perde o tempo dela e o da associação.

**O que o olho vê primeiro, segundo, terceiro:**

1. O nome do serviço e a frase que explica o que é.
2. As três condições práticas: fila, manhã, contribuição sugerida.
3. A ação: fazer o cadastro.

**Estados:** completo; **conteúdo em revisão** (o serviço existe mas a associação ainda
não confirmou horário e responsável — precisa ficar honesto na tela, não em nota de
rodapé); e leitura longa em 360px.

---

## O prompt

> Página de serviço de um site institucional responsivo (desktop 1280px, mobile 360px)
> da APPD São José dos Campos, associação de pessoas com deficiência. Use o design
> system do projeto `appd-sjc`: fundo branco, texto `#1a1a1a`, ação `#8b0000`
> preenchida, verde `#4e5d2e`, amarelo `#bbb070` só com texto escuro, borda `#8d7158`,
> Atkinson Hyperlegible, corpo 17px, cantos retos, sem sombra, base 8.
> Quem lê é a pessoa com deficiência ou um familiar cuidador, frequentemente cansado,
> com pouca familiaridade digital, decidindo se vale a pena procurar a associação. É
> uma página de **leitura**, não uma vitrine: texto corrido bem espaçado, largura de
> linha entre 60 e 75 caracteres, subtítulos frequentes para permitir varredura, e a
> ação repetida no fim. A estética é de material informativo público bem
> diagramado — pense em cartilha de saúde bem-feita, não em landing page de produto.
> **Evite** coluna dupla de texto corrido, citação decorativa em fonte grande, número
> gigante de estatística, ícone ilustrado, e qualquer bloco que empurre o texto para
> baixo da dobra. **Prefira** um sumário navegável no topo em telas largas, e blocos de
> destaque com borda e ícone textual.
>
> Conteúdo, nesta ordem, usando o texto real abaixo:
>
> 1. **Trilha de navegação**: Início › Atendimento › Fisioterapia.
> 2. **`h1`**: "Fisioterapia". Abaixo, em 19px: "Atendimento de fisioterapia para
>    pessoas com deficiência, com foco em manter e recuperar a autonomia de movimento."
> 3. **Bloco "Antes de você se cadastrar"**, em amarelo `#bbb070` com texto escuro,
>    ícone e borda esquerda de 4px, com três itens em lista: "As vagas são chamadas
>    conforme abrem — o cadastro entra em fila."; "As sessões acontecem somente no
>    período da manhã."; "É sugerida uma contribuição solidária de R$ 50,00 por mês,
>    ajustável conforme a situação de cada pessoa. Ela não é condição para ser
>    atendido." Este bloco fica **acima** do texto explicativo, não no fim da página.
> 4. **"Para quem é"** — lista de quatro itens curtos.
> 5. **"O que a fisioterapia faz"** — quatro parágrafos de texto corrido com dois
>    subtítulos, conteúdo informativo sobre reabilitação e autonomia.
> 6. **"O que esperar"** — como é uma sessão, em três parágrafos.
> 7. **"Como funciona na APPD"** — bloco com fundo `#f5f2ea` e borda, contendo o que é
>    confirmado (endereço da sede: Rua Acássia Pereira 136, Campos dos Alemães;
>    telefone (12) 3346-0605) e um aviso de que horário, responsável técnico e
>    frequência estão em revisão pela associação.
> 8. **Perguntas frequentes** — quatro perguntas em blocos expansíveis, todos **abertos
>    por padrão** (conteúdo escondido atrás de clique é barreira; a expansão serve só
>    para recolher o que já foi lido).
> 9. **Chamada para ação**, em bloco destacado: título "Quer atendimento de
>    fisioterapia?", texto "O primeiro passo é o cadastro. Ele é gratuito e leva poucos
>    minutos.", botão primário "Fazer meu cadastro", e abaixo "Prefere falar com uma
>    pessoa? (12) 3346-0605" com link de telefone e de WhatsApp.
> 10. **Rodapé** igual ao da home.
>
> Acessibilidade como requisito de layout: um `h1` só; headings em sequência sem pular
> nível; foco visível de 3px `#8b0000` com 2px de folga; alvos de 44px; blocos
> expansíveis operáveis por teclado com estado anunciado; nada sinalizado só por cor;
> texto não justificado.
>
> Renderize também a **variação "conteúdo em revisão"**: a mesma página com um bloco de
> aviso logo abaixo do `h1` dizendo "Estamos revisando as informações deste serviço com
> a associação. Horários e responsável podem mudar." — quero ver como o aviso convive
> com o bloco amarelo sem virar uma parede de destaques.

---

## Aceite visual

- [ ] As três condições (fila, manhã, contribuição) aparecem **antes** do texto longo.
- [ ] O bloco amarelo tem texto escuro.
- [ ] O texto tem 60 a 75 caracteres por linha e não está justificado.
- [ ] As perguntas frequentes vêm abertas por padrão.
- [ ] A ação de cadastro aparece no fim e é a única ação preenchida da página.
- [ ] O bloco "em revisão" não compete visualmente com o aviso amarelo.
- [ ] Existe alternativa humana (telefone/WhatsApp) ao lado do botão.
- [ ] Em 360px a leitura continua confortável, sem rolagem horizontal.

## Se sair errado

- **Virou landing page de produto** (números gigantes, depoimento, selo): peça "remova
  estatística destacada e depoimento; esta página é informativa, o conteúdo é o texto".
- **As perguntas vieram fechadas**: peça explicitamente "todas as perguntas frequentes
  abertas por padrão".
- **O bloco de condições foi para o fim**: reforce "o bloco 'Antes de você se cadastrar'
  fica imediatamente abaixo do subtítulo, antes de qualquer texto explicativo".
- **Texto em duas colunas**: peça coluna única — leitura em duas colunas quebra para
  quem usa ampliação de tela.
