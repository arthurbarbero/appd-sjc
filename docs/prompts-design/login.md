# Prompt — Entrar

Rota `/entrar`. A tela mais curta do site e uma das que mais reprova: quem não
consegue entrar não reclama, some. Inclui a recuperação de senha como estado.

## A espinha

**Decisão que a tela ajuda a tomar:** nenhuma — a pessoa já decidiu entrar. O trabalho
da tela é não atrapalhar e, quando falhar, **entregar o próximo passo em vez de um
beco**. Sucesso é entrar de primeira; sucesso aceitável é sair daqui sabendo o que
fazer.

**Quem entra:** associado com baixa familiaridade digital, muitas vezes meses depois de
ter criado a conta, no celular, com a senha esquecida. O caminho humano — ligar para a
secretaria — não é vergonha, é acessibilidade: fica visível na própria tela, não
escondido no rodapé.

**O que o olho vê primeiro, segundo, terceiro:**

1. Que esta é a entrada de quem já é associado, e que existe outro caminho para quem
   não tem conta.
2. Os dois campos.
3. "Esqueci minha senha" — grande o bastante para ser achado por quem precisa dele.

**Duas decisões que a tela precisa respeitar:**

- **Não existe login social.** Decisão consciente: o público-alvo tem baixa afinidade
  digital e nem todo mundo tem conta Google. Nenhum botão de rede social entra aqui.
- **A mensagem de erro não revela se o e-mail existe.** "E-mail ou senha não confere" é
  a mesma frase nos dois casos. Dizer "este e-mail não está cadastrado" entrega a
  terceiros quem é associado da APPD — e associação de pessoas com deficiência é
  exatamente o lugar onde isso não pode vazar.

**Estados obrigatórios:** vazio; senha errada; conta bloqueada por tentativas; "esqueci
minha senha"; confirmação de envio da recuperação.

**Pendência assumida:** a recuperação depende de envio de e-mail e **ainda não há
solução de custo zero definida**. O fluxo é desenhado, marcado `[A CONFIRMAR]`, e
sempre acompanhado da alternativa humana: (12) 3346-0605.

---

## O prompt

> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
>
> Tela de entrada na conta, rota `/entrar`, responsiva (desktop 1280px, mobile 360px),
> do site da APPD São José dos Campos, associação de pessoas com deficiência. Quem
> entra é um associado com baixa familiaridade digital, no celular, muitas vezes meses
> depois de ter criado a conta e com a senha esquecida.
>
> A estética é de **porta de serviço, não de vitrine**: a tela inteira é uma coluna
> única estreita, alinhada ao topo, com o site em volta — cabeçalho e rodapé presentes,
> como em qualquer outra página. **Evite** metade da tela ocupada por imagem ou
> ilustração, cartão flutuante centralizado sobre fundo colorido ou fotografia, fundo
> creme, serifa decorativa, degradê, vidro fosco, sombra pesada, ícone ilustrado
> colorido, animação de entrada, e qualquer botão de "entrar com Google", Facebook ou
> Apple — **não existe login social neste site**. **Prefira** uma coluna de no máximo
> 440px começando no primeiro terço da tela, dois campos largos de 52px de altura,
> rótulo estático acima do campo e nada mais competindo por atenção.
>
> Cabeçalho e rodapé são os mesmos da home: cabeçalho com bloco reservado de logo
> (48px, quadrado, retângulo sólido `#8b0000` com o texto LOGO), nome "APPD São José
> dos Campos" e menu com Início, Atendimento, Projetos, Doar, Sobre nós, Contato;
> rodapé em `#14161a` com texto branco, endereço (Rua Acássia Pereira 136, Campos dos
> Alemães, São José dos Campos/SP), telefone (12) 3346-0605, e-mail appdsjc@gmail.com
> e os links Política de Privacidade e Seus direitos.
>
> Conteúdo da coluna, nesta ordem:
>
> - `h1` "Entrar na minha conta" e a linha "Esta é a entrada de quem já é associado."
> - E-mail (obrigatório, `inputmode="email"`, `autocomplete="email"`).
> - Senha (obrigatório, `autocomplete="current-password"`), com botão de 44px dentro da
>   linha do campo, à direita, rótulo em texto "Mostrar senha", `aria-pressed`, virando
>   "Ocultar senha" quando ativo.
> - Botão primário "Entrar", de largura total.
> - Link "Esqueci minha senha", em corpo de 17px, com alvo de 44px — não em letra miúda
>   e não escondido acima do botão.
> - Bloco de superfície `#f7f8f9` com borda esquerda: "Ainda não tem conta?" e o link
>   "Criar minha conta".
> - Bloco de saída humana, sempre visível: "Não está conseguindo entrar? Ligue para a
>   secretaria: (12) 3346-0605."
>
> Renderize estas cinco telas:
>
> 1. **Vazio** — a tela como a pessoa encontra.
> 2. **Senha errada** — bloco de erro acima dos campos, com `role="alert"`, ícone,
>    borda esquerda de 4px `#8b0000` sobre `#fdf2f2`, com o texto "E-mail ou senha não
>    confere. Confira e tente de novo." **A mensagem é a mesma quando o e-mail não
>    existe**: a tela nunca diz se aquele e-mail tem conta. O e-mail digitado permanece
>    preenchido; a senha é limpa. Abaixo do erro, o link "Esqueci minha senha" ganha
>    destaque de bloco.
> 3. **Conta bloqueada por tentativas** — mesmo bloco de erro, texto "Bloqueamos a
>    entrada por 15 minutos, por segurança. Tente de novo às 14h32, use "Esqueci minha
>    senha" ou ligue para (12) 3346-0605."; campos e botão desabilitados, com o motivo
>    dito em texto ao lado do botão, nunca só por opacidade.
> 4. **Esqueci minha senha** — mesma coluna, `h1` "Recuperar minha senha", um campo só
>    (E-mail), botão primário "Enviar o link de recuperação", link "Voltar para
>    entrar", e o bloco humano em destaque: "Sem e-mail à mão? A secretaria refaz a sua
>    senha por telefone: (12) 3346-0605." Marque no canto, como nota fora do layout,
>    `[A CONFIRMAR] envio de e-mail ainda não definido`.
> 5. **Confirmação de envio** — página de confirmação com o texto "Se existir uma conta
>    com esse e-mail, enviamos o link de recuperação." — redação obrigatória, porque
>    ela também não revela se o e-mail existe. Abaixo: "O link vale por 1 hora.",
>    "Confira a caixa de spam." e, de novo, o telefone da secretaria. Botão contornado
>    "Voltar para entrar".
>
> Acessibilidade como requisito de layout: um `h1` por tela; foco visível de 3px
> `#0f4c93` com 2px de folga; ordem de foco igual à ordem visual; alvos de 44px;
> mensagem de erro ligada ao campo por `aria-describedby`; bloco de erro com
> `role="alert"` e focado ao aparecer; nada sinalizado só por cor; nada abaixo de 15px;
> nenhum campo lado a lado no mobile.

---

## Aceite visual

- [ ] Nenhum botão de login social em nenhum dos cinco estados.
- [ ] Nenhuma metade de tela ocupada por imagem; o formulário começa no primeiro terço.
- [ ] A mensagem de senha errada é idêntica à de e-mail inexistente.
- [ ] A confirmação de recuperação usa "Se existir uma conta com esse e-mail…".
- [ ] "Esqueci minha senha" está em 17px, com alvo de 44px, e é fácil de achar.
- [ ] O telefone (12) 3346-0605 aparece nos estados de falha, não só no rodapé.
- [ ] O bloqueio diz por quanto tempo e o que fazer, e o desabilitado tem motivo em
      texto.
- [ ] O e-mail digitado sobrevive ao erro; a senha é limpa.
- [ ] O botão "Mostrar senha" tem rótulo textual e `aria-pressed`.
- [ ] O fluxo de recuperação está marcado `[A CONFIRMAR]` fora do layout.

## Se sair errado

- **Veio com botão do Google ou de rede social**: reprovação dura. Peça "remova todo
  login social; a única forma de entrar é e-mail e senha".
- **Metade da tela virou imagem ou ilustração**: peça "coluna única de 440px alinhada
  ao topo, sem painel lateral, sem imagem, com cabeçalho e rodapé do site".
- **A mensagem virou "e-mail não cadastrado"**: reprovação dura. Peça "a mesma frase
  para senha errada e e-mail inexistente: 'E-mail ou senha não confere.'".
- **"Esqueci minha senha" virou letra miúda cinza**: peça "link em 17px, cor `#0f4c93`,
  alvo de 44px, abaixo do botão Entrar".
- **O bloqueio ficou só com botão apagado**: peça "diga por quanto tempo, diga o que
  fazer e mostre o telefone; desabilitado não é só opacidade".
- **Sumiu o caminho humano**: peça o bloco fixo com o telefone da secretaria em todos
  os estados de falha.
