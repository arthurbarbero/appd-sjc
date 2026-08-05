# Prompt — Área do associado

Rota `/area`. O painel de quem já entrou, com quatro assuntos: meus dados, minhas
inscrições, meu crachá e excluir minha conta. As rotas de destino são
`/area/dados`, `/area/inscricoes`, `/area/cracha` e `/area/excluir`
([arquitetura-informacao.md](../arquitetura-informacao.md)).

## A espinha

**Decisão que a tela ajuda a tomar:** "o que eu preciso resolver aqui hoje". O painel
não informa por informar — cada bloco mostra o estado atual em uma linha e oferece uma
ação nomeada. Se um bloco não tem nada a dizer, ele diz qual é o próximo passo.

**Quem chega:** o associado, no celular, geralmente com um motivo específico — ver se a
inscrição andou, mostrar o crachá, corrigir o telefone. Chega direto, sem passear pelo
painel.

**O que o olho vê primeiro, segundo, terceiro:**

1. Que entrou na conta certa: nome e número de registro.
2. As inscrições — é o que quase todo mundo veio ver.
3. O crachá.

**Três decisões que a tela precisa respeitar:**

- **Dado sensível não aparece.** O tipo de deficiência não é exibido em "Meus dados"
  nem no crachá: mostrar dado de saúde numa tela que a pessoa abre no ônibus, ou que
  ela mostra na portaria, é vazamento sem necessidade nenhuma.
- **Excluir conta é encontrável, não escondido.** É direito do titular pela LGPD.
  Fica como bloco próprio no fim do painel, com título claro — não dentro de um menu
  "avançado", não em letra miúda no rodapé.
- **Ação destrutiva é vermelho contornado, nunca preenchido.** No design system,
  preenchido é a ação principal da tela; excluir conta jamais é a ação principal.

**Estados obrigatórios:** painel completo; sem nenhuma inscrição; sem foto no crachá;
carregando; confirmação de exclusão com dupla confirmação.

**O que fica `[A CONFIRMAR]`:** a lista exata do que a APPD é obrigada a manter após a
exclusão, e por quanto tempo. A tela precisa do texto no lugar certo; o conteúdo
depende da associação e do jurídico.

---

## O prompt

> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
>
> Painel da área do associado, rota `/area`, responsivo (desktop 1280px, mobile 360px),
> do site da APPD São José dos Campos, associação de pessoas com deficiência. Quem
> chega é um associado no celular, com baixa familiaridade digital e um motivo
> específico: ver se a inscrição andou, mostrar o crachá ou corrigir um telefone.
>
> A estética é de **painel de serviço público: uma lista de assuntos, não um
> dashboard**. **Evite** barra lateral escura de administrador, cartões de métrica com
> número gigante, gráfico, medidor, avatar circular decorativo, ícone ilustrado
> colorido, fundo creme, serifa decorativa, degradê, vidro fosco, sombra pesada e
> animação de entrada. **Prefira** blocos empilhados de largura total no mobile e em
> duas colunas no desktop, cada um com `h2`, uma linha dizendo o estado atual e uma
> ação nomeada que diz o que acontece ("Ver minhas inscrições", não "Acessar").
>
> Cabeçalho e rodapé são os mesmos da home — bloco reservado de logo (48px, quadrado,
> retângulo sólido `#8b0000` com o texto LOGO), nome "APPD São José dos Campos" e menu
> público; rodapé em `#14161a` com texto branco, endereço (Rua Acássia Pereira 136,
> Campos dos Alemães, São José dos Campos/SP), telefone (12) 3346-0605, e-mail
> appdsjc@gmail.com e os links Política de Privacidade e Seus direitos. No canto do
> cabeçalho, no lugar do link "Entrar", aparece o primeiro nome da pessoa e o botão
> "Sair".
>
> Conteúdo, nesta ordem:
>
> - **Identificação**: `h1` "Minha área" e, abaixo, "Maria Aparecida da Silva" e o
>   número de registro `APPD-2026-00042` em bloco de superfície `#f7f8f9`, com a linha
>   "Este número é seu e não muda."
> - **Navegação da área**: lista horizontal no desktop e empilhada no mobile, com Meus
>   dados, Minhas inscrições, Meu crachá e Excluir conta, item atual marcado por
>   sublinhado espesso **e** `aria-current="page"`, nunca só por cor.
> - **Bloco "Minhas inscrições"** (`/area/inscricoes`) — o mais destacado dos quatro.
>   Lista de inscrições, cada uma com o tipo de atendimento pedido, a data do pedido e
>   o status em etiqueta com **ícone e texto**, nunca só cor: "Na fila", "Em
>   atendimento", "Encerrada". Ação "Ver minhas inscrições".
> - **Bloco "Meu crachá"** (`/area/cracha`) — prévia do crachá com foto, nome, número
>   de registro `APPD-2026-00042` e status. **O crachá não mostra tipo de deficiência.**
>   Abaixo, a linha "Qualquer pessoa pode conferir este crachá em
>   appd.org.br/verificar/APPD-2026-00042 — a página mostra apenas nome, número e
>   status." Ações "Ver meu crachá" e "Baixar para imprimir".
> - **Bloco "Meus dados"** (`/area/dados`) — nome, data de nascimento, e-mail,
>   telefone e endereço, cada um com rótulo visível e valor abaixo. Ação "Alterar meus
>   dados". Abaixo, uma linha discreta: "A informação sobre deficiência que você deu no
>   Cadastro de Atendimento não é exibida aqui. Para consultar ou apagar, veja Seus
>   direitos ou ligue para (12) 3346-0605." Nenhum dado de saúde na tela.
> - **Bloco "Excluir minha conta"** (`/area/excluir`) — último bloco, separado dos
>   demais por um espaço maior e uma divisória, com borda de 1px `#8b0000`, fundo
>   branco, `h2` "Excluir minha conta", a linha "Você pode apagar sua conta quando
>   quiser. É um direito seu pela LGPD." e um botão **contornado em vermelho `#8b0000`,
>   fundo transparente, texto `#8b0000`** com o rótulo "Excluir minha conta". O bloco é
>   visível sem interação, não fica atrás de "opções avançadas", e o botão nunca é
>   preenchido.
>
> Renderize estas cinco telas:
>
> 1. **Painel completo** — como descrito acima, com duas inscrições, foto no crachá e
>    todos os dados preenchidos.
> 2. **Sem nenhuma inscrição** — o bloco de inscrições em estado vazio que **oferece o
>    próximo passo**, não apenas informa a ausência: título "Você ainda não pediu
>    atendimento", a linha "O cadastro é gratuito. Você entra na fila e a associação
>    entra em contato pelo telefone.", botão primário "Fazer meu Cadastro de
>    Atendimento" e, em texto, "Prefere por telefone? (12) 3346-0605". Sem ilustração
>    de caixa vazia.
> 3. **Sem foto no crachá** — no lugar da foto, um retângulo de superfície `#f7f8f9`
>    com borda tracejada `#6f7782` e o texto "Sem foto"; o bloco explica em uma linha
>    "O crachá precisa de foto para ser impresso." e traz o botão "Enviar minha foto".
>    O restante do painel continua funcionando normalmente — a falta de foto não
>    bloqueia nada além da impressão.
> 4. **Carregando** — blocos com áreas de espaço reservado em `#f7f8f9`, mantendo o
>    mesmo tamanho do conteúdo final para a página não pular, com o texto "Carregando
>    suas informações…" anunciado em região `aria-live="polite"`. Sem animação que gire
>    indefinidamente e sem pulsar.
> 5. **Confirmação de exclusão** (`/area/excluir`) — página própria, não janela
>    sobreposta, com `h1` "Excluir minha conta" e **dupla confirmação em dois passos
>    empilhados e visíveis**. Antes deles, três blocos de texto com títulos próprios:
>    "O que é apagado" (sua conta e sua senha, seu e-mail e telefone, sua foto do
>    crachá, o seu acesso a esta área); "O que a associação precisa manter" (registro
>    dos atendimentos já realizados e o número de registro, por obrigação legal —
>    marque como `[A CONFIRMAR]` em nota fora do layout, junto do prazo); e "Isto não
>    pode ser desfeito" em bloco amarelo `#bbb070` com texto escuro `#14161a`, ícone e
>    borda esquerda, dizendo "A exclusão é definitiva. Para voltar a ser atendido, você
>    precisará fazer um cadastro novo." **Passo 1**: caixa de seleção desmarcada com o
>    texto "Entendi que a exclusão é definitiva e não pode ser desfeita." **Passo 2**:
>    segunda caixa de seleção, desmarcada, com o texto "Quero apagar minha conta e meus
>    dados." **Não** peça para digitar uma palavra de confirmação: teclar "EXCLUIR" em
>    maiúsculas é barreira real para quem tem dificuldade motora ou intelectual, e este
>    site atende exatamente essas pessoas. Duas caixas separadas já dão a fricção
>    necessária. O botão "Excluir minha conta agora" é contornado em vermelho, nunca
>    preenchido, e permanece desabilitado com o motivo dito em texto ao lado —
>    "Marque as duas caixas para liberar" — até os dois passos estarem completos. Ao lado, o botão primário preenchido é **"Cancelar e voltar"**: a saída
>    segura é a ação principal desta página. No fim, a alternativa humana: "Prefere
>    resolver com uma pessoa? Ligue para (12) 3346-0605."
>
> Acessibilidade como requisito de layout: um `h1` por tela; hierarquia de headings sem
> pular nível; foco visível de 3px `#0f4c93` com 2px de folga; ordem de foco igual à
> ordem visual; alvos de 44px com 8px de folga; status com ícone e texto, nunca só cor;
> desabilitado com motivo em texto, nunca só opacidade; nada abaixo de 15px; em 360px
> nada estoura horizontalmente.

