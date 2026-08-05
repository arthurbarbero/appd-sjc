# Prompt — Cadastro

Rota `/cadastro`. Criar conta é o que dá acesso à área do associado e ao crachá. É
a porta de entrada da parte autenticada do site — e a única coisa que esta tela faz.

## A espinha

**Decisão que a tela ajuda a tomar:** se vale criar conta agora. A tela precisa
responder "para que serve isso e quanto trabalho vai dar" antes do primeiro campo. O
sucesso é a pessoa sair com conta criada e com o número de registro anotado.

**O que esta tela não é:** não é o pedido de atendimento. Quem chega aqui achando que
está entrando na fila sai duas vezes frustrado — cria conta e não é chamado. A
diferença precisa estar dita em uma frase, no topo, com o link para o formulário de
atendimento.

**Quem preenche:** a pessoa com deficiência ou um familiar cuidador, no celular, com
baixa familiaridade digital. Muita gente aqui nunca criou conta em site nenhum. Cada
campo a mais é uma chance de desistência: o cadastro pede o mínimo para existir uma
conta e nada além disso.

**O que o olho vê primeiro, segundo, terceiro:**

1. Para que serve a conta, e que são poucos campos.
2. O campo atual, sozinho e claro.
3. A senha — com os requisitos ditos **antes** de digitar, nunca como erro depois.

**A decisão de desenho mais importante:** a foto **não trava o cadastro**. O crachá
exige foto, mas ninguém pode ficar sem conta por não ter uma foto na hora. A foto é um
bloco opcional, com o caminho de enviar depois pela área do associado dito ali mesmo.

**O que esta tela não pergunta:** tipo de deficiência. É dado sensível (Art. 11 da
LGPD) e não é necessário para criar uma conta. Ele vive no formulário de atendimento,
com consentimento próprio, e não se repete aqui.

**Estados obrigatórios:** vazio; erro por campo com resumo no topo e **todas as demais
respostas preservadas**; enviando; sucesso com o número de registro.

---

## O prompt

> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
>
> Tela de criação de conta, rota `/cadastro`, responsiva (desktop 1280px, mobile
> 360px), do site da APPD São José dos Campos, associação de pessoas com deficiência.
> Quem preenche é a pessoa com deficiência ou um familiar cuidador, no celular, com
> baixa familiaridade digital — parte do público nunca criou conta em site nenhum. A
> conta serve para dois fins concretos: acompanhar as inscrições e ter o crachá de
> associado. A tela pede o mínimo para isso existir.
>
> A estética é de **balcão de atendimento digital**: coluna única estreita, alinhada ao
> topo, campos largos, muito respiro entre eles, um assunto por vez, contraste alto.
> **Evite** fundo creme, serifa decorativa, degradê, vidro fosco, sombra pesada, ícone
> ilustrado colorido, cartão flutuante centralizado sobre fundo colorido, animação de
> entrada, e qualquer botão de "entrar com Google" ou outra rede — **não existe login
> social neste site**. **Prefira** uma coluna de no máximo 640px começando no primeiro
> terço da tela, rótulo estático acima de cada campo, texto de ajuda abaixo do rótulo,
> campos e botões de 52px de altura, e agrupamento por espaço e borda leve.
>
> Cabeçalho e rodapé são os mesmos da home: cabeçalho com bloco reservado de logo
> (48px, quadrado, retângulo sólido `#8b0000` com o texto LOGO), nome "APPD São José
> dos Campos" e menu com Início, Atendimento, Projetos, Doar, Sobre nós, Contato;
> rodapé em `#14161a` com texto branco, endereço (Rua Acássia Pereira 136, Campos dos
> Alemães, São José dos Campos/SP), telefone (12) 3346-0605, e-mail appdsjc@gmail.com
> e os links Política de Privacidade e Seus direitos.
>
> Conteúdo, nesta ordem:
>
> - **Topo**: `h1` "Criar minha conta" e, logo abaixo, uma linha de expectativa: "São 5
>   campos. A conta serve para acompanhar suas inscrições e ter o seu crachá." Em
>   seguida, em bloco de superfície `#f7f8f9` com borda esquerda, o aviso que evita o
>   engano mais caro da tela: "Criar conta não é pedir atendimento. Para entrar na fila
>   de atendimento, preencha o Cadastro de Atendimento." com link "Ir para o Cadastro
>   de Atendimento". No canto oposto do `h1`, em texto: "Já tem conta? Entrar."
> - **Seção 1 — Quem é você**: Nome completo (texto, obrigatório,
>   `autocomplete="name"`); Data de nascimento (obrigatório, ver o componente abaixo);
>   Telefone (texto com máscara `(00) 00000-0000`, `inputmode="tel"`, obrigatório, com
>   ajuda "Com DDD. Exemplo: (12) 99165-7059.").
> - **Seção 2 — Como você entra**: E-mail (obrigatório, `inputmode="email"`,
>   `autocomplete="email"`, com ajuda "É com ele que você entra no site."); Senha
>   (obrigatório, `autocomplete="new-password"`). **Os requisitos da senha aparecem
>   abaixo do rótulo, antes de digitar**, como lista curta: "Pelo menos 10 caracteres.
>   Pode ser uma frase — é mais fácil de lembrar. Não use a sua data de nascimento."
>   Nenhuma exigência de símbolo ou de letra maiúscula. Dentro da linha do campo, à
>   direita, um botão de 44px "Mostrar senha" com rótulo em texto, `aria-pressed` e
>   troca para "Ocultar senha" quando ativo. **Não peça confirmação de senha**: com o
>   botão de mostrar, repetir a senha só adiciona um campo para errar.
> - **Seção 3 — Foto para o crachá (opcional)**: bloco visualmente mais leve, com o
>   título dizendo "opcional" em palavra, não só em estilo. Área de envio de arquivo
>   com botão "Escolher foto", texto "Aceita foto do celular." e, em destaque, a saída:
>   "Você pode enviar depois, pela sua área. Sem a foto, a conta funciona; só o crachá
>   fica incompleto." Renderize também a variação com foto escolhida, mostrando a
>   miniatura, o nome do arquivo e um botão "Remover foto".
> - **Seção 4 — Privacidade**: caixa de seleção **desmarcada por padrão**, com o texto
>   "Li e aceito a Política de Privacidade." e o link "Ler a Política de Privacidade".
>   Abaixo, uma linha: "Não perguntamos aqui sobre deficiência. Essa informação só é
>   pedida no Cadastro de Atendimento, com autorização específica."
> - **Envio**: botão primário "Criar minha conta" e, ao lado, em texto, "Prefere fazer
>   por telefone? (12) 3346-0605".
>
> **Data de nascimento** — use o componente `componentes/data.html` do design system:
> campo de texto com máscara `00/00/0000`, `inputmode="numeric"`,
> `autocomplete="bday"`, `placeholder="dd/mm/aaaa"` e botão quadrado de 52px ao lado
> com ícone de calendário e `aria-label="Escolher no calendário"`. Digitar é o caminho
> principal; o calendário é atalho, com mês e ano em listas suspensas.
>
> **Máscaras** — obrigatórias e não bloqueantes. A máscara formata enquanto a pessoa
> digita e nunca recusa a tecla em silêncio: colar "12991657059" funciona, colar
> "+55 12 99165-7059" funciona, apagar no meio não embaralha o resto, e telefone fixo
> de 8 dígitos também é aceito. O formato esperado aparece no texto de ajuda, não só no
> `placeholder`.
>
> Campo obrigatório marcado por asterisco **e** pela palavra "obrigatório" no texto de
> ajuda — nunca só pelo asterisco. Rótulo sempre visível acima do campo, em caixa alta
> e baixa; `placeholder` nunca substitui rótulo.
>
> Renderize estas quatro telas:
>
> 1. **Vazio** — o cadastro como a pessoa encontra, com a senha mostrando os requisitos
>    antes de qualquer digitação.
> 2. **Com erro** — resumo no topo com `role="alert"`, focado ao aparecer, dizendo
>    "Faltam 2 campos para criar a conta" e listando links que levam ao campo; os dois
>    campos com borda de 2px `#8b0000`, fundo `#fdf2f2`, ícone e mensagem específica
>    abaixo ("Este e-mail já tem uma conta. Entre ou recupere a sua senha." e "A senha
>    precisa ter pelo menos 10 caracteres."); e **todas as demais respostas
>    preservadas**, visivelmente preenchidas, inclusive a foto já escolhida.
> 3. **Enviando** — botão desabilitado com o rótulo "Criando sua conta…", aviso de que
>    a pessoa não deve fechar a página, e nenhuma animação que gire indefinidamente.
> 4. **Sucesso** — página de confirmação com o número de registro em destaque, no
>    formato `APPD-2026-00042`, a linha "Este número é seu e não muda. Anote ou tire uma
>    foto desta tela.", o que a conta permite fazer agora, e dois caminhos: "Ir para a
>    minha área" (primário) e "Fazer meu Cadastro de Atendimento" (contornado). **Não
>    prometa e-mail de confirmação nesta tela** — o envio de e-mail ainda não está
>    resolvido; marque o trecho como `[A CONFIRMAR]` em nota lateral fora do layout.
>
> Acessibilidade como requisito de layout: um `h1`; hierarquia de headings sem pular
> nível; foco visível de 3px `#0f4c93` com 2px de folga; ordem de foco igual à ordem
> visual; alvos de 44px; mensagem de erro ligada ao campo por `aria-describedby`;
> resumo de erros com `role="alert"`; nada sinalizado só por cor; nada abaixo de 15px;
> nenhum par de campos lado a lado no mobile.

---

## Aceite visual

- [ ] A tela diz, antes do primeiro campo, que criar conta **não** é pedir atendimento.
- [ ] Os requisitos da senha aparecem antes de digitar, não como erro depois.
- [ ] O botão "Mostrar senha" tem rótulo em texto, 44px e `aria-pressed`.
- [ ] Não existe campo de confirmar senha nem botão de login social.
- [ ] A foto é claramente opcional e a tela diz como enviar depois.
- [ ] Nenhum campo pergunta sobre deficiência.
- [ ] A caixa da Política de Privacidade vem desmarcada.
- [ ] No estado de erro, todas as outras respostas continuam preenchidas.
- [ ] O erro diz como corrigir, com exemplo — não "campo inválido".
- [ ] A tela de sucesso mostra `APPD-2026-00042` em destaque e não promete e-mail.
- [ ] Corpo de texto em 17px ou mais; em 360px nada estoura e nada fica lado a lado.

## Se sair errado

- **Veio com "entrar com Google"**: reprovação dura. Peça "remova qualquer login
  social; a única forma de entrar é e-mail e senha".
- **Apareceu confirmar senha**: peça "um campo de senha só, com botão de mostrar
  senha".
- **A foto virou obrigatória ou virou o centro da tela**: peça "a foto é um bloco
  opcional depois dos campos de conta, com a saída de enviar depois em destaque".
- **Os requisitos da senha viraram mensagem de erro**: peça "requisitos visíveis abaixo
  do rótulo desde o estado vazio".
- **Virou cartão flutuante no meio de um fundo colorido**: peça "coluna única de 640px
  alinhada ao topo, fundo branco, cabeçalho e rodapé do site presentes".
- **O erro apagou as respostas**: reprovação dura. Peça a renderização de novo,
  explicitando "no estado de erro, todos os campos válidos permanecem preenchidos".
