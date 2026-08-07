# Spec — `revisao-de-interface`

- Deriva de: PROP-20260807-revisao-de-interface
- Origem dos requisitos: **sessão de uso do dono em 2026-08-06**, item a item
- Versão: v1 · Data: 2026-08-07 · Status: rascunho

Cada requisito abaixo veio de um achado dele, e o texto guarda **o que ele disse**, não a
minha paráfrase. Onde eu discordo ou vejo consequência, está marcado como nota.

## Grupo A — Cabeçalho e navegação

- **REQ-1** — O cabeçalho DEVE se manter em **uma linha** no desktop e empilhar de forma
  legível no celular. O bloco da conta não pode cair para fora da linha da navegação.

  > Defeito meu, de 2026-08-06: acrescentei o link de conta sem tornar o `nav` um
  > container flex, e ele foi para baixo da lista. Corrigido no mesmo dia; fica escrito
  > porque a regressão é fácil de repetir na próxima adição.

- **REQ-2** — O link da conta DEVE mostrar **"Entrar"** para quem não tem sessão e
  **"Minha área"** para quem tem.

  > Nota sobre o que o dono viu: ele leu "Minha área" sem ter entrado naquela sessão do
  > navegador. O comportamento está **correto** — concluir o cadastro abre a sessão, e o
  > cookie dura 7 dias. Mas a percepção dele importa: "não entrei" e "tenho sessão" são
  > coisas diferentes para quem usa. Se incomodar de novo, a saída é a área dizer desde
  > quando a sessão está aberta, não esconder o link.

- **REQ-3** — Todo o site DEVE ser utilizável em **360 px** sem rolagem horizontal e sem
  sobreposição, incluindo cabeçalho e rodapé.

## Grupo B — Cartões clicáveis (home, atendimento, projetos)

- **REQ-4** — Cartão de serviço e de projeto DEVE ser **clicável por inteiro**, não por um
  link no rodapé do cartão. O alvo é o cartão.
- **REQ-5** — DEVE ter estado de **passagem do ponteiro** e de **foco de teclado**
  visíveis e distintos do estado normal — elevação, borda ou fundo, nunca só a cor do
  texto.
- **REQ-6** — O link continua sendo **um só** por cartão, envolvendo o título, para que o
  leitor de tela anuncie um destino e não dois. Cartão inteiro clicável **não** significa
  dois links para o mesmo lugar.
- **REQ-7** — O padrão DEVE viver em `design-system/base.css` e ser o mesmo nas três
  telas. Três variações parecidas é o começo de três divergências.

## Grupo C — Conteúdo que sai

Tudo o que segue foi escrito por mim na Fase 2 e **não existe no site original**, ou
descreve processo que a APPD não executa.

- **REQ-8** — Home: remover o bloco "Antes de pedir atendimento" com "as vagas são
  chamadas conforme abrem".

  > Este é o resto do ADR-014 que eu não varri. Corrigi o `conteudo.ts` e as specs e
  > **não olhei as telas** — a afirmação sobreviveu onde o visitante lê.

- **REQ-9** — Atendimento: remover o bloco de **"três passos"**.
- **REQ-10** — Atendimento: remover o bloco **"Como funciona"** inteiro.
- **REQ-11** — Atendimento: remover a frase "Todos os atendimentos começam pelo mesmo
  cadastro."
- **REQ-12** — Atendimento: remover "Um cadastro só, para qualquer um dos cinco
  atendimentos. Gratuito."
- **REQ-13** — Sobre nós: remover o bloco **"O que já é público"**.
- **REQ-14** — Atendimento: o bloco **"Procurando um projeto?"** deixa de ser link solto
  e vira cartão clicável, no padrão do REQ-4.

## Grupo D — Sobre nós

- **REQ-15** — A página `/sobre` DEVE conter **tudo o que está no "Sobre nós" do site
  original**. Hoje está incompleta.

  > Pendência de execução: comparar com `docs/inventario-conteudo.md`, que tem a varredura
  > das 15 páginas, e listar o que falta antes de escrever. O dono já autorizou o uso de
  > todo o conteúdo do site atual.

## Grupo E — Contato

- **REQ-16** — Telefone NÃO PODE ser botão grande. DEVE ser **texto legível** com um
  **botão de copiar** ao lado.

  > O dono está certo pelo motivo mais forte do que o estético: no celular, um telefone
  > como botão de bloco ocupa a tela inteira e é fácil de acionar sem querer — e acionar
  > sem querer aqui é **fazer uma ligação**. Copiar é reversível; discar não.

