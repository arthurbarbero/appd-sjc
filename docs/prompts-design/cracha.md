# Prompt — Crachá do associado

Rota `/area/cracha`, dentro da área autenticada. É a única tela do site que pode fugir
um pouco da estética das demais: **é um documento, não uma página**. Continua usando os
mesmos tokens e continua tendo que ser legível de longe.

## A espinha

**Decisão que a tela ajuda a tomar:** duas, e elas são de naturezas diferentes. A
primeira é operacional — "como eu tenho em mãos, hoje, um documento que prova que sou
associado?". A segunda é pessoal e a tela **não pode tomar pela pessoa**: "eu quero que
o meu tipo de deficiência apareça nesse documento?".

**O que o olho vê primeiro, segundo, terceiro:**

1. O crachá — ou, quando ainda não há foto, o lugar dele e o caminho para preenchê-lo.
2. Baixar e imprimir.
3. O que sai impresso no crachá: o controle de escolha do tipo de deficiência.

**Liberação imediata, sem aprovação prévia.** Decisão consciente do dono: nesta versão
o crachá fica pronto assim que a foto entra. A tela não exibe "em análise", não promete
revisão da associação e não inventa um selo de autenticidade que ninguém emitiu. Quem
precisa conferir usa a página pública de verificação — é ela que dá peso ao documento,
não um enfeite impresso.

**Custo zero é requisito de desenho, não detalhe técnico.** Recorte, compressão e
exportação acontecem no navegador da própria pessoa. Nenhum serviço externo, nenhuma
fila de processamento no servidor, nenhuma espera de e-mail. Isso muda o desenho: o
resultado aparece na hora, na mesma tela, sem página de "aguarde".

**O número é o eixo.** `APPD-2026-00042`: único, imutável, gerado ao concluir o
cadastro. Ele é o que a pessoa dita no telefone e o que alguém digita para conferir —
então precisa ser lido sem erro por quem tem baixa visão, em fonte tabular, com dígito
que não se confunde com letra.

**Estados:** sem foto ainda; recorte da foto; foto sendo processada; erro de foto grande
demais; crachá pronto, frente e verso; pré-visualização de impressão.

---

## O prompt

