# Prompt — Política de Privacidade e Seus direitos

Duas telas irmãs, escritas juntas porque uma só funciona com a outra: `/privacidade`
explica o que a associação faz com os dados, e `/seus-direitos` é onde a pessoa **age**
sobre eles. Se as duas forem geradas em sessões diferentes, elas divergem.

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

**O que não se inventa:** prazo de retenção, nome do encarregado de dados, prazo de
resposta operacional da associação e número de protocolo não estão decididos. Entram
como `[A CONFIRMAR]` bem visível, e a tela precisa ficar honesta com essa marcação no
corpo do texto, não escondida em nota de rodapé.

**Estados:** documento completo; `/seus-direitos` completa; e o fluxo de pedido de
exclusão de dados em três telas, incluindo a confirmação.

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
>    sua informação, em linguagem simples."; e uma linha com "Versão [A CONFIRMAR] ·
>    Atualizada em [A CONFIRMAR]". Um link "Ver os seus direitos e pedir correção ou
>    exclusão" já aqui no topo — quem veio agir não precisa ler o documento todo.
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
> 5. **Para que serve cada uma** — uma linha por grupo, concreta: organizar a fila de
>    atendimento, entrar em contato, e emitir o crachá.
> 6. **Com qual base legal** — explicação simples e, no bloco "No termo da lei", os
>    artigos da Lei 13.709/2018 (LGPD).
> 7. **A informação sobre deficiência é dado sensível** — seção com destaque próprio,
>    borda esquerda de 4px em `#8b0000`: explica que esse dado só é tratado com
>    consentimento específico, dado por você numa caixa de seleção separada no cadastro,
>    que vem desmarcada; que ele **não aparece no crachá** a menos que você marque a
>    opção; e que ele **nunca aparece na página pública de verificação**. No bloco "No
>    termo da lei": Art. 11 da LGPD.
> 8. **Registro do seu aceite** — a associação guarda a versão do termo que você aceitou,
>    com data e hora. Explique para que isso serve, em linguagem simples: "assim dá para
>    saber exatamente com o que você concordou, e quando". Diga que você pode pedir uma
>    cópia desse registro.
> 9. **Por quanto tempo a informação fica guardada** — `[A CONFIRMAR]`, escrito no corpo
>    do texto: "A associação ainda está definindo esse prazo. Assim que definir, ele
>    aparece aqui e você é avisado na próxima vez que entrar." Não invente prazo.
> 10. **Com quem é compartilhada** — hoje, com ninguém fora da associação; a empresa que
>     hospeda o site trata os dados apenas para manter o site no ar; não há venda de
>     dado, não há publicidade, não há rastreador de terceiro no site.
> 11. **A foto do crachá** — onde fica, quem vê, e a frase direta: "A sua foto nunca é
>     publicada em endereço aberto. A página pública de verificação não mostra foto."
> 12. **Cookies e registros de acesso** — só o necessário para manter você conectado.
> 13. **Como pedir correção ou exclusão** — explicação em três frases e o botão
>     contornado "Ver os seus direitos", que leva a `/seus-direitos`.
> 14. **Quando esta política mudar** — como a associação avisa e onde fica a versão
>     anterior.
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
>    claro que o compromisso operacional da associação ainda vai ser publicado aqui.
> 3. **Um cartão por direito**, com título em linguagem simples, uma frase do que
>    significa e a ação: confirmar que a associação tem dados seus; ver os seus dados;
>    corrigir dado errado; pedir cópia para levar a outro lugar; saber com quem foi
>    compartilhado; retirar o consentimento do dado de deficiência; e apagar os seus
>    dados. Cada cartão com borda `#e2e5e9`, raio 10px e sombra discreta.
> 4. **Retirar o consentimento do dado de deficiência** ganha um cartão com destaque
>    próprio, porque a consequência é concreta: explique em duas frases que, sem esse
>    dado, a associação pode não conseguir organizar o atendimento — sem tom de ameaça,
>    apenas o fato — e que retirar o consentimento não apaga automaticamente a conta.
> 5. **Excluir meus dados** — último bloco, com a ação destrutiva em vermelho
>    **contornado**, fundo transparente, nunca preenchida.
> 6. **Rodapé** igual ao do resto do site.
>
> Renderize, além da página completa, o **fluxo de pedido de exclusão** em três telas:
>
> 1. **Pedido** — tela `/area/excluir` explicando, em lista curta, o que será apagado
>    (conta, dados de contato, informação sobre deficiência, foto e crachá) e o que
>    acontece na prática: o crachá deixa de ser verificado na página pública, e você sai
>    da fila de atendimento. Uma linha diz "O que a lei obriga a associação a guardar
>    mesmo depois: `[A CONFIRMAR]`." Botão contornado vermelho "Continuar com a exclusão"
>    e link "Cancelar".
> 2. **Confirmação** — a tela que impede o clique acidental sem punir quem tem
>    dificuldade motora ou intelectual: **uma caixa de seleção desmarcada** com o texto
>    "Entendi que isso não pode ser desfeito", e só então o botão contornado vermelho
>    "Excluir meus dados" fica ativo, com o motivo explicado ao lado enquanto está
>    desabilitado. Ao lado, o botão "Cancelar", visualmente mais forte que a ação
>    destrutiva. **Não** peça para digitar uma palavra de confirmação — teclar "EXCLUIR"
>    é barreira real para parte deste público.
> 3. **Recibo** — confirmação do pedido registrado, com a data e a hora, o canal por onde
>    a resposta virá, e o que fazer se nada acontecer: ligar para (12) 3346-0605. Se
>    houver número de protocolo, ele aparece marcado `[A CONFIRMAR]` — não invente
>    formato de protocolo.
>
> Acessibilidade como requisito de layout: um único `h1` por página; foco visível de 3px
> `#0f4c93` com 2px de folga; alvos de 44px com 8px de folga; a caixa de seleção da
> confirmação com área clicável de 44px incluindo o rótulo; botão desabilitado que
> mantém 3:1 e diz por que está desabilitado; nada sinalizado só por cor; texto não
> justificado; nada abaixo de 15px.

