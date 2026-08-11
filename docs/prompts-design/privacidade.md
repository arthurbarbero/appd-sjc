# Prompt — Política de Privacidade e Seus direitos

Duas telas irmãs, escritas juntas porque uma só funciona com a outra: `/privacidade`
explica o que a associação faz com os dados, e `/seus-direitos` é onde a pessoa **age**
sobre eles. Se as duas forem geradas em sessões diferentes, elas divergem.

> **v2 — 2026-08-11.** A v1 é de 2026-08-05 e ficou desatualizada em cinco pontos, todos
> por decisão registrada depois dela. Gerar a partir da v1 produziria telas que **afirmam
> coisas falsas** sobre o próprio sistema. O que mudou:
>
> | Ponto                               | O que a v1 mandava desenhar                                  | O que vale hoje                                                                                         |
> | ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
> | Fluxo de exclusão                   | três telas (pedido, confirmação, recibo) dentro deste prompt | **Fora daqui.** É uma página com um modal, de `area-do-associado`, já no ar (ADR-013)                   |
> | Número de protocolo                 | `[A CONFIRMAR]` no recibo                                    | **Não existe.** O `numero_registro` já identifica a pessoa (ADR-012, REQ-19)                            |
> | Prazo de retenção                   | `[A CONFIRMAR]` na seção 9                                   | **Decidido**: o site não retém nada, porque não guarda prontuário (ADR-017)                             |
> | Foto na verificação pública         | "a página pública de verificação não mostra foto"            | **Mostra.** O que ela não tem é endereço próprio de imagem (ADR-015)                                    |
> | Tipo de deficiência em `/verificar` | "nunca aparece na página pública"                            | **Aparece se — e só se — a pessoa marcar o opt-in**; o consentimento governa os dois destinos (ADR-019) |
>
> Continuam abertas, e continuam `[A CONFIRMAR]`: **encarregado de dados** (PB-2) e
> **quem responde e em quanto tempo** (PB-4). Essas duas são da associação, e não se
> inventam.

## A espinha

**Decisão que as telas ajudam a tomar:** em `/privacidade`, "eu entrego minha informação
de saúde para essa associação?". Em `/seus-direitos`, "como eu mudo de ideia?". As duas
perguntas são da mesma pessoa, em momentos diferentes.

**O que o olho vê primeiro, segundo, terceiro, em `/privacidade`:**

1. O que a associação coleta e para quê, em uma frase.
2. O sumário — a pessoa quase nunca lê o documento inteiro, ela procura um assunto.
3. O caminho para exercer o direito, no fim e também no topo.

**Parede de texto jurídico é barreira de acessibilidade**, e neste site isso é
literal: o público inclui pessoas com deficiência intelectual e familiares idosos. A
regra desta tela é **linguagem simples primeiro, termo formal depois** — cada seção
começa com a explicação em português comum, e o dispositivo legal aparece embaixo, num
bloco menor rotulado. Nunca o contrário; nunca só o juridiquês.

**O que não se inventa:** nome do encarregado de dados e prazo de resposta operacional da
associação não estão decididos. Entram como `[A CONFIRMAR]` bem visível, no corpo do
texto, não escondido em nota de rodapé.

**Estados:** documento completo e `/seus-direitos` completa. **Duas telas, e só.** O fluxo
de exclusão não é deste prompt.

---

## O prompt — Política de Privacidade (`/privacidade`)

