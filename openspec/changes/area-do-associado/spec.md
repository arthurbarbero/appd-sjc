# Spec: Área do associado

- ID: SPEC-area-do-associado Deriva de: PROP-20260805-area-do-associado
- Status: rascunho (aguarda gate do revisor-spec e aprovação do dono)
- Dono do conteúdo: Arthur Barbero · Aprovador da spec: Arthur Barbero
- Versão: v1 · Data: 2026-08-05

> **Todos os dados de exemplo desta spec são fictícios.** "Maria Aparecida da Silva" e
> `APPD-2026-00042` são invenção para teste. Nenhum dado de pessoa real entra em spec, seed,
> fixture ou repo.

## Objetivo

Dar ao associado autenticado uma porta de volta com quatro assuntos — inscrições, crachá,
dados e exclusão de conta —, onde cada bloco diz o estado atual em uma linha, oferece uma ação
nomeada e nunca exibe dado de saúde.

## Glossário (termos que não podem ter dupla leitura)

| Termo             | Definição desta spec                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| Painel            | A rota `/area`, com os quatro blocos e a identificação no topo.            |
| Estado vazio      | Bloco sem conteúdo que oferece o próximo passo nomeado, não só a ausência. |
| Dupla confirmação | Duas caixas de seleção distintas, ambas desmarcadas, ambas obrigatórias.   |
| Excluir conta     | Apagamento definitivo dos dados listados no REQ-26, sem desfazer.          |
| Dado sensível     | Campo 12 do formulário (tipo de deficiência), Art. 11 da LGPD.             |
| Prévia do crachá  | Miniatura de leitura dentro de `/area`; a tela do crachá é `/area/cracha`. |

## Requisitos

### Acesso e identificação

- **REQ-1**: Toda rota `/area/*` DEVE exigir sessão válida. Requisição sem sessão é
  redirecionada para o login com o destino preservado, e nenhum dado do associado é
  renderizado no caminho.
- **REQ-2**: O painel DEVE exibir, no topo, o nome completo e o `numero_registro` da pessoa,
  com a linha "Este número é seu e não muda." O número usa `font-variant-numeric: tabular-nums`.
- **REQ-3**: O `numero_registro` DEVE aparecer com o mesmo valor em todos os blocos que o
  citam (identificação, prévia do crachá, URL de verificação).
- **REQ-4**: A navegação da área DEVE marcar o item atual por sublinhado espesso **e**
  `aria-current="page"`, nunca só por cor.

### Regra de dado sensível (a mais dura desta change)

- **REQ-5**: Nenhuma tela de `/area/*` DEVE renderizar o tipo de deficiência da pessoa — nem
  em "Meus dados", nem na prévia do crachá, nem em tela de exclusão, nem em HTML oculto,
  atributo `data-*`, comentário, JSON embutido ou resposta de API consumida pela área.
- **REQ-6**: "Meus dados" DEVE exibir a linha que explica onde a informação sobre deficiência
  está e como consultá-la ou apagá-la (página "Seus direitos" ou telefone da associação), sem
  exibir o valor.
- **REQ-7**: A alteração das respostas do campo 12 NÃO DEVE ser oferecida pela área nesta
  versão; o caminho é o exercício de direito do titular.

### Bloco "Minhas inscrições"

- **REQ-8**: O bloco DEVE listar as inscrições da pessoa, cada uma com tipo de atendimento
  pedido, data do pedido e status.
- **REQ-9**: O status DEVE ser apresentado por ícone **e** texto, com os valores "Na fila",
  "Em atendimento" e "Encerrada". Nunca só por cor.
- **REQ-10**: Sem nenhuma inscrição, o bloco DEVE apresentar estado vazio que oferece o
  próximo passo: título "Você ainda não pediu atendimento", uma linha explicando que o cadastro
  é gratuito e que o contato vem por telefone, botão primário "Fazer meu Cadastro de
  Atendimento" e a alternativa humana com o telefone da associação. É proibido usar ilustração
  de caixa vazia ou texto que apenas informa a ausência.
