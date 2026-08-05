# Prompt — Contato (`/contato`)

A tela mais simples do lote, com duas armadilhas: hoje ninguém sabe **para quem** vai a mensagem
(o formulário atual é nativo do Wix, pendência P0-4) e **em quanto tempo** ela é respondida. As
duas viram marcação visível na tela, não silêncio.

## A espinha

**Decisão que a tela ajuda a tomar, e em quanto tempo:** em 15 segundos, a pessoa escolhe por
qual canal falar — e escolhe certo. Quem tem pressa liga; quem não quer ligar escreve e sabe
quanto vai esperar.

**O que o olho vê primeiro, segundo, terceiro:**

1. Os canais humanos: telefone, WhatsApp, e-mail.
2. Onde fica a sede.
3. O formulário, para quem prefere escrever.

**A decisão de ordem:** os canais diretos vêm **antes** do formulário. O público da associação
resolve por telefone, e um formulário no topo empurra para o canal mais lento e menos confiável
justamente quem tem urgência. O formulário existe para quem não quer ligar — não é o caminho
principal.

**O erro central do site atual, que esta tela corrige:** o formulário atual não diz para onde a
mensagem vai, não promete prazo, não tem aviso de privacidade e deixa a mensagem como campo
opcional. Pior: o link de WhatsApp da versão mobile tem caracteres invisíveis na URL e um número
que não bate com nenhum telefone publicado — na prática, quem acessa pelo celular não consegue
falar com a associação.

**Voluntário entra por aqui.** Na V1 não há cadastro de voluntário (decisão registrada na
arquitetura de informação): a porta é uma opção de assunto neste formulário.

**Estados:** vazio; erro por campo com resumo no topo e respostas preservadas; sucesso; 360px.

---

## O prompt