> Página de Política de Privacidade de um site institucional responsivo (desktop 1280px,
> mobile 360px) da APPD São José dos Campos, associação de pessoas com deficiência. O
> site coleta dado de saúde (tipo de deficiência), então este documento é levado a sério.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
> Quem lê é a pessoa com deficiência ou um familiar cuidador, sem formação jurídica,
> desconfiado e com pressa. A estética é de **documento público bem diagramado, não de
> contrato**: seções curtas com título próprio, sumário navegável, texto entre 60 e 75
> caracteres por linha, e o termo legal sempre depois da explicação simples. **Evite**
> parágrafo com mais de cinco linhas, texto em duas colunas, texto justificado, letra
> miúda, bloco "aceito os termos", acordeão fechado escondendo seção, ícone ilustrado
> colorido e qualquer numeração de cláusula do tipo "4.2.1". **Prefira** títulos que
> sejam perguntas ("O que a APPD guarda sobre você?"), listas curtas, e um bloco
> `#f7f8f9` com borda `#e2e5e9` chamado "No termo da lei" abaixo de cada explicação.
>
> Estrutura, nesta ordem:
>
> 1. **Topo** — `h1` "Política de Privacidade"; abaixo, em 19px, "O que a APPD faz com a
>    sua informação, em linguagem simples."; e uma linha com "Versão 1 · Em vigor desde
>    7 de agosto de 2026". Um link "Ver os seus direitos e pedir correção ou exclusão" já
>    aqui no topo — quem veio agir não precisa ler o documento todo.
> 2. **Sumário "Nesta página"** — lista de links para as seções, dentro de um bloco com
>    borda. No desktop acima de 1024px ele pode ficar fixo na lateral esquerda; o texto
>    continua em coluna única. No mobile fica no topo, aberto, nunca escondido em botão.
> 3. **Quem é responsável** — APPD São José dos Campos, CNPJ 08.074.883/0001-96, Rua
>    Acássia Pereira 136, Campos dos Alemães, São José dos Campos/SP, telefone
>    (12) 3346-0605, e-mail appdsjc@gmail.com. Encarregado de dados: `[A CONFIRMAR]`.
> 4. **Que informação a APPD coleta** — em três grupos com lista curta: dados de contato
>    e endereço (nome, data de nascimento, telefone, endereço, bairro, município,
>    cuidador); informação sobre deficiência; e dados da conta e do crachá (e-mail,
>    senha guardada de forma cifrada, foto do crachá, número de registro).
> 5. **Para que serve cada uma** — uma linha por grupo, concreta: registrar o interesse
>    da pessoa em ser atendida e em quais dias, entrar em contato, e emitir o crachá.
>    **Não diga "fila de atendimento" nem "vaga"**: a associação não opera fila, e o site
>    não promete posição nenhuma. O que existe é um registro de interesse que a pessoa
>    mesma edita.
> 6. **Com qual base legal** — explicação simples e, no bloco "No termo da lei", os
>    artigos da Lei 13.709/2018 (LGPD).
> 7. **A informação sobre deficiência é dado sensível** — seção com destaque próprio,
>    borda esquerda de 4px em `#8b0000`. Explique que esse dado só é tratado com
>    consentimento específico, dado numa caixa de seleção separada no cadastro, que vem
>    desmarcada. E explique, com estas duas situações lado a lado, o que a **segunda**
>    escolha controla — a de exibição, que é outra caixa, na área do associado:
>    - **sem marcar** (o padrão): o tipo de deficiência não aparece no crachá impresso
>      nem na página pública de verificação;
>    - **marcando**: aparece nos dois, porque quem mostra o crachá numa portaria já está
>      mostrando para desconhecido, e separar papel de web seria uma pergunta a mais para
>      quem menos aguenta pergunta a mais.
>      Deixe claro que a escolha é reversível a qualquer momento, na área do associado. No
>      bloco "No termo da lei": Art. 11 da LGPD.
> 8. **Registro do seu aceite** — a associação guarda a versão do termo que você aceitou,
>    com data e hora, e uma impressão digital do texto exato que estava na tela. Explique
>    para que serve, em linguagem simples: "assim dá para saber exatamente com o que você
>    concordou, e quando — mesmo que o texto mude depois". Diga que você pode pedir uma
>    cópia desse registro, e que mudar o texto do termo **não** apaga nem invalida o
>    aceite antigo.
> 9. **Por quanto tempo a informação fica guardada** — **não** marque `[A CONFIRMAR]`
>    aqui; isto está decidido. Diga, em linguagem simples: quando você pede exclusão, os
>    seus dados saem na hora e não ficam guardados por prazo nenhum. O site não guarda
>    prontuário — nenhuma evolução, avaliação, laudo ou registro de sessão. O que fica é o
>    número de registro sem nada ligado a ele, para que um crachá antigo não passe a
>    identificar outra pessoa, e o registro de que você aceitou e depois retirou o
>    consentimento, com data e hora. No bloco "No termo da lei": Art. 16 da LGPD.
> 10. **Com quem é compartilhada** — hoje, com ninguém fora da associação; a empresa que
>     hospeda o site trata os dados apenas para manter o site no ar; não há venda de
>     dado, não há publicidade, não há rastreador de terceiro no site.
> 11. **A foto do crachá** — onde fica, quem vê, e a verdade exata, que é mais estreita do
>     que "a foto nunca é pública": a foto **aparece** na página de verificação, porque é
>     ela que responde se quem está na frente do verificador é o dono do crachá. O que ela
>     não tem é **endereço próprio**: a imagem viaja embutida na resposta da página, não
>     existe link direto para o arquivo, e por isso ela não é indexável nem se descola da
>     página. Diga isso em duas frases, sem jargão.
> 12. **Cookies e registros de acesso** — só o necessário para manter você conectado.
> 13. **Como pedir correção ou exclusão** — explicação em três frases e o botão
>     contornado "Ver os seus direitos", que leva a `/seus-direitos`.
> 14. **Quando esta política mudar** — como a associação avisa e onde fica a versão
>     anterior. Diga que mudança de forma (uma vírgula, uma palavra trocada) não pede novo
>     aceite, e que mudança no que você está autorizando pede — e nesse caso o aviso
>     aparece quando você entrar, sem travar a sua conta.
> 15. **Rodapé** igual ao do resto do site.
>
> Acessibilidade como requisito de layout: um único `h1`; `h2` por seção, na mesma ordem
> do sumário, sem pular nível; cada link do sumário leva a um alvo com foco; foco visível
> de 3px `#0f4c93` com 2px de folga; alvos de 44px; nada sinalizado só por cor; texto
> não justificado; corpo de 17px e nada abaixo de 15px; largura de linha entre 60 e 75
> caracteres; as marcações `[A CONFIRMAR]` visíveis no corpo do texto, com contraste
> suficiente, nunca em cinza claro.

