# Prompt — Central de Doações (`/doar`)

É a tela que traz dinheiro, e a única do lote em que um erro de conteúdo custa dinheiro do
doador: **a chave PIX da APPD não existe publicada em lugar nenhum** (pendência P0-2). Uma chave
inventada manda a doação para a conta de outra pessoa. A tela é desenhada com o espaço do PIX
reservado e marcado.

## A espinha

**Decisão que a tela ajuda a tomar, e em quanto tempo:** em menos de um minuto, a pessoa decide
se esta associação merece o dinheiro dela — e descobre qual é o jeito de doar que **existe
hoje**.

**O que o olho vê primeiro, segundo, terceiro:**

1. Quem recebe: nome, CNPJ, endereço, desde 2006 — dado verificável, não adjetivo.
2. As formas de doar, lado a lado: itens (funciona hoje) e PIX (espaço reservado).
3. "Recebeu uma ligação da APPD?" — a conferência que protege o doador.

**O erro central do site atual, que esta tela corrige:** hoje a doação é um boleto escaneado de
2016 e um texto descrevendo telemarketing. Não há PIX, não há prestação de contas, e não há
como o doador conferir se a ligação que recebeu é da APPD. Quem não consegue verificar, não
deposita.

**A inversão de prioridade desta tela:** enquanto a chave PIX não for confirmada, a ação
preenchida é **combinar a retirada da doação em espécie** — a única que funciona hoje. Quando a
chave chegar, o PIX assume o lugar da ação primária e a doação de itens vira secundária. Os dois
estados são desenhados agora, para que a troca depois seja de conteúdo, não de layout.

**O que não entra, por decisão:** o boleto de 2016 (imagem escaneada, ilegível para leitor de
tela, dez anos de idade, validade desconhecida); seletor de valor e checkout (não existe
gateway); meta de campanha; e qualquer foto de pessoa assistida.

**Estados:** PIX pendente de confirmação; PIX preenchido, com chave, QR Code e botão copiar;
chave copiada; 360px.

---

## O prompt

