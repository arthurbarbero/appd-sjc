# Prompt — Página de projeto (template)

Rota `/projetos/<slug>`. Esta tela vale por quatro: Bocha Paralímpica, Oficina Mão na
Roda, Artesão da Inclusão e Informática Nota 10. Gere com o conteúdo da **Bocha
Paralímpica**, que é o único projeto com dia, horário e endereço publicados, e trate o
resultado como template.

Mesmo esqueleto da [página de serviço](servico.md), com duas diferenças que mudam o
layout: um bloco de **locais e horários de treino** em tabela, e um **caminho de entrada
diferente** — projeto não é opção do formulário.

## A espinha

**Decisão que a tela ajuda a tomar:** "esta atividade serve para mim, e eu consigo chegar
lá na quarta às 13h?" Projeto não é sessão agendada: é lugar fixo, dia fixo e horário
fixo. Quem chega aqui já quase decidiu — falta saber onde é, quando é e como se entra.

**O que o olho vê primeiro, segundo, terceiro:**

1. O nome do projeto e a frase que explica o que é.
2. **Onde e quando treina** — a tabela sobe, não desce.
3. Como entrar: o cadastro, com a instrução do campo "Outro".

**Por que a tabela sobe.** Na página de serviço, o que vem antes do texto são as duas
condições (fila, período da manhã). Aqui não existe fila: existe endereço. Enterrar
horário no meio do texto é o erro mais caro desta tela — é a informação que a pessoa veio
buscar, e é a única que faz alguém sair de casa.

**O caminho de entrada é diferente, e a tela não esconde isso.** Bocha Paralímpica **não
é opção** do campo "Tipo de Atendimento" do formulário. Quem quer entrar marca `Outro` e
escreve o nome do projeto. A chamada para ação vira uma instrução de dois passos, não um
botão solto. Botão sem a instrução produz cadastro que ninguém consegue encaminhar.

**O bloco de horários precisa de estado vazio.** Três dos quatro projetos não têm horário
publicado. O template só está pronto se a tabela souber ficar vazia com honestidade — e
esse estado é regra, não exceção.

**Contribuição não entra aqui.** O valor aparece uma vez só, no campo 15 do formulário.

**Estados:** completo (Bocha); **horários em revisão** (o mesmo template sem nenhuma linha
de tabela); tabela empilhada em 360px.

---

## O prompt