---

## O prompt — Seus direitos (`/seus-direitos`)

> Página "Seus direitos" de um site institucional responsivo (desktop 1280px, mobile
> 360px) da APPD São José dos Campos, associação de pessoas com deficiência. É a página
> onde a pessoa **age** sobre os próprios dados — irmã da Política de Privacidade e com o
> mesmo desenho.
> Use o design system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`,
> superfície `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta,
> amarelo `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo
> `#6f7782`, link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson
> Hyperlegible com corpo de 17px e título de página em 56px, raio de 10px em bloco e
> campo, elevação discreta, espaçamento generoso com base 8.
> Aqui a estética é de **balcão de atendimento**, não de documento: cada direito é um
> bloco com o que ele significa e o botão ou o caminho para pedir. **Evite** parede de
> texto, lista de artigos de lei sem tradução, formulário longo, e qualquer desenho que
> faça o pedido de exclusão parecer difícil de propósito — passo escondido, botão
> apagado, texto que assusta sem informar. **Prefira** um cartão por direito, verbo no
> botão ("Pedir correção", "Pedir cópia dos meus dados", "Excluir meus dados"), e
> honestidade sobre o que a associação ainda não definiu.
>
> Estrutura, nesta ordem:
>
> 1. **Topo** — `h1` "Seus direitos sobre os seus dados"; linha de apoio "Você pode
>    conferir, corrigir, pedir cópia ou apagar a sua informação. Aqui está como."; e link
>    "Ler a Política de Privacidade".
> 2. **Como pedir** — três canais lado a lado no desktop e empilhados no mobile: pela
>    área do associado (quem tem conta), por telefone (12) 3346-0605, e por e-mail
>    appdsjc@gmail.com. Abaixo, em texto: "Quem responde e em quanto tempo:
>    `[A CONFIRMAR]`." Cite o prazo previsto na LGPD (resposta imediata em formato
>    simplificado, ou declaração completa em até 15 dias) como referência da lei, deixando
>    claro que esse prazo vale para **confirmar que existem dados e dar acesso a eles** —
>    não para todos os direitos —, e que o compromisso operacional da associação ainda vai
>    ser publicado aqui.
> 3. **Um cartão por direito**, com título em linguagem simples, uma frase do que
>    significa e a ação: confirmar que a associação tem dados seus; ver os seus dados;
>    corrigir dado errado; pedir cópia para levar a outro lugar; saber com quem foi
>    compartilhado; retirar o consentimento do dado de deficiência; e apagar os seus
>    dados. Cada cartão com borda `#e2e5e9`, raio 10px e sombra discreta.
> 4. **Ver os seus dados / pedir cópia** — desenhe o **resultado**, não só o botão: um
>    bloco que mostra na própria tela os campos guardados e uma lista do histórico de
>    consentimento, uma linha por evento, com o tipo (aceitou ou retirou), a versão do
>    termo, a data e a hora, e a impressão digital do texto em fonte monoespaçada,
>    encurtada com reticências. Ao lado, o botão "Baixar em arquivo". A foto do crachá
>    aparece como item separado para baixar, nunca como link público.
> 5. **Retirar o consentimento do dado de deficiência** ganha um cartão com destaque
>    próprio, porque a consequência é concreta: explique em duas frases que, sem esse
>    dado, a associação pode não conseguir organizar o seu atendimento — sem tom de
>    ameaça, apenas o fato — e que retirar o consentimento **não apaga a sua conta**.
>    A confirmação acontece na própria página, num bloco que aparece abaixo do cartão:
>    **do cartão ao feito são no máximo dois cliques.** Nada de página intermediária.
> 6. **Excluir meus dados** — último bloco, com a ação destrutiva em vermelho
>    **contornado**, fundo transparente, nunca preenchida. Ele **leva** para a página de
>    exclusão que já existe (`/area/excluir`) em vez de repetir o fluxo aqui; nesta tela
>    ele é um caminho, não um formulário.
> 7. **Rodapé** igual ao do resto do site.
>
> **Não desenhe** o fluxo de exclusão em si — pedido, confirmação e recibo. Ele já existe
> como uma página com um modal, foi aprovado e está no ar. Redesenhar aqui criaria um
> segundo contrato para a mesma tela, que foi exatamente o problema que a decisão de dono
> único por rota resolveu.
>
> **Não invente número de protocolo.** Não existe: o número de registro da pessoa já
> identifica o pedido, e o site não tem um segundo espaço de numeração.
>
> Acessibilidade como requisito de layout: um único `h1` por página; foco visível de 3px
> `#0f4c93` com 2px de folga; alvos de 44px com 8px de folga; botão desabilitado que
> mantém 3:1 e diz por que está desabilitado; nada sinalizado só por cor; texto não
> justificado; nada abaixo de 15px.