> Página de doação de um site institucional responsivo (desktop 1280px, mobile 360px) da APPD
> São José dos Campos, associação sem fins lucrativos de pessoas com deficiência, fundada em 2006.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta, amarelo
> `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo `#6f7782`, link e foco
> em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson Hyperlegible com corpo de 17px e título
> de página em 56px, raio de 10px em bloco e campo, elevação discreta, espaçamento generoso
> com base 8.
> Quem lê é um doador adulto da cidade — pessoa física, ex-doador de boleto ou empresa local —
> que chegou por busca ou indicação e está decidindo se confia. O que convence esse público é
> **transparência verificável**: CNPJ, endereço, destino do dinheiro e documento. A estética é
> de prestação de contas bem diagramada, sóbria e contemporânea: contraste alto, blocos com
> borda leve e canto suave, números e documentos em destaque tipográfico, muito espaço em
> branco. **Evite** apelo emocional: foto de pessoa com deficiência em situação de fragilidade,
> foto de banco de imagem com gente sorrindo, contador animado de vidas atendidas, barra de
> meta de campanha, selo pulsante, degradê, vidro fosco, sombra pesada, ícone ilustrado
> colorido e faixa gigante antes do conteúdo. **Prefira** prova fria: dado conferível, rótulo
> honesto e ação clara.
>
> Conteúdo, nesta ordem:
>
> 1. **Trilha de navegação**: Início › Doar.
> 2. **`h1`** "Central de Doações" e, em 19px: "A APPD mantém seus atendimentos com doação.
>    Todos os recursos vêm de colaboradores."
> 3. **Bloco de identificação**, com fundo `#f7f8f9`, borda `#e2e5e9` e raio de 10px, em duas
>    ou três colunas no desktop e empilhado no mobile: nome completo "Associação das Pessoas
>    com Deficiência de São José dos Campos"; CNPJ 08.074.883/0001-96; Inscrição Municipal
>    154.420; Utilidade Pública nº 7.477/08; endereço Rua Acássia Pereira 136, Campos dos
>    Alemães, São José dos Campos/SP, CEP 12239-530; "Fundada em 2006". Este bloco fica
>    **acima** das formas de doar — quem recebe vem antes de como doar.
> 4. **Duas formas de doar**, em dois blocos irmãos lado a lado no desktop e empilhados no
>    mobile, com a mesma largura e alturas independentes:
>
>    **a) Doar itens** — é a forma que funciona hoje, e por isso leva a **única ação
>    preenchida** da tela. Título "Doar itens"; a frase "Entre em contato e a APPD retira a
>    doação."; a lista do que é mais necessário agora, em itens: fraldas descartáveis
>    geriátricas; cadeiras de rodas ou de banho; alimentos não perecíveis. Abaixo, em texto
>    menor: "Outros itens também são bem-vindos — a associação confere antes se atendem os
>    assistidos." Botão primário preenchido "Combinar a retirada" e, ao lado, em texto,
>    "(12) 3346-0605" e "WhatsApp (12) 99165-7059" como links.
>
>    **b) Doar por PIX** — bloco do mesmo tamanho, com o espaço da chave **reservado**.
>    Desenhe a estrutura final: rótulo "Chave PIX", uma caixa larga de chave com borda
>    `#6f7782` e raio de 10px, um botão "Copiar chave" de 44px de altura ao lado, um QR Code
>    quadrado de 180px abaixo, e a linha "A chave está em nome da APPD — confira o CNPJ
>    08.074.883/0001-96 antes de confirmar." No estado padrão desta renderização, a caixa da
>    chave está **vazia**, com fundo `#fdf3e3`, borda esquerda de 4px em `#7a4a10`, ícone
>    textual e o texto "Chave PIX ainda não publicada. `[A CONFIRMAR]` — a associação precisa
>    informar a chave oficial." O botão "Copiar chave" fica desabilitado, mantendo 3:1 de
>    contraste, com a explicação do porquê ao lado. **Regra dura: não escreva nenhuma sequência
>    de caracteres que pareça uma chave PIX** — nem como exemplo, nem em cinza claro, nem
>    borrada. E desenhe o QR Code como um quadrado neutro com moldura e o rótulo "QR Code do
>    PIX", **sem padrão de módulos**: um QR falso pode ser lido por um celular de verdade.
>
> 5. **"Recebeu uma ligação da APPD?"** — bloco de largura inteira, fundo `#fdf3e3`, borda
>    esquerda de 4px em `#7a4a10`, ícone textual e texto escuro; nunca preenchido em vermelho,
>    para não se confundir com mensagem de erro. Conteúdo: a associação faz captação por
>    telefone e um agente pode ir até você recolher a contribuição; antes de entregar qualquer
>    valor, confira o crachá do agente na página de verificação, exija o recibo impresso pela
>    APPD e confirme a visita pelo telefone da sede (12) 3346-0605. Uma linha em destaque: "A
>    APPD não pede senha, não pede cartão e não pede transferência para conta de pessoa
>    física." Botão secundário contornado "Conferir um crachá". Abaixo, em texto menor,
>    "`[A CONFIRMAR]` — a associação confirma se a captação por telefone continua ativa e se os
>    agentes terão crachá verificável."
> 6. **Transparência** — lista de quatro linhas, cada uma com o nome do documento à esquerda e
>    o status à direita, com rótulo textual além da cor: "Prestação de contas —
>    `[A CONFIRMAR]`"; "Estatuto — `[A CONFIRMAR]`"; "Diretoria — `[A CONFIRMAR]`"; "Número de
>    pessoas atendidas — `[A CONFIRMAR]`". Acima da lista, a frase honesta: "Estes documentos
>    ainda não estão publicados. Assim que a associação enviar, eles aparecem aqui." Desenhe
>    também como cada linha fica quando o documento existir: link "Abrir (PDF)" com o tamanho
>    do arquivo ao lado. Não use ícone de alerta vermelho nesta lista — é pendência, não erro.
> 7. **Outras formas de ajudar** — duas linhas curtas: ser voluntário, com link para o contato
>    com o assunto "Quero ser voluntário"; e divulgar a associação, com os links das redes.
> 8. **Rodapé** em `#14161a` com texto branco, igual ao da home: endereço, CNPJ, telefone
>    (12) 3346-0605, e-mail appdsjc@gmail.com, redes, Política de Privacidade, Seus direitos e
>    "Recebeu uma ligação da APPD?".
>
> Não desenhe, em hipótese nenhuma: boleto, código de barras, botão "imprimir boleto", seletor
> de valor sugerido, campo de valor, checkout, logotipo de bandeira de cartão ou de banco.
>
> Acessibilidade como requisito de layout: um único `h1`; hierarquia de headings sem pular
> nível; foco visível com anel de 3px `#0f4c93` e 2px de folga; alvos de no mínimo 44px com 8px
> de folga; nada sinalizado apenas por cor; texto não justificado; largura de linha entre 60 e
> 75 caracteres; nada abaixo de 15px; a chave PIX quebrando em duas linhas sem estourar a
> largura no mobile.
>
> Renderize estas três telas:
>
> 1. **PIX pendente** — o estado descrito acima, que é o que vai ao ar hoje.
> 2. **PIX preenchido** — o mesmo layout com a chave presente (use o texto literal
>    `CHAVE-PIX-AQUI` como marcador de posição, nunca uma chave plausível), botão "Copiar
>    chave" ativo, QR Code no lugar, e o bloco de PIX assumindo a **ação primária preenchida**
>    enquanto o bloco de itens passa a botão contornado. Mostre ao lado o retorno depois do
>    clique: "Chave copiada" com ícone e texto, anunciado por região viva, não só uma troca de
>    cor.
> 3. **Mobile em 360px** do estado pendente, com os dois blocos empilhados e a ordem de leitura
>    preservada.