> Página de projeto de um site institucional responsivo (desktop 1280px, mobile 360px) da
> APPD São José dos Campos, associação de pessoas com deficiência.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
> Quem lê é a pessoa com deficiência motora ou quem cuida dela, decidindo se consegue
> chegar a um treino numa tarde de semana. É uma página de **leitura com um dado
> operacional no meio**: texto corrido bem espaçado, largura de linha entre 60 e 75
> caracteres, subtítulos frequentes, e uma tabela de horários que precisa ser lida de
> relance. A estética é de material informativo público bem diagramado — pense em cartaz
> de programação de centro esportivo municipal bem-feito, não em página de academia.
> **Evite** foto de atleta, número gigante de medalhas, citação motivacional em fonte
> grande, qualquer palavra do campo "superação", ícone ilustrado colorido, foto de banco
> de imagem com pessoa sorrindo, faixa gigante antes do conteúdo, degradê, vidro fosco,
> sombra pesada, serifa decorativa, fundo creme, coluna dupla de texto corrido e animação
> de entrada ao rolar. **Prefira** a tabela de horários logo no primeiro terço da tela,
> texto em coluna única e um sumário navegável no topo em telas largas.
>
> Conteúdo, nesta ordem, usando o texto real abaixo:
>
> 1. **Trilha de navegação**: Início › Projetos › Bocha Paralímpica.
> 2. **`h1`**: "Bocha Paralímpica". Abaixo, em 19px: "Esporte de precisão criado para
>    pessoas com deficiência motora severa. O treino é sentado e vale mais mira do que
>    força."
> 3. **Bloco "Locais e horários de treino"**, imediatamente abaixo do subtítulo, em fundo
>    `#f7f8f9`, borda `#e2e5e9` e raio de 10px. Traz uma tabela com cabeçalho em `#eef1f4`
>    e três colunas — Local, Dias, Horário — e, logo abaixo dela, a linha "Responsáveis:
>    Educador Físico José Guardia e Prof. Zézinho." com um selo "A confirmar" e a frase
>    "Estamos confirmando com a associação se estes horários seguem valendo em 2026." As
>    duas linhas da tabela:
>    - "Praça de Esportes Pedro Otávio — Rua Palmares 841, Pq Industrial" · "Segundas,
>      quartas e sextas" · "13h às 16h30"
>    - "Centro Esportivo Palmeiras São José — Rua Saudades de Querencia 225" · "Terças e
>      quintas" · "13h às 16h30"
> 4. **"Para quem é"** — quatro itens curtos: pessoas com comprometimento motor nos quatro
>    membros; quem usa cadeira de rodas; quem não move os braços e joga com calha e
>    ponteira de cabeça; quem nunca praticou esporte antes.
> 5. **"O que é a bocha paralímpica"** — quatro parágrafos de texto corrido com dois
>    subtítulos: como o jogo funciona (bolim, seis bolas por lado, quem chega mais perto
>    marca ponto), as quatro classes BC1 a BC4, e por que a modalidade existe — foi criada
>    dentro do movimento paralímpico e não tem equivalente olímpico.
> 6. **"O que esperar no treino"** — três parágrafos: o treino é sentado e não exige
>    esforço intenso; o trabalho é de mira, controle e leitura de quadra; atleta e
>    auxiliar ou calheiro treinam juntos, porque a dupla joga como uma unidade.
> 7. **"Como funciona na APPD"** — bloco com fundo `#f7f8f9`, borda `#e2e5e9` e raio de
>    10px, com o que é confirmado (sede: Rua Acássia Pereira 136, Campos dos Alemães, São
>    José dos Campos/SP; telefone (12) 3346-0605; celular da Secretaria (12) 99165-7059) e
>    quatro linhas com selo "A confirmar": se a participação é gratuita; se a APPD empresta
>    bolas, calha e ponteira; quantas vagas existem; se é preciso atestado médico.
> 8. **Perguntas frequentes** — quatro perguntas em blocos expansíveis, todos **abertos
>    por padrão**: "Preciso ter experiência em esporte?" ("Não. As regras básicas se
>    aprendem em uma sessão."); "Consigo jogar se não movimento os braços?" ("Sim. Na
>    classe BC3 a bola é lançada por uma calha, com apoio de um calheiro."); "Preciso
>    passar por classificação funcional?" ("Só para competir. Para treinar, não é
>    exigido."); "Existe idade mínima?" (selo "A confirmar").
> 9. **Chamada para ação**, em bloco destacado, com a instrução dentro dela e não em nota:
>    título "Quer treinar bocha na APPD?", texto "O primeiro passo é o cadastro de
>    atendimento. Ele é gratuito e leva poucos minutos.", seguido de dois passos numerados
>    com numeral tipográfico — "1. No campo Tipo de Atendimento, escolha **Outro**."; "2.
>    Escreva **Bocha Paralímpica** no espaço ao lado." — botão primário "Fazer meu
>    cadastro" e, abaixo, "Prefere falar com uma pessoa? (12) 3346-0605" com link de
>    telefone e de WhatsApp. Não mencione valor de contribuição em lugar nenhum desta
>    página.
> 10. **Rodapé** igual ao da home.
>
> O selo **"A confirmar"** é um componente reutilizado do resto do site: retângulo em
> linha, borda de 1px `#6f7782`, raio de 6px, fundo `#f7f8f9`, texto escuro em 15px com o
> rótulo escrito por extenso, sempre colado à frase que diz o que falta confirmar. Nunca
> sinalizado só por cor, nunca esmaecendo o conteúdo em volta.
>
> Acessibilidade como requisito de layout: um `h1` só; headings em sequência sem pular
> nível; foco visível com anel de 3px `#0f4c93` e 2px de folga em todo elemento
> interativo; alvos de toque de no mínimo 44px com 8px de folga; tabela com `<th>` de
> cabeçalho associado às células e legenda que diz o que ela contém; blocos expansíveis
> operáveis por teclado com estado anunciado; nada sinalizado só por cor; texto nunca
> justificado; largura de linha entre 60 e 75 caracteres; nada abaixo de 15px.
>
> Renderize também, além do estado completo:
>
> - a variação **"horários em revisão"**, que é o estado de três dos quatro projetos: o
>   mesmo bloco do item 3, no mesmo lugar e com o mesmo tamanho, sem nenhuma linha de
>   tabela, trazendo o texto "Ainda não confirmamos os dias, os horários e o local deste
>   projeto com a associação. Ligue para (12) 3346-0605 e a gente informa." mais o selo "A
>   confirmar" — quero ver se o bloco vazio continua parecendo informação, e não erro de
>   carregamento;
> - a versão em **360px**, em que a tabela **não** rola para o lado: cada local vira um
>   bloco empilhado com os rótulos Local, Dias e Horário visíveis à esquerda de cada
>   valor.

---

## Aceite visual

- [ ] A tabela de horários aparece no primeiro terço da tela, antes do texto longo.
- [ ] A tabela tem cabeçalho de coluna real e legenda; não é uma grade de `div`.
- [ ] A instrução de escolher "Outro" está dentro da chamada para ação, não em rodapé.
- [ ] O botão "Fazer meu cadastro" é a única ação preenchida da página.
- [ ] Nenhuma menção a valor de contribuição.
- [ ] Nenhum telefone de responsável técnico publicado — só os números da associação.
- [ ] O estado "horários em revisão" ocupa o mesmo espaço e não parece falha de
      carregamento.
- [ ] Em 360px a tabela vira blocos empilhados, sem rolagem horizontal.
- [ ] As perguntas frequentes vêm abertas por padrão.
- [ ] Nenhuma palavra de "superação", nenhum retrato inspiracional, nenhuma foto.

## Se sair errado

- **A tabela desceu para o fim da página**: reforce "o bloco de locais e horários fica
  imediatamente abaixo do subtítulo, antes de qualquer texto explicativo".
- **A tabela rola para o lado no celular**: peça "em 360px cada local vira um bloco
  empilhado com rótulo à esquerda; tabela com rolagem horizontal é inacessível".
- **O estado vazio virou uma caixa cinza sem texto**: peça a frase completa mais o selo
  "A confirmar" e o telefone — bloco vazio sem explicação lê como site quebrado.
- **Apareceram os telefones dos responsáveis**: peça a remoção; publicar número de pessoa
  física depende de autorização dela, e ela ainda não foi consultada.
- **Virou página de time esportivo** (foto de atleta, contagem de medalhas, patrocínio):
  peça "remova imagem e estatística; esta página é informativa e o conteúdo é o texto".