- **REQ-11**: A pessoa NÃO DEVE poder alterar o status de nenhuma inscrição.

### Bloco "Meu crachá"

- **REQ-12**: O bloco DEVE exibir prévia com foto, nome, `numero_registro` e situação, mais a
  linha que informa o endereço público de verificação e que ele mostra apenas nome, número e
  situação.
- **REQ-13**: A prévia NÃO DEVE exibir tipo de deficiência, independentemente do opt-in da
  change `cracha-do-associado` — o opt-in vale para o crachá impresso, não para esta tela.
- **REQ-14**: Sem foto, o bloco DEVE mostrar um espaço reservado com a palavra "Sem foto",
  explicar em uma linha que o crachá precisa de foto para ser impresso e oferecer "Enviar minha
  foto". O restante do painel continua funcionando; a falta de foto não bloqueia nada além da
  impressão.

### Bloco "Meus dados"

- **REQ-15**: O bloco DEVE exibir nome, data de nascimento, e-mail, telefone e endereço, cada
  um com rótulo visível acima do valor, e a ação "Alterar meus dados".
- **REQ-16**: A alteração DEVE usar o mesmo schema Zod no cliente e no servidor, com erro por
  campo, texto que diz o que fazer, associação por `aria-describedby` e anúncio em `aria-live`.
- **REQ-17**: Erro de validação NÃO DEVE apagar nenhuma resposta já digitada.

### Bloco e página de exclusão de conta

- **REQ-18**: O bloco "Excluir minha conta" DEVE ser visível no painel sem nenhuma interação —
  fora de menu "avançado", fora do rodapé, fora de acordeão —, como último bloco, separado por
  divisória.
- **REQ-19**: O botão de exclusão DEVE ser contornado em vermelho com fundo transparente. É
  proibido qualquer botão destrutivo preenchido nesta change.
- **REQ-20**: A confirmação DEVE acontecer em **página própria** (`/area/excluir`), nunca em
  janela sobreposta ou modal.
- **REQ-21**: A página DEVE trazer, antes dos passos de confirmação, três blocos com títulos
  próprios: "O que é apagado", "O que a associação precisa manter" (com marcação
  `[A CONFIRMAR]` visível enquanto o jurídico não responder, incluindo o prazo) e "Isto não
  pode ser desfeito".
- **REQ-22**: A dupla confirmação DEVE ser feita por **duas caixas de seleção distintas**,
  ambas desmarcadas por padrão, empilhadas e visíveis ao mesmo tempo:
  - passo 1: "Entendi que a exclusão é definitiva e não pode ser desfeita.";
  - passo 2: "Quero apagar minha conta e meus dados."
- **REQ-23**: É **proibido** exigir digitação de palavra de confirmação (por exemplo, teclar
  "EXCLUIR"). Digitar palavra em caixa alta é barreira real para quem tem dificuldade motora ou
  intelectual, e este site atende exatamente essas pessoas. Duas caixas dão a fricção necessária.
- **REQ-24**: O botão "Excluir minha conta agora" DEVE permanecer desabilitado **com o motivo
  escrito ao lado** ("Marque as duas caixas para liberar") até que as duas caixas estejam
  marcadas; e DEVE ser contornado, nunca preenchido.
- **REQ-25**: A ação preenchida — a ação principal da página — DEVE ser **"Cancelar e voltar"**.
  A saída segura é a mais fácil de acertar.
- **REQ-26**: Confirmada a exclusão, o sistema DEVE apagar: credenciais e senha, e-mail,
  telefone, endereço, dados de contato do cuidador, foto do crachá (via
  `ArmazenamentoFoto.apagar`) e o acesso à área; e DEVE encerrar a sessão. O que a associação
  precisa manter por obrigação legal fica pendente de `[A CONFIRMAR]` e não pode ser inventado
  no código.
