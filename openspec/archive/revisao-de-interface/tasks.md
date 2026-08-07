# Tasks — `revisao-de-interface`

Ordem sugerida: o que quebra primeiro, o que engana depois, o que é estética por último.

## T1 — O que está quebrado

- [x] **T1.1** — Cabeçalho em uma linha; `nav` vira container flex e o bloco de conta
      empilha no celular em vez de cair para fora (REQ-1, REQ-3). _Feito em 2026-08-07._
- [x] **T1.1b** — **A T1.1 tinha ficado pela metade.** A correção de 2026-08-07 pôs a
      divisória do bloco de conta em `@media (width <= 900px)`, mas o menu sanfonado vira
      coluna em `860px`. Entre 861 e 900 px o bloco recebia `width: 100%` numa navegação
      ainda horizontal e caía para a segunda linha — o mesmo defeito do REQ-1, vivo numa
      faixa estreita. Havia ainda uma segunda declaração do bloco dentro da media query de
      860px que ressuscitava o `border-left` vertical, por vir depois na cascata.
      _Corrigido em 2026-08-07; os dois números agora são o mesmo._
      **Como apareceu, e por que não pela tela**: eu tinha declarado a T1.1 concluída
      olhando o desenho em 1266 px e em 1440 px. Medir as caixas do `ul` e do bloco de
      conta em seis larguras levou um minuto e achou o que a conferência visual não acha —
      porque ninguém redimensiona a janela até 880 px por acaso. É o argumento para a T1.3
      ser medição, e não olhada.

- [x] **T1.2** — Concluir o cadastro leva para `/area` logado, com a confirmação e o
      número exibidos lá; a tela intermediária deixa de existir (REQ-20).
      _Feito em 2026-08-07._
- [x] **T1.3** — Conferir em 360px cada tela pública, procurando rolagem horizontal e
      sobreposição. **Aceite**: os dois primeiros cenários da spec.
      _Feito em 2026-08-07, e virou **medição automática**_: `npm run aceite` mede
      `scrollWidth` contra `clientWidth` em sete larguras (360, 414, 768, 880, 1024, 1280, 1440) em três telas, e confere o cabeçalho numa linha em cada uma. 42 verificações.

## T2 — O que engana quem lê

- [x] **T2.1** — Remover da home o bloco "Antes de pedir atendimento" com a fila de vagas
      (REQ-8), e varrer as **telas** atrás de qualquer outra afirmação de fila.
      **Aceite**: o cenário "Nenhuma tela afirma que existe fila de vagas" — que é teste,
      não conferência visual, justamente porque a conferência visual já falhou uma vez.
      _Feito em 2026-08-07._ A varredura achou a frase em **três** lugares além da home:
      `app/components/AppdOferta.vue` (em todas as cinco páginas de serviço),
      `app/pages/atendimento/index.vue` e uma linha de `shared/conteudo.ts`. O teste está
      em `test/revisao-de-interface.spec.ts` e lê o código-fonte das telas — "fila do SUS"
      continua permitido, porque é outra fila e ela existe.
- [x] **T2.2** — Aviso no formulário de contato de que a mensagem ainda não é enviada,
      com telefone e WhatsApp como caminho que funciona (REQ-18). _Feito em 2026-08-07._
      O aviso aparece **antes** de a pessoa escrever, e o botão passou a se chamar
      "Conferir minha mensagem": escrever tudo para descobrir no fim que não foi a lugar
      nenhum é o pior desenho possível para quem procura ajuda.
- [x] **T2.3** — Remover os blocos inventados: três passos, "Como funciona", as duas
      frases sobre "um cadastro só", e "O que já é público" no Sobre
      (REQ-9 a REQ-13). _Feito em 2026-08-07._ O teste de regressão pegou a segunda
      frase de "um cadastro só", que eu tinha deixado passar no formulário.

## T3 — Interação

