# Prompt — Formulário de Atendimento

A tela mais difícil do site, e a que mais importa. Réplica fiel dos 15 campos do
CADASTRO DE ATENDIMENTO 2026 — rótulos, ordem e obrigatoriedade não mudam
([campos-formulario.md](../campos-formulario.md)). O que muda é tudo em volta.

## A espinha

**Decisão que a tela ajuda a tomar:** nenhuma. Aqui a decisão já foi tomada — a tela
precisa **não atrapalhar**. O sucesso é a pessoa terminar sem desistir e sem perder o
que digitou.

**Quem preenche:** frequentemente não é a pessoa atendida, e sim um familiar cuidador,
no celular, cansado, às vezes com o telefone da pessoa em mãos. Também pode ser alguém
com deficiência motora usando teclado ou leitor de tela, para quem refazer o formulário
é um custo alto e real.

**O que o olho vê primeiro, segundo, terceiro:**

1. Quanto trabalho isto vai dar e o que acontece depois.
2. O campo atual, sozinho e claro.
3. O consentimento — que precisa ser lido, não deslizado.

**Estados obrigatórios:** vazio; preenchido; erro por campo com resumo no topo;
enviando; sucesso com o número de registro. **Erro nunca apaga resposta.**

---

## O prompt

> Formulário de cadastro de atendimento, responsivo (desktop 1280px, mobile 360px), do
> site da APPD São José dos Campos, associação de pessoas com deficiência. Use o design
> system do projeto `appd-sjc` (versão 2): fundo branco, texto `#14161a`, superfície
> `#f7f8f9`, ação `#8b0000` preenchida com raio de 8px e sombra discreta, amarelo
> `#bbb070` só com texto escuro, borda de estrutura `#e2e5e9` e de campo `#6f7782`,
> link e foco em `#0f4c93`, rodapé quase preto `#14161a`, Atkinson Hyperlegible com
> corpo de 17px e título de página em 56px, raio de 10px em bloco e campo, elevação
> discreta, espaçamento generoso com base 8, campos e botões com 52px de altura,
> erro em `#8b0000` sobre `#fdf2f2`.
> Quem preenche costuma ser um familiar cuidador, no celular, cansado — ou a própria
> pessoa com deficiência, usando teclado ou leitor de tela. A tela não pode ser bonita
> às custas de ser fácil: campo largo, rótulo grande e sempre visível acima do campo,
> muito respiro entre campos, um assunto por vez. **Página única com seções**, não
> assistente de várias etapas: a pessoa precisa ver o tamanho do que está assumindo e
> poder voltar sem perder nada. A estética é de formulário público sério e bem
> diagramado, mas contemporâneo — campos com canto suave, agrupamento por espaço e
> borda leve, hierarquia por tamanho de texto. **Evite** placeholder no lugar de rótulo,
> campo flutuante com rótulo que sobe, ícone dentro do campo, campos lado a lado no
> mobile, barra de progresso decorativa, e qualquer animação de transição entre seções.
> **Prefira** rótulo estático acima do campo, texto de ajuda abaixo do rótulo, e cada
> opção de escolha como um bloco clicável inteiro de 44px com canto de 6px.
>
> Estrutura, com os rótulos nas mesmas palavras do formulário oficial, escritos em
> caixa alta e baixa (CAIXA ALTA reduz legibilidade; as palavras são as mesmas):
>
> - **Topo**: `h1` "Cadastro de Atendimento 2026" e, em bloco amarelo com texto escuro,
>   ícone e borda esquerda: "As vagas são chamadas conforme abrem."; "As sessões
>   acontecem somente no período da manhã."; "Mantenha o telefone atualizado — é por
>   ele que vem o primeiro contato." Não repita aqui nada sobre contribuição ou valor:
>   isso aparece uma vez só, no campo 15.
> - **Seção 1 — Quem vai ser atendido**: NOME (texto, obrigatório); DATA DE NASCIMENTO
>   (campo de data acessível que aceita digitação em dd/mm/aaaa, obrigatório); TELEFONE
>   PARA CONTATO (texto com máscara, obrigatório, com ajuda "É por ele que vem o
>   primeiro contato."); É WHATSAPP (rádio Sim/Não, obrigatório).
> - **Seção 2 — Onde você mora**: ENDEREÇO (rua/avenida/travessa) (área de texto,
>   obrigatório); NÚMERO (texto, obrigatório); COMPLEMENTO (se houver) (texto,
>   opcional); BAIRRO (obrigatório); MUNICÍPIO (obrigatório).
> - **Seção 3 — Cuidador, se houver**: NOME DO CUIDADOR (se necessário) (opcional);
>   CONTATO DO CUIDADOR (opcional). A seção começa com a linha "Preencha só se outra
>   pessoa acompanha o atendimento."
> - **Seção 4 — Sobre o atendimento**: POSSUI ALGUMA DEFICIÊNCIA (grupo de caixas de
>   seleção, obrigatório, múltipla escolha: Física / Intelectual ou Neurodivergentes /
>   Sensorial (visão, audição, fala) / Outro, com campo de texto que aparece ao marcar
>   Outro); Tipo de Atendimento (caixas de seleção, múltipla: Empréstimo Equipamentos /
>   Fisioterapia / Orientações Gerais / Psicologia / Serviço Social / Outro); Melhores
>   dias (sessões SOMENTE no período da manhã) (caixas de seleção: Segundas / Terças /
>   Quartas / Quintas / Sextas / Qualquer Dia da Semana).
> - **Seção 5 — Consentimento**, visualmente distinta das demais, com borda mais forte:
>   explica que a informação sobre deficiência é dado de saúde, protegido pelo Art. 11
>   da LGPD, e pede uma caixa de seleção específica, **desmarcada por padrão**, com o
>   texto "Autorizo a APPD a tratar minha informação sobre deficiência para organizar o
>   meu atendimento." Ao lado, link "Ler a Política de Privacidade". Abaixo, o campo 15
>   original: Ciência da Contribuição Solidária, rádio com a opção "Ciente",
>   obrigatório, com o texto do valor visível ao lado do controle — nunca em modal ou
>   link.
> - **Envio**: botão primário "Enviar meu cadastro", e ao lado, em texto, "Prefere
>   preencher por telefone? (12) 3346-0605".
>
> Cada grupo de caixas de seleção e de rádio vem dentro de um `fieldset` com `legend`
> igual ao rótulo do campo, controles de 24px, área clicável de 44px incluindo o rótulo
> e 8px de folga entre opções. Campo obrigatório marcado por asterisco **e** pela
> palavra "obrigatório" no texto de ajuda — nunca só pelo asterisco.
>
> Renderize estas quatro telas:
>
> 1. **Vazio** — o formulário como a pessoa encontra.
> 2. **Com erro** — resumo no topo com `role="alert"` dizendo "Faltam 2 campos para
>    enviar" e listando links que levam ao campo; os dois campos com borda de 2px em
>    `#8b0000` e fundo `#fdf2f2`, ícone e mensagem específica abaixo ("O telefone precisa ter DDD e 9
>    dígitos. Exemplo: (12) 99165-7059."); e **todas as demais respostas preservadas**,
>    visivelmente preenchidas.
> 3. **Enviando** — botão desabilitado com o rótulo "Enviando…" e aviso de que a pessoa
>    não deve fechar a página; sem animação que gire indefinidamente.
> 4. **Sucesso** — página de confirmação com o número de registro em destaque
>    (APPD-2026-00042), o que acontece agora, em quanto tempo e por qual canal vem o
>    contato, e o que fazer se o telefone mudar.
>
> Acessibilidade como requisito de layout: um `h1`; foco visível de 3px `#0f4c93` com
> 2px de folga; ordem de foco igual à ordem visual; mensagem de erro ligada ao campo por
> `aria-describedby`; resumo de erros focado ao aparecer; nada sinalizado só por cor;
> nenhum campo lado a lado no mobile.

---

## Aceite visual

- [ ] Os 15 rótulos usam as mesmas palavras do original, na mesma ordem, em caixa alta
      e baixa.
- [ ] Nenhum campo usa placeholder como rótulo.
- [ ] O consentimento do Art. 11 é uma seção própria, destacada, com a caixa desmarcada.
- [ ] O valor aparece **uma vez só**, no campo 15, ao lado do controle — não no topo,
      não na página de serviço, não na home.
- [ ] No estado de erro, **todas as outras respostas continuam preenchidas**.
- [ ] O erro diz como corrigir, com exemplo — não "campo inválido".
- [ ] Cada grupo de opções está em `fieldset` com `legend`.
- [ ] Alvo de 44px incluindo o rótulo, com folga entre opções.
- [ ] A tela de sucesso mostra o número de registro e o que acontece depois.
- [ ] Em 360px, nenhum par de campos lado a lado.

## Se sair errado

- **Virou assistente de várias etapas**: peça "página única com seções; sem etapas, sem
  barra de progresso".
- **Rótulo flutuante que sobe ao focar**: peça "rótulo estático acima do campo, sempre
  visível, nunca dentro do campo".
- **O erro apagou as respostas**: é reprovação dura. Peça a renderização de novo,
  explicitando "no estado de erro, todos os campos válidos permanecem preenchidos".
- **O consentimento virou uma linha miúda no fim**: peça "seção própria, borda mais
  forte, texto em corpo normal, caixa desmarcada".
- **Os grupos de opções ficaram apertados**: use Tweaks para aumentar o espaçamento
  vertical até 44px por opção — não gasta token.