- **REQ-27**: Após a exclusão, a rota `/verificar/<numero_registro>` daquele número NÃO DEVE
  mais exibir o nome da pessoa. O comportamento exato — deixar de existir ou passar a inativo —
  depende da resposta `[A CONFIRMAR]` e é decidido antes da task de exclusão.
- **REQ-28**: A página DEVE oferecer a alternativa humana com o telefone da associação.

### Estados de tela

- **REQ-29**: O estado "carregando" DEVE ocupar exatamente o mesmo espaço do conteúdo final,
  para que a página não pule, com o texto "Carregando suas informações…" em região
  `aria-live="polite"`. É proibida animação em laço infinito ou pulsante.
- **REQ-30**: Falha ao carregar um bloco DEVE degradar apenas aquele bloco, com mensagem que
  diz o que fazer, mantendo os demais utilizáveis.

### Acessibilidade (bloqueante)

- **REQ-31**: Todas as telas DEVEM atender WCAG 2.2 AA, verificado por axe sem violação de
  severidade `serious` ou `critical`: um `h1` por tela, hierarquia de headings sem pulo,
  contraste AA, foco visível de 3 px com 2 px de folga, ordem de foco igual à ordem visual,
  alvos ≥ 44 px com 8 px de folga, corpo ≥ 17 px (nada abaixo de 15 px),
  `prefers-reduced-motion` respeitado.
- **REQ-32**: Todo estado desabilitado DEVE trazer o motivo em texto, nunca apenas opacidade.
- **REQ-33**: Em 360 px, nenhuma tela DEVE produzir rolagem horizontal.
- **REQ-34**: Todas as telas DEVEM ser operáveis inteiramente por teclado, incluindo o percurso
  completo de exclusão de conta.

### Privacidade e repositório

- **REQ-35**: Nenhum dado de pessoa real DEVE ser versionado. Fixtures e seeds usam apenas dado
  fictício, marcado como fictício no arquivo.

## Comportamento esperado

**Caminho feliz.** A pessoa entra e cai em `/area`. Vê o próprio nome e `APPD-2026-00042` no
topo, duas inscrições com status "Na fila" e "Em atendimento", a prévia do crachá com foto, os
dados de contato e, no fim, o bloco de excluir conta com borda vermelha e botão contornado.
Clica em "Ver minhas inscrições" e confere a data do pedido. Depois, em "Alterar meus dados",
corrige o telefone e salva.

**Erros e bordas.**

- Sem sessão: redireciona ao login preservando o destino; nada do associado é renderizado.
- Sem nenhuma inscrição: estado vazio com o botão do cadastro de atendimento e o telefone.
- Sem foto: prévia com espaço reservado, explicação e "Enviar minha foto"; o resto funciona.
- Carregando: espaço reservado do mesmo tamanho, com anúncio em `aria-live`.
- Bloco de inscrições falha e os outros carregam: só ele mostra o erro e o que fazer.
- Exclusão com uma só caixa marcada: botão continua desabilitado, com o motivo ao lado.
- Exclusão confirmada: dados do REQ-26 apagados, sessão encerrada, e a pessoa vai para uma
  página pública de confirmação que não exige login.
- Tentativa de reabrir `/area/*` após excluir: comporta-se como sessão inexistente.

## Fora de escopo

Repetido de propósito: autenticação e sessão (`cadastro-e-login`); consentimento do Art. 11,
política de privacidade e "Seus direitos" (`consentimento-e-privacidade`); geração, exportação
e verificação do crachá (`cracha-do-associado`); criação e edição de inscrição
(`formulario-atendimento`); mudança de status pela pessoa e moderação (`painel-admin`);
alteração do campo 12 pela área; exportação de dados em arquivo; notificação por e-mail ou SMS.

## Premissas e dependências

- Sessão e tabela de usuários entregues por `cadastro-e-login`.
- Tabela de inscrições e vocabulário de status entregues por `formulario-atendimento`.
- `numero_registro`, foto e interface `ArmazenamentoFoto` entregues por `cracha-do-associado`.
- Texto da política e da página "Seus direitos" entregues por `consentimento-e-privacidade`.
- Design das cinco telas aprovado no Claude Design antes de qualquer HTML.
- Resposta `[A CONFIRMAR]` da APPD e do jurídico sobre retenção pós-exclusão.