> Página de contato de um site institucional responsivo (desktop 1280px, mobile 360px) da APPD
> São José dos Campos, associação sem fins lucrativos de pessoas com deficiência.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta, amarelo
> `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo `#6f7782`, link e foco
> em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson Hyperlegible com corpo de 17px e título
> de página em 56px, raio de 10px em bloco e campo, elevação discreta, espaçamento generoso
> com base 8.
> Quem chega aqui pode ser a pessoa com deficiência, um familiar cuidador com pressa, um doador
> ou alguém oferecendo trabalho voluntário. Muitos usam celular com conexão ruim, leitor de tela
> ou só o teclado. A estética é de serviço público bem-feito: contraste alto, dois blocos
> claramente separados, campos largos com rótulo estático acima, ícone monocromático quando
> houver. **Evite** mapa embutido em iframe, placeholder no lugar de rótulo, rótulo flutuante
> que sobe ao focar, ícone dentro do campo, campos lado a lado no mobile, ícone ilustrado
> colorido, degradê, vidro fosco, sombra pesada e faixa gigante antes do conteúdo.
> **Prefira** os canais humanos em texto grande e clicável, e um formulário curto que caiba em
> uma tela de celular.
>
> Conteúdo, nesta ordem:
>
> 1. **Trilha de navegação**: Início › Contato.
> 2. **`h1`** "Contato" e, em 19px: "Fale com a APPD por telefone, WhatsApp, e-mail ou por esta
>    página."
> 3. **Canais diretos**, em três blocos irmãos com borda `#e2e5e9`, raio de 10px e sombra
>    discreta; cada bloco tem o papel do canal como rótulo, o valor em 19px e é clicável
>    inteiro, com no mínimo 44px de altura:
>    - "Telefone da sede — (12) 3346-0605" com link `tel:`;
>    - "WhatsApp da Secretaria — (12) 99165-7059" com link para o WhatsApp;
>    - "E-mail — appdsjc@gmail.com" com link `mailto:`.
>      Abaixo, em uma linha de texto: "Serviço Social — (12) 99124-7257". Não invente nenhum
>      outro número, e-mail ou canal.
> 4. **Onde fica a sede** — bloco com fundo `#f7f8f9`, borda `#e2e5e9` e raio de 10px: Rua
>    Acássia Pereira, 136 — Campos dos Alemães, São José dos Campos/SP, CEP 12239-530; e o link
>    de texto "Abrir no Google Maps". **Sem mapa embutido**: nada de iframe de terceiro. Dentro
>    do mesmo bloco, a linha "Horário de atendimento: `[A CONFIRMAR]`", visível como qualquer
>    outra informação — a associação ainda não publicou o horário e a tela não inventa um.
> 5. **Formulário "Enviar uma mensagem"**, em coluna única, com rótulo estático acima de cada
>    campo, texto de ajuda abaixo do rótulo e campos de 52px de altura:
>    - **Nome** (texto, obrigatório).
>    - **E-mail** (texto, obrigatório, ajuda "É por ele que a resposta chega.").
>    - **Telefone** (opcional, máscara `(00) 00000-0000`, `inputmode="tel"`, ajuda "Com DDD.
>      Exemplo: (12) 99165-7059."). A máscara formata enquanto a pessoa digita, aceita colar e
>      apagar sem embaralhar, e nunca recusa a tecla em silêncio.
>    - **Assunto** (obrigatório), como grupo de rádio dentro de um `fieldset` com `legend`, cada
>      opção sendo um bloco clicável inteiro de 44px com raio de 6px e 8px de folga: "Quero
>      atendimento", "Quero doar", "Quero ser voluntário", "Outro assunto".
>    - **Mensagem** (área de texto, obrigatória, quatro linhas de altura). Ela é obrigatória de
>      propósito: mensagem vazia gasta o tempo de quem responde e o de quem escreveu.
>    - Abaixo dos campos, o aviso de privacidade **em texto corrido, sem caixa de seleção**:
>      diz que nome, e-mail e telefone são usados apenas para responder esta mensagem, com os
>      links "Política de Privacidade" e "Seus direitos". Uma linha em texto menor: "Não escreva
>      aqui informação de saúde — para pedir atendimento, use o cadastro."
>    - **Envio**: botão primário preenchido "Enviar mensagem"; ao lado, em texto, "Prefere falar
>      agora? (12) 3346-0605"; e, logo abaixo do botão, "Respondemos em até `[A CONFIRMAR]` dias
>      úteis." — a marcação fica visível na tela, não em nota de rodapé.
> 6. **Comportamento do campo Assunto**, que precisa aparecer desenhado: ao marcar "Quero
>    atendimento", surge abaixo do grupo um bloco de apoio com fundo `#f7f8f9`, borda `#e2e5e9` e
>    raio de 10px, com o texto "O pedido de atendimento é feito pelo cadastro. É gratuito e leva
>    poucos minutos." e o link "Fazer meu cadastro" — sem tirar a opção de escrever mesmo assim.
>    Ao marcar "Quero ser voluntário", surge no mesmo lugar a linha "Conte qual é a sua área e
>    quantas horas você tem por semana. Áreas aceitas: `[A CONFIRMAR]`."
> 7. **Rodapé** em `#14161a` com texto branco, igual ao da home.
>
> Acessibilidade como requisito de layout: um único `h1`; hierarquia de headings sem pular
> nível; foco visível com anel de 3px `#0f4c93` e 2px de folga; ordem de foco igual à ordem
> visual; alvos de no mínimo 44px com 8px de folga; campo obrigatório marcado por asterisco
> **e** pela palavra "obrigatório" no texto de ajuda; mensagem de erro ligada ao campo por
> `aria-describedby`; nada sinalizado apenas por cor; texto não justificado; nada abaixo de
> 15px; nenhum par de campos lado a lado no mobile.
>
> Renderize estas quatro telas:
>
> 1. **Vazio** — a página como a pessoa encontra, com o grupo de assunto sem opção marcada.
> 2. **Com erro** — resumo no topo em região de alerta dizendo "Faltam 2 campos para enviar",
>    listando links que levam a cada campo; os campos com erro em borda de 2px `#8b0000`, fundo
>    `#fdf2f2`, ícone e mensagem que ensina a corrigir ("O e-mail precisa ter @ e o domínio.
>    Exemplo: nome@provedor.com" e "Escreva sua mensagem — sem ela a associação não sabe como
>    ajudar."); e **todas as demais respostas preservadas**, visivelmente preenchidas, incluindo
>    o assunto já marcado.
> 3. **Sucesso** — a página substituída por uma confirmação com `h1` "Mensagem enviada", o que
>    acontece agora, o prazo como "Respondemos em até `[A CONFIRMAR]` dias úteis", a alternativa
>    "Se for urgente, ligue para (12) 3346-0605" e um link para voltar ao início. **Não invente
>    número de protocolo** nem prometa quem vai responder — o destinatário ainda não está
>    definido.
> 4. **Mobile em 360px** do estado vazio, com os canais diretos empilhados acima do formulário.

---

## Aceite visual

- [ ] Telefone, WhatsApp e e-mail aparecem **antes** do formulário, clicáveis e com 44px.
- [ ] Nenhum canal inventado: só (12) 3346-0605, (12) 99165-7059, (12) 99124-7257 e
      appdsjc@gmail.com.
- [ ] O horário aparece como "Horário de atendimento: `[A CONFIRMAR]`", nem inventado nem
      omitido.
- [ ] Não há mapa embutido — só o endereço em texto e um link.
- [ ] As quatro opções de assunto existem, em `fieldset` com `legend`, cada uma com bloco
      clicável.
- [ ] Marcar "Quero atendimento" mostra o desvio para o cadastro sem impedir o envio.
- [ ] O prazo de resposta aparece junto do botão, marcado `[A CONFIRMAR]`.
- [ ] O telefone tem máscara `(00) 00000-0000` e aceita colar e apagar.
- [ ] No estado de erro, **todas as outras respostas continuam preenchidas**.
- [ ] O erro diz como corrigir, com exemplo — não "campo inválido".
- [ ] A tela de sucesso não promete protocolo nem pessoa responsável.
- [ ] Em 360px nenhum par de campos lado a lado e nada estoura horizontalmente.

## Se sair errado

- **O formulário foi para o topo e os telefones sumiram para o rodapé**: peça "os três canais
  diretos ficam imediatamente abaixo do subtítulo, antes do formulário".
- **Veio um mapa embutido**: peça "remova o iframe de mapa; só endereço em texto e um link" — é
  rastreador de terceiro e barreira de teclado.
- **O prazo virou promessa inventada** ("respondemos em 24h"): peça o texto literal
  "Respondemos em até `[A CONFIRMAR]` dias úteis".
- **O erro apagou as respostas**: reprovação dura. Gere de novo explicitando "no estado de erro,
  todos os campos válidos permanecem preenchidos, inclusive o assunto marcado".
- **Rótulo flutuante ou placeholder no lugar de rótulo**: peça "rótulo estático acima do campo,
  sempre visível".
- **As opções de assunto ficaram apertadas**: use Tweaks para levar cada opção a 44px de altura
  com 8px de folga — não gasta token.