---

## Aceite visual

### Política de Privacidade

- [ ] Cada seção começa em linguagem simples; o termo legal vem depois, em bloco próprio.
- [ ] O sumário é navegável e está aberto no mobile, não escondido em botão.
- [ ] Nenhuma seção passa de cinco linhas por parágrafo; nada em duas colunas.
- [ ] O dado de saúde tem seção própria, citando o Art. 11 e o consentimento específico.
- [ ] A seção do dado sensível mostra as duas situações — opt-in marcado e desmarcado — e
      diz que o marcado vale para o crachá **e** para a página pública.
- [ ] Aparece o versionamento do termo com data, hora e impressão digital do texto.
- [ ] A seção de tempo de guarda diz que nada fica retido, **sem** `[A CONFIRMAR]`.
- [ ] Só o encarregado de dados está marcado `[A CONFIRMAR]`, no corpo do texto.
- [ ] A frase sobre a foto está correta: aparece na verificação, sem endereço próprio.
- [ ] Nenhum prazo, e-mail, telefone ou nome de encarregado inventado.
- [ ] A palavra "fila" não aparece em lugar nenhum.

### Seus direitos

- [ ] Cada direito tem um cartão com verbo de ação, não só descrição.
- [ ] O histórico de consentimento aparece na tela, com versão, evento, data e hora.
- [ ] Retirar o consentimento acontece em no máximo dois cliques a partir desta página.
- [ ] A exclusão é vermelho contornado, nunca preenchido, e **leva** para `/area/excluir`.
- [ ] O fluxo de exclusão **não** foi redesenhado aqui.
- [ ] Nenhum número de protocolo aparece, nem como `[A CONFIRMAR]`.
- [ ] `[A CONFIRMAR]` aparece só em "quem responde e em quanto tempo".

## Se sair errado

- **Virou contrato numerado** ("Cláusula 4.2.1"): peça "títulos em forma de pergunta,
  sem numeração de cláusula; a lei entra no bloco 'No termo da lei'".
- **O juridiquês voltou para o começo da seção**: peça a inversão — "explicação simples
  primeiro, artigo depois, em bloco menor".
- **As seções vieram em acordeão fechado**: peça tudo aberto; conteúdo escondido atrás
  de clique é barreira, e aqui é barreira em documento legal.
- **A exclusão ficou parecendo pegadinha** (botão escondido, texto de medo): peça "o
  caminho de exclusão é claro e curto; a tela informa a consequência, não intimida".
- **Apareceu prazo de retenção em dias, meses ou anos**: reprovação dura. A decisão é que
  não há retenção — prazo concreto aqui é invenção.
- **Voltou o fluxo de exclusão em três telas**: descarte as três. A tela existe e está no
  ar; o que esta página tem é um link para ela.
- **A página afirma que a foto nunca é pública**: está errado desde 2026-08-07. Peça a
  versão estreita: aparece na verificação, sem endereço próprio de imagem.