---

## Critérios de aceite (Gherkin)

Todos os dados abaixo são fictícios.

```gherkin
Funcionalidade: Painel da área do associado
  Cobre REQ-1 a REQ-4, REQ-8, REQ-9, REQ-12, REQ-15 e REQ-18 da SPEC-area-do-associado

  Cenário: Painel completo
    Dado o associado fictício "Maria Aparecida da Silva", "APPD-2026-00042", com foto no
      crachá e duas inscrições
    Quando ele abre /area autenticado
    Então o topo mostra o nome, o número "APPD-2026-00042" e a linha "Este número é seu e não
      muda."
    E existem os quatro blocos: Minhas inscrições, Meu crachá, Meus dados e Excluir minha conta
    E cada inscrição mostra tipo de atendimento, data do pedido e status com ícone e texto
    E o bloco "Excluir minha conta" está visível sem nenhuma interação prévia
    E o botão de excluir é contornado em vermelho, com fundo transparente

  Cenário: Número aparece igual em todos os blocos
    Dado o painel completo do associado fictício "APPD-2026-00042"
    Quando os blocos são renderizados
    Então o número aparece igual na identificação, na prévia do crachá e na URL de verificação
    E todos usam font-variant-numeric igual a "tabular-nums"

  Cenário: Item atual da navegação marcado por mais que cor
    Dado o associado fictício em /area/inscricoes
    Quando a navegação da área é renderizada
    Então o item "Minhas inscrições" tem aria-current="page"
    E tem sublinhado espesso além da diferença de cor

  Cenário: Acesso sem sessão não vaza nada
    Dado um visitante sem cookie de sessão
    Quando ele abre /area/dados
    Então ele é redirecionado para a tela de login com o destino preservado
    E o HTML entregue não contém nome, número de registro nem qualquer dado do associado

  Cenário: Pessoa não altera status de inscrição
    Dado o associado fictício com uma inscrição em "Na fila"
    Quando ele percorre toda a área
    Então não existe controle que altere o status
    E nenhuma rota da área aceita alteração de status
```

```gherkin
Funcionalidade: Estados vazios e de carregamento
  Cobre REQ-10, REQ-14, REQ-29 e REQ-30 da SPEC-area-do-associado

  Cenário: Sem nenhuma inscrição, o estado vazio oferece o próximo passo
    Dado o associado fictício "APPD-2026-00042" sem nenhuma inscrição
    Quando ele abre /area
    Então o bloco de inscrições mostra o título "Você ainda não pediu atendimento"
    E mostra a linha explicando que o cadastro é gratuito e que o contato vem por telefone
    E mostra o botão primário "Fazer meu Cadastro de Atendimento" apontando para o formulário
    E mostra a alternativa por telefone
    E não há ilustração de caixa vazia nem texto que apenas informe a ausência

  Cenário: Sem foto no crachá, o painel continua funcionando
    Dado o associado fictício "APPD-2026-00042" sem foto
    Quando ele abre /area
    Então a prévia mostra o espaço reservado com o texto "Sem foto"
    E o bloco explica em uma linha que o crachá precisa de foto para ser impresso
    E oferece o botão "Enviar minha foto"
    E os blocos de inscrições, dados e exclusão continuam utilizáveis

  Cenário: Carregando não faz a página pular
    Dado que os dados da área ainda não chegaram
    Quando /area é renderizada
    Então cada bloco ocupa a mesma altura que ocupará com o conteúdo final
    E o texto "Carregando suas informações…" é anunciado em região aria-live="polite"
    E não há animação em laço infinito nem elemento pulsante

  Cenário: Falha em um bloco não derruba os outros
    Dado que a consulta de inscrições falha e as demais respondem
    Quando /area é renderizada
    Então apenas o bloco de inscrições mostra a mensagem de erro com o que fazer
    E os blocos de crachá, dados e exclusão permanecem utilizáveis
```