> Tela "Meu crachá" da área autenticada de um site institucional responsivo (desktop
> 1280px, mobile 360px) da APPD São José dos Campos, associação de pessoas com
> deficiência. É a tela que gera a credencial do associado.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
> O crachá em si é um **documento impresso**, e por isso pode ter densidade e formato
> próprios dentro desses mesmos tokens: pense em carteirinha de identificação de
> instituição séria, do tipo que um porteiro confere em três segundos — nome grande,
> número em fonte tabular, contraste alto, campos rotulados. **Evite** no crachá fundo
> texturizado ou marca d'água atrás de texto, degradê metálico, holograma falso, selo
> brilhante, faixa diagonal, foto recortada em círculo cortando o queixo, ícone
> ilustrado colorido e sombra pesada. **Prefira** uma faixa sólida `#8b0000` no topo com
> o nome da associação, foto retangular inteira, blocos de dado com rótulo pequeno em
> caixa alta e baixa acima do valor, e o QR Code com margem branca de silêncio em volta.
> A página **em volta** do crachá segue a estética do resto do site: institucional
> direta, muito espaço em branco, hierarquia por tamanho de texto.
>
> Conteúdo da página, nesta ordem:
>
> 1. **Trilha e `h1`**: Área do associado › Meu crachá. `h1` "Meu crachá".
> 2. **Linha de apoio**: "Seu crachá fica pronto assim que você envia a foto. Você mesmo
>    baixa e imprime." Sem promessa de aprovação, sem prazo, sem selo de validação.
> 3. **O crachá**, em formato vertical de credencial (proporção de cartão em pé,
>    54 × 85,6 mm), mostrado em tamanho confortável no desktop e ocupando a largura no
>    mobile. **Frente**: faixa `#8b0000` no topo com o nome "APPD São José dos Campos";
>    foto da pessoa em 400 × 500 (proporção 4:5), retangular, sem corte circular; nome
>    completo em corpo grande e peso 700, com quebra em duas linhas quando for longo;
>    o rótulo "Registro" e o número `APPD-2026-00042` em fonte tabular, grande, com
>    espaçamento entre grupos; e a situação "Associado ativo" como selo com ícone e
>    texto, nunca só cor. **Verso**: QR Code apontando para
>    `/verificar/APPD-2026-00042` no domínio do site, com o endereço escrito por extenso
>    logo abaixo em texto legível — quem não consegue usar câmera precisa poder digitar; a
>    frase "Confira este crachá no site da associação"; endereço da sede (Rua Acássia
>    Pereira 136, Campos dos Alemães, São José dos Campos/SP), CNPJ 08.074.883/0001-96 e
>    telefone (12) 3346-0605; e a linha "Este crachá identifica a pessoa associada e não
>    substitui documento oficial com foto."
> 4. **Ações**, logo abaixo do crachá: botão primário "Baixar em PNG"; botão contornado
>    "Baixar em PDF"; e link "Ver como fica impresso". Ao lado, em texto pequeno mas
>    nunca abaixo de 15px: "O arquivo é gerado aqui no seu navegador. Nada é enviado
>    para fora."
> 5. **"O que aparece no meu crachá"** — bloco com fundo `#f7f8f9`, borda `#e2e5e9` e
>    raio de 10px, listando em texto o que está impresso: nome, número de registro,
>    situação, foto e QR Code. Na sequência, uma **caixa de seleção única, desmarcada por
>    padrão**, com o rótulo "Mostrar o meu tipo de deficiência no crachá" e, abaixo dela,
>    a explicação da consequência em duas frases neutras: "Se você marcar, a palavra
>    Física, Intelectual ou Neurodivergentes, Sensorial (visão, audição, fala) ou Outro
>    fica impressa na frente do crachá, visível para qualquer pessoa que veja o
>    documento." e "Se você não marcar, o crachá não diz nada sobre isso, e a página
>    pública de verificação também não." Não use texto que incentive marcar (nada de
>    "recomendado", "ajuda no atendimento", "facilita"), não pré-marque, não destaque a
>    opção com cor de ação, e não coloque emoji ou selo ao lado. A escolha é da pessoa.
> 6. **Bloco de privacidade**, discreto e em texto corrido: "Sua foto fica guardada só
>    para o crachá. Ela nunca aparece na página pública de verificação." Com link "Ler a
>    Política de Privacidade".
> 7. **Alternativa humana**: "Não consegue imprimir? Fale com a associação:
>    (12) 3346-0605."
>
> **Envio e recorte da foto**, que é o subfluxo mais delicado da tela. A foto é
> obrigatória: sem ela não existe crachá. O envio abre um recortador com moldura fixa de
> proporção 4:5, imagem arrastável, controle de aproximação operável por teclado (setas
> movem, `+` e `−` aproximam) e não só por gesto de pinça, botões "Cancelar" e "Usar esta
> foto" com 44px, e a linha "A imagem é reduzida para 400 × 500 pixels aqui no seu
> aparelho." Escreva as instruções do envio como orientação prática: rosto visível, luz
> boa, sem óculos escuros, sem boné.
>
> Renderize estas seis telas:
>
> 1. **Sem foto ainda** — no lugar do crachá, um bloco com a mesma proporção e borda
>    tracejada `#6f7782`, com o texto "Falta a sua foto para o crachá ficar pronto", o
>    botão primário "Enviar minha foto" e as três orientações de foto. As ações de baixar
>    aparecem desabilitadas **com a explicação do porquê ao lado**, não só apagadas.
> 2. **Recortando a foto** — a pessoa ajustando o enquadramento dentro da moldura 4:5,
>    com a pré-visualização do rosto na posição em que vai sair impresso.
> 3. **Foto sendo processada** — estado curto e honesto: "Preparando a sua foto…" com
>    indicação de progresso determinada, sem animação que gire indefinidamente, e a linha
>    "Isso acontece aqui no seu navegador e leva alguns segundos."
> 4. **Erro de foto grande demais** — bloco de erro em `#8b0000` sobre `#fdf2f2`, com
>    borda esquerda de 4px, ícone e texto que diz o que fazer: "Esta foto tem 14 MB e não
>    foi possível reduzir para o tamanho do crachá. Tente uma foto tirada pelo próprio
>    celular, ou escolha outra imagem com menos de 10 MB." Abaixo, os botões "Escolher
>    outra foto" e "Tirar foto agora". Nada de culpar a pessoa e nada de "erro
>    inesperado".
> 5. **Crachá pronto** — frente e verso lado a lado no desktop e empilhados no mobile,
>    ambos rotulados como "Frente" e "Verso", com a caixa de seleção do item 5
>    desmarcada.
> 6. **Pré-visualização de impressão** — folha A4 branca com a frente e o verso em
>    tamanho real, marcas de corte finas, e a instrução "Imprima em 100%. Não use a opção
>    de ajustar à página, senão o crachá sai menor que o tamanho certo."
>
> Acessibilidade como requisito de layout: um único `h1`; foco visível com anel de 3px
> `#0f4c93` e 2px de folga; alvos de 44px com 8px de folga; a situação do crachá dita por
> ícone e texto, nunca só por cor; o resultado do envio de foto anunciado por região
> `aria-live`; nada abaixo de 15px; texto não justificado; o número de registro com
> `font-variant-numeric: tabular-nums` e espaçamento que separe os grupos.