---

## Aceite visual

- [ ] No estado pendente **não existe nenhuma sequência que pareça uma chave PIX** — nem de
      exemplo, nem apagada, nem borrada.
- [ ] O QR Code é um quadrado neutro rotulado, sem padrão escaneável.
- [ ] Nenhum boleto, código de barras, seletor de valor ou checkout na tela.
- [ ] CNPJ, endereço e ano de fundação aparecem **antes** das formas de doar.
- [ ] A lista de itens (fraldas geriátricas, cadeiras de rodas ou de banho, alimentos não
      perecíveis) está completa e legível.
- [ ] Só existe **uma** ação preenchida por estado: itens no estado pendente, PIX no preenchido.
- [ ] O bloco "Recebeu uma ligação da APPD?" existe e não usa vermelho preenchido.
- [ ] As quatro linhas de transparência aparecem marcadas `[A CONFIRMAR]`, com rótulo textual.
- [ ] "Chave copiada" aparece como texto e ícone, não só como mudança de cor.
- [ ] Nenhuma foto de pessoa assistida, nenhum contador animado, nenhuma meta de campanha.
- [ ] Em 360px a chave quebra sem rolagem horizontal e os alvos continuam com 44px.

## Se sair errado

- **Apareceu uma chave PIX inventada** (CPF, CNPJ formatado, e-mail, telefone ou chave
  aleatória): reprovação dura, não conserte por Tweaks. Gere de novo com "a caixa da chave PIX
  fica vazia; não escreva nenhuma sequência que se pareça com uma chave".
- **O QR Code veio com padrão de verdade**: peça "substitua o QR por um quadrado cinza com
  moldura e o rótulo 'QR Code do PIX', sem módulos".
- **Virou landing de campanha** (meta, contador, depoimento, foto de pessoa): peça "remova
  imagem de pessoa, número animado e barra de meta; a prova desta página são CNPJ, endereço e
  documentos".
- **A doação de itens ficou abaixo do PIX pendente**: peça "no estado pendente, o bloco de itens
  vem primeiro e é o único com botão preenchido".
- **A transparência virou uma lista de alertas vermelhos**: peça "pendência não é erro; use o
  bloco neutro com rótulo textual `[A CONFIRMAR]`".