```gherkin
Funcionalidade: Dado sensível não aparece na área
  Cobre REQ-5, REQ-6, REQ-7 e REQ-13 da SPEC-area-do-associado

  Cenário: Tipo de deficiência não aparece em nenhuma tela
    Dado o associado fictício "APPD-2026-00042" com "Física" respondido no campo 12
    Quando são renderizadas /area, /area/dados, /area/inscricoes, /area/cracha e /area/excluir
    Então nenhuma delas contém as palavras "Física", "Intelectual ou Neurodivergentes",
      "Sensorial (visão, audição, fala)" ou "Outro" referidas à pessoa
    E o valor não aparece em HTML oculto, atributo data-*, comentário nem JSON embutido
    E nenhuma resposta de API consumida pela área traz o campo

  Cenário: Opt-in do crachá não vaza para a prévia da área
    Dado o associado fictício com o opt-in de tipo de deficiência marcado em /area/cracha
    Quando /area é renderizada
    Então a prévia do crachá continua sem nenhuma menção a deficiência

  Cenário: Meus dados explica onde a informação está, sem exibi-la
    Quando o associado fictício abre /area/dados
    Então existe a linha explicando que a informação sobre deficiência não é exibida ali
    E ela indica a página "Seus direitos" e o telefone da associação
    E não há controle para alterar o campo 12 na área
```

```gherkin
Funcionalidade: Excluir minha conta
  Cobre REQ-18 a REQ-28 da SPEC-area-do-associado

  Cenário: Confirmação acontece em página própria, não em modal
    Dado o associado fictício "APPD-2026-00042" em /area
    Quando ele aciona "Excluir minha conta"
    Então o navegador vai para a rota /area/excluir
    E a tela tem h1 "Excluir minha conta"
    E não há janela sobreposta nem elemento com papel "dialog"

  Cenário: A página explica o que sai, o que fica e que é irreversível
    Quando o associado fictício abre /area/excluir
    Então existem os blocos "O que é apagado", "O que a associação precisa manter" e "Isto não
      pode ser desfeito"
    E o bloco do que a associação mantém está marcado com [A CONFIRMAR], incluindo o prazo
    E o bloco de irreversibilidade traz ícone e texto, além da cor

  Cenário: Dupla confirmação por caixas de seleção, nunca por digitação
    Quando o associado fictício abre /area/excluir
    Então existem exatamente duas caixas de seleção, ambas desmarcadas
    E a primeira diz "Entendi que a exclusão é definitiva e não pode ser desfeita."
    E a segunda diz "Quero apagar minha conta e meus dados."
    E não existe nenhum campo de texto que peça digitar palavra de confirmação

  Cenário: Com uma só caixa marcada, o botão continua bloqueado e diz por quê
    Dado o associado fictício em /area/excluir
    Quando ele marca apenas a primeira caixa
    Então o botão "Excluir minha conta agora" continua desabilitado
    E ao lado dele aparece o texto "Marque as duas caixas para liberar"

  Cenário: Com as duas caixas marcadas, o botão libera e continua contornado
    Dado o associado fictício em /area/excluir
    Quando ele marca as duas caixas
    Então o botão "Excluir minha conta agora" fica habilitado
    E ele continua contornado em vermelho, com fundo transparente

  Cenário: A ação preenchida é a saída segura
    Quando o associado fictício abre /area/excluir
    Então o único botão preenchido da página é "Cancelar e voltar"
    E acioná-lo devolve para /area sem apagar nada

  Cenário: Exclusão confirmada apaga os dados e a foto
    Dado o associado fictício "APPD-2026-00042" com foto gravada e as duas caixas marcadas
    Quando ele aciona "Excluir minha conta agora"
    Então credenciais, e-mail, telefone, endereço e contato de cuidador são apagados
    E a foto é apagada pelo método "apagar" de ArmazenamentoFoto
    E a sessão é encerrada
    E ele chega a uma página de confirmação que não exige login

  Cenário: Depois de excluir, a verificação pública não mostra mais o nome
    Dado que o associado fictício "APPD-2026-00042" excluiu a conta
    Quando alguém abre /verificar/APPD-2026-00042
    Então a resposta não contém o nome da pessoa

  Cenário: Depois de excluir, a área não abre
    Dado que o associado fictício excluiu a conta
    Quando ele tenta abrir /area com o cookie antigo
    Então ele é tratado como sessão inexistente e redirecionado ao login

  Cenário: Alternativa humana disponível
    Quando o associado fictício abre /area/excluir
    Então existe o texto que oferece resolver por telefone com a associação
```