---

## Aceite visual

- [ ] Nenhuma tela mostra tipo de deficiência — nem em "Meus dados", nem no crachá.
- [ ] "Excluir minha conta" é um bloco visível do painel, sem cliques para descobrir.
- [ ] O botão de excluir é contornado em vermelho; nenhum botão destrutivo preenchido.
- [ ] Na confirmação, a ação preenchida é "Cancelar e voltar".
- [ ] A confirmação tem dois passos e diz o que é apagado, o que é mantido e que é
      irreversível.
- [ ] O estado vazio de inscrições oferece o cadastro de atendimento, não só "nada
      aqui".
- [ ] Sem foto, o crachá explica o efeito e oferece o envio — e o resto do painel
      funciona.
- [ ] O carregando ocupa o mesmo espaço do conteúdo final e não gira indefinidamente.
- [ ] Status de inscrição tem ícone e texto.
- [ ] O número `APPD-2026-00042` aparece igual em todos os blocos e é dito imutável.
- [ ] Corpo de texto em 17px ou mais; alvos de 44px em 360px.

## Se sair errado

- **Virou dashboard com números grandes e gráfico**: peça "lista de assuntos, não
  painel de métricas; cada bloco com título, uma linha de estado e uma ação nomeada".
- **O botão de excluir veio preenchido de vermelho**: reprovação dura. Peça "ação
  destrutiva é contornada; preenchido é reservado à ação principal".
- **Excluir conta ficou escondido em menu ou rodapé**: peça "bloco próprio no fim do
  painel, com `h2` e borda vermelha, visível sem interação".
- **A confirmação virou janela sobreposta**: peça "página própria em `/area/excluir`,
  sem modal, com os dois passos empilhados e visíveis".
- **Apareceu tipo de deficiência em algum bloco**: reprovação dura. Peça a remoção e a
  renderização de novo.
- **O estado vazio virou ilustração com "nada por aqui"**: peça "título, uma linha
  explicando e o botão do próximo passo; sem ilustração".
- **Barra lateral escura de admin**: peça "navegação horizontal simples com item atual
  sublinhado e `aria-current`, sobre fundo branco".