---

## Aceite visual

- [ ] O número aparece como `APPD-2026-00042`, em fonte tabular, legível de longe.
- [ ] A caixa de seleção do tipo de deficiência está **desmarcada** e o texto explica a
      consequência sem induzir a marcar.
- [ ] Sem a caixa marcada, nenhuma palavra sobre deficiência aparece no crachá.
- [ ] A foto é retangular 4:5 e não está cortada em círculo.
- [ ] O QR Code aponta para `/verificar/APPD-2026-00042` e o endereço também está
      escrito por extenso.
- [ ] Nada no crachá mostra endereço da pessoa, data de nascimento, telefone ou cuidador.
- [ ] As seis telas foram renderizadas, inclusive o recorte e o erro de foto grande.
- [ ] A tela diz, em algum lugar visível, que o arquivo é gerado no próprio navegador.
- [ ] O estado desabilitado das ações de baixar explica o motivo, não só apaga o botão.
- [ ] Nenhum holograma, selo brilhante, degradê metálico ou textura atrás de texto.
- [ ] Em 360px o crachá cabe inteiro na largura, sem rolagem horizontal.

## Se sair errado

- **A caixa do tipo de deficiência veio marcada, ou com texto que convence a marcar**:
  reprovação dura. Peça "desmarque por padrão e reescreva o texto de forma neutra: só a
  consequência de marcar e a de não marcar, sem recomendação".
- **O crachá ganhou textura, holograma ou faixa diagonal**: peça "superfície lisa; o
  documento se prova pelo QR Code e pela página de verificação, não por enfeite de
  segurança falso".
- **O número saiu em fonte proporcional**: peça fonte tabular e agrupamento visual —
  quem lê em voz alta ao telefone não pode confundir 0 com O.
- **Apareceu tela de "aguardando aprovação"**: remova. Nesta versão a liberação é
  imediata; prometer análise que não existe é mentira na interface.
- **O recorte só funciona com gesto de arrastar**: peça controles de teclado visíveis,
  com botões de aproximar e afastar de 44px.