```gherkin
Funcionalidade: Alteração de dados de contato
  Cobre REQ-15, REQ-16 e REQ-17 da SPEC-area-do-associado

  Cenário: Erro de validação não apaga o que já foi digitado
    Dado o associado fictício em /area/dados com o formulário preenchido
    Quando ele envia o telefone com um dígito a menos
    Então o erro aparece no campo do telefone, com texto que diz o que fazer
    E o erro é associado ao campo por aria-describedby e anunciado em aria-live
    E os demais campos preenchidos continuam com os valores digitados

  Cenário: Servidor valida com o mesmo schema do cliente
    Dado uma requisição de alteração montada fora da interface, com telefone inválido
    Quando ela é enviada
    Então o servidor recusa com o mesmo erro por campo
    E nenhum dado é gravado
```

```gherkin
Funcionalidade: Acessibilidade da área do associado
  Cobre REQ-31 a REQ-34 da SPEC-area-do-associado

  Cenário: Sem violação de acessibilidade automatizável
    Dado os cinco estados: painel completo, sem inscrição, sem foto, carregando e exclusão
    Quando axe é executado em cada um, em 1280 px e em 360 px
    Então não há violação de severidade "serious" nem "critical"
    E cada tela tem exatamente um h1 e nenhuma quebra de nível de heading

  Cenário: Percurso completo de exclusão só com teclado
    Dado /area aberta e apenas o teclado disponível
    Quando são usados Tab, Shift+Tab, Enter e Espaço
    Então é possível chegar a /area/excluir, marcar as duas caixas, habilitar o botão e
      acionar "Cancelar e voltar"
    E o anel de foco de 3 px com 2 px de folga é visível em todos os elementos focáveis
    E a ordem de foco acompanha a ordem visual

  Cenário: Desabilitado sempre diz o motivo
    Dado qualquer controle desabilitado nas cinco telas
    Quando a tela é inspecionada
    Então existe texto visível explicando o motivo do bloqueio
    E o estado não é comunicado apenas por opacidade

  Cenário: Em 360 px nada estoura horizontalmente
    Dado a largura de viewport de 360 px
    Quando cada uma das cinco telas é renderizada
    Então não há rolagem horizontal
    E todo alvo interativo tem no mínimo 44 x 44 px
```

## Rastreabilidade

| Bloco de requisitos | REQ        | Funcionalidade Gherkin                     |
| ------------------- | ---------- | ------------------------------------------ |
| Acesso e painel     | REQ-1..4   | Painel da área do associado                |
| Dado sensível       | REQ-5..7   | Dado sensível não aparece na área          |
| Inscrições          | REQ-8..11  | Painel e Estados vazios                    |
| Crachá na área      | REQ-12..14 | Painel, Estados vazios, Dado sensível      |
| Meus dados          | REQ-15..17 | Alteração de dados de contato              |
| Exclusão de conta   | REQ-18..28 | Excluir minha conta                        |
| Estados de tela     | REQ-29..30 | Estados vazios e de carregamento           |
| Acessibilidade      | REQ-31..34 | Acessibilidade da área do associado        |
| Privacidade do repo | REQ-35     | coberto por gitleaks no pre-commit e no CI |