---

## Aceite visual

### Política de Privacidade

- [ ] Cada seção começa em linguagem simples; o termo legal vem depois, em bloco próprio.
- [ ] O sumário é navegável e está aberto no mobile, não escondido em botão.
- [ ] Nenhuma seção passa de cinco linhas por parágrafo; nada em duas colunas.
- [ ] O dado de saúde tem seção própria, citando o Art. 11 e o consentimento específico.
- [ ] Aparece o versionamento do termo com data e hora do aceite.
- [ ] Prazo de retenção e encarregado estão marcados `[A CONFIRMAR]`, no corpo do texto.
- [ ] A frase sobre a foto nunca ser pública está lá, explícita.
- [ ] Nenhum prazo, e-mail, telefone ou nome de encarregado inventado.

### Seus direitos

- [ ] Cada direito tem um cartão com verbo de ação, não só descrição.
- [ ] A exclusão é vermelho contornado, nunca preenchido.
- [ ] A confirmação usa caixa de seleção, não digitação de palavra.
- [ ] O botão de exclusão desabilitado explica por que está desabilitado.
- [ ] "Cancelar" é visualmente mais forte que a ação destrutiva.
- [ ] O recibo mostra data, hora e canal de resposta, sem protocolo inventado.
- [ ] As três telas do fluxo de exclusão foram renderizadas.

## Se sair errado

- **Virou contrato numerado** ("Cláusula 4.2.1"): peça "títulos em forma de pergunta,
  sem numeração de cláusula; a lei entra no bloco 'No termo da lei'".
- **O juridiquês voltou para o começo da seção**: peça a inversão — "explicação simples
  primeiro, artigo depois, em bloco menor".
- **As seções vieram em acordeão fechado**: peça tudo aberto; conteúdo escondido atrás
  de clique é barreira, e aqui é barreira em documento legal.
- **A exclusão ficou parecendo pegadinha** (botão escondido, texto de medo): peça "o
  caminho de exclusão é claro e curto; a tela informa a consequência, não intimida".
- **Apareceu prazo de retenção concreto**: reprovação dura — ninguém decidiu isso.
  Peça `[A CONFIRMAR]` de volta.