- **REQ-17** — O botão de copiar DEVE confirmar em texto ("Número copiado") em região
  `aria-live`, e ter alternativa quando `navigator.clipboard` não existir: o número
  selecionável.
- **REQ-18** — O formulário de contato **não envia nada hoje**, e a tela DEVE dizer isso
  em vez de fingir que envia.

  > Confirmação ao dono: correto, não envia. Não há destinatário definido
  > (`docs/pendencias-appd.md`, item 4) nem caminho de e-mail de custo zero — é o mesmo
  > R-1 que trava a redefinição de senha. Enquanto isso, a tela oferece telefone e
  > WhatsApp, que funcionam.

## Grupo F — Opções de escolha múltipla

- **REQ-19** — As opções que hoje só existem como texto livre dentro de "Outro" DEVEM
  virar **opções próprias**, incluindo os quatro projetos (Bocha Paralímpica, Oficina Mão
  na Roda, Artesão da Inclusão, Informática Nota 10). "Outro" fica para o que é
  realmente outro.

  > **Isto contraria `docs/campos-formulario.md`**, que trava a lista como réplica fiel do
  > formulário oficial, e contraria o `CLAUDE.md`. É decisão do dono e vale — mas entra em
  > `docs/pendencias-appd.md` como divergência a validar com a associação, porque quem
  > recebe as inscrições construiu o atendimento em cima das perguntas atuais.

## Grupo G — Fluxo do cadastro

- **REQ-20** — Concluir o cadastro DEVE levar a pessoa **logada para `/area`**, com a
  confirmação e o número de registro exibidos lá.

  > O dono relatou tela em branco em `/atendimento/inscricao` depois de enviar, duas
  > vezes. Não reproduzi em build limpo — o ciclo completo passa e mostra a confirmação —,
  > e a primeira vez foi explicada por um build que falhou com `EBUSY`. Como aconteceu de
  > novo, o requisito muda o desenho em vez de insistir na explicação: **a tela
  > intermediária deixa de existir**. Ela só fazia sentido quando o cadastro não gravava
  > nada.

## Grupo H — Rodapé

- **REQ-21** — O rodapé DEVE trazer a logo da APPD, na posição que ficar melhor no
  desenho.

## Critérios de aceite

```gherkin
Cenário: Cabeçalho não quebra em nenhuma largura
  Quando abro qualquer página em 360px e em 1280px
  Então o cabeçalho ocupa uma linha coerente, sem elemento fora do fluxo
  E não há rolagem horizontal

Cenário: Quem não tem sessão vê "Entrar"
  Dado que não tenho cookie de sessão
  Quando abro a home
  Então o cabeçalho mostra "Entrar", e não "Minha área"

Cenário: Cartão de serviço é clicável inteiro
  Dado que estou na home
  Quando clico em qualquer ponto do cartão "Fisioterapia" que não seja texto
  Então vou para "/atendimento/fisioterapia"
  E o cartão tem estado visível de ponteiro e de foco
  E o leitor de tela anuncia um único link no cartão

Cenário: Nenhuma tela afirma que existe fila de vagas
  Quando percorro as 17 páginas públicas
  Então nenhuma contém "fila", "vaga chamada" ou "conforme abrem"

Cenário: Telefone em contato é texto com botão de copiar
  Dado que estou em "/contato" num viewport de 360px
  Então o telefone é texto legível, não botão de bloco
  E existe um botão "Copiar" ao lado, com alvo de 44px
  Quando aciono "Copiar"
  Então uma região aria-live confirma "Número copiado"

Cenário: A tela de contato não finge que envia
  Quando abro "/contato"
  Então existe aviso de que a mensagem ainda não é enviada
  E o telefone e o WhatsApp aparecem como caminho que funciona

Cenário: Concluir o cadastro leva à área logado
  Dado que preencho o cadastro com dados válidos
  Quando envio
  Então sou levado para "/area"
  E vejo a confirmação com o meu número de registro
  E a sessão está aberta
```

## Fora de escopo

Contrato de dado, rotas de servidor, telas de `/area/*`, e a foto opcional no formulário
— que continua pendente e é da change `cracha-do-associado`.