- [x] **T3.1** — Padrão de cartão clicável em `design-system/base.css`: área inteira,
      estado de ponteiro e de foco, **um link só** envolvendo o título (REQ-4 a REQ-7).
      _Feito em 2026-08-07._ A área cresce por pseudo-elemento sobre o cartão, e não por um
      segundo link; o foco destaca o **cartão** via `:focus-within`, porque é o cartão que
      é o alvo. Também entrou o utilitário `.so-leitor-de-tela`, que não existia.
- [x] **T3.2** — Aplicar em home, atendimento e projetos, mais o bloco "Procurando um
      projeto?" (REQ-14). _Feito em 2026-08-07._ Um teste conta `gatilho` contra
      `cartao-clicavel` em cada tela: se alguém acrescentar um cartão sem link, ou dois
      links no mesmo cartão, falha.
- [x] **T3.3** — Contato: telefone vira texto com botão de copiar, com confirmação em
      região `aria-live` e alternativa sem `navigator.clipboard` (REQ-16, REQ-17).
      _Feito em 2026-08-07_, no componente `AppdCopiar`. A confirmação vai para uma região
      **fora** do botão — trocar o texto do próprio botão faz o leitor de tela reanunciar o
      controle com o foco nele. Sem área de transferência, o valor é selecionado e a
      mensagem manda teclar Ctrl+C. "Ligar agora" sobrou só em tela de toque.

## T4 — Conteúdo

- [x] **T4.1** — Comparar `/sobre` com o site original usando
      `docs/inventario-conteudo.md`, listar o que falta e completar (REQ-15).
      _Feito em 2026-08-07._ Faltavam três coisas: a origem da fundação (a iniciativa da
      Sra. Maria Claudete), a seção **"Nosso compromisso"** inteira, e o histórico do
      presidente — o acidente de 2007, a lesão medular e a reabilitação no Sarah
      Kubitschek —, que eu tinha omitido por conta própria e o dono já havia mandado
      incluir duas vezes. **Continua fora só o nome dos dois filhos**: a autorização é da
      associação sobre o conteúdo dela e não alcança terceiros.
- [x] **T4.2** — Transformar em opções próprias o que hoje é texto livre em "Outro",
      incluindo os quatro projetos (REQ-19). _Feito em 2026-08-07._
      **Achado no caminho**: o formulário **redeclarava** as três listas de escolha,
      copiadas palavra por palavra ao lado do módulo que já as declarava. Sem corrigir
      isso, acrescentar os projetos não teria mudado nada na tela de cadastro — ela
      ofereceria seis opções e a de correção, dez. Agora as duas importam do mesmo módulo,
      e um teste falha se a cópia voltar.
      **Antes de codar**: registrar em `docs/pendencias-appd.md` que isto **altera as
      perguntas do formulário oficial**, contra o que `docs/campos-formulario.md` trava.
      É decisão do dono e vale; mas quem recebe as inscrições construiu o atendimento em
      cima das perguntas atuais, e precisa saber.
- [x] **T4.3** — Logo da APPD no rodapé (REQ-21). _Feito em 2026-08-07_, com fundo claro
      próprio: a marca tem verde e azul e sumiria no rodapé escuro.

## T5 — Gate

- [x] **T5.1** — `axe` sem violação de nível A ou AA nas telas tocadas. _Feito em
      2026-08-07_: `npm run aceite` roda `@axe-core/playwright` com as etiquetas
      `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` e `wcag22aa` em **dez** telas públicas.
      Zero violação.
- [x] **T5.2** — Percorrer os sete cenários de aceite, um a um, com veredito registrado.
      _Feito em 2026-08-07, de forma automatizada_ — decisão do dono: "não vou analisar a
      mão mesmo não, voce mesmo valida". Está certo: 276 cenários lidos por uma pessoa é
      um gate que nunca acontece.
      O veredito vive em dois lugares que rodam sozinhos:
      `test/revisao-de-interface.spec.ts` (24 checagens no `npm test`, sem navegador) e
      `test/aceite/percurso.mjs` (`npm run aceite`, workerd de verdade). **78 de 78
      verificações passaram** em 2026-08-07.
