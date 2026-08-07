# Spec: Área do associado

- ID: SPEC-area-do-associado Deriva de: PROP-20260805-area-do-associado
- Status: rascunho (aguarda gate do revisor-spec e aprovação do dono)
- Dono do conteúdo: Arthur Barbero · Aprovador da spec: Arthur Barbero
- Versão: v3 · Data: 2026-08-07
- **Fonte da verdade das tabelas**: [`modelo-de-dados`](../modelo-de-dados/spec.md)

> **v3 (2026-08-07)** — três correções vindas da sessão de uso do dono, não de refino de
> escrivaninha. O bloco do crachá troca a linha de texto sobre a verificação por um **QR
> Code** (REQ-12). "Meus dados" passa a exibir o **CEP**, campo que entrou no formulário
> depois desta spec ser escrita e que ninguém veio acrescentar aqui (REQ-15). E ficou
> explícito o que a pessoa **não** altera sozinha, com o motivo de cada exclusão
> (REQ-15a) — o e-mail em especial, que parece um campo comum e não é.

> **v2 (2026-08-06)** — reescrita contra o contrato de dados, depois do gate. Esta change
> passa a ser **dona única** de `/area`, `/area/dados`, `/area/inscricoes` e
> `/area/excluir` ([ADR-013](../../../docs/adr/adr-013-fronteira-de-rotas-entre-changes.md)),
> e perde `/area/cracha`, que é de `cracha-do-associado`. A exclusão vira **uma página com
> modal**, por decisão do dono. Ganha a **edição da inscrição**
> ([ADR-014](../../../docs/adr/adr-014-inscricao-como-registro-de-interesse.md)) e um
> vocabulário de status com um valor só.

> **Todos os dados de exemplo desta spec são fictícios.** "Maria Aparecida da Silva" e
> `APPD-2026-00042` são invenção para teste. Nenhum dado de pessoa real entra em spec, seed,
> fixture ou repo.

## Objetivo

Dar ao associado autenticado uma porta de volta com quatro assuntos — inscrições, crachá,
dados e exclusão de conta —, onde cada bloco diz o estado atual em uma linha, oferece uma ação
nomeada e nunca exibe dado de saúde.

## Glossário (termos que não podem ter dupla leitura)

| Termo            | Definição desta spec                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| Painel           | A rota `/area`, com os quatro blocos e a identificação no topo.            |
| Estado vazio     | Bloco sem conteúdo que oferece o próximo passo nomeado, não só a ausência. |
| Confirmação      | Modal na própria página `/area/excluir`. Não há palavra a digitar.         |
| Excluir conta    | Apagamento definitivo dos dados listados no REQ-26, sem desfazer.          |
| Dado sensível    | Campo 12 do formulário (tipo de deficiência), Art. 11 da LGPD.             |
| Prévia do crachá | Miniatura de leitura dentro de `/area`; a tela do crachá é `/area/cracha`. |

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
- **REQ-9**: O status DEVE ser apresentado por ícone **e** texto, nunca só por cor. Na V1 há
  **um único valor possível**: `Interesse registrado` (`formulario-atendimento` REQ-43).

  > **Contradição D do gate.** A v1 consumia três valores — `Na fila`, `Em atendimento`,
  > `Encerrada` — e o caminho feliz descrevia "duas inscrições com status Na fila e Em
  > atendimento". Só que nenhuma rota da V1 sabia produzir os outros dois: era cenário que
  > só passa com fixture, nunca com o sistema. O ADR-014 resolveu na raiz — a APPD não opera
  > fila nem matrícula, então o vocabulário descrevia um processo inexistente.

- **REQ-10**: Sem nenhuma inscrição, o bloco DEVE apresentar estado vazio que oferece o
  próximo passo: título "Você ainda não pediu atendimento", uma linha explicando que o cadastro
  é gratuito e que o contato vem por telefone, botão primário "Fazer meu Cadastro de
  Atendimento" e a alternativa humana com o telefone da associação. É proibido usar ilustração
  de caixa vazia ou texto que apenas informa a ausência.
- **REQ-11**: A pessoa NÃO DEVE poder alterar o status da inscrição.
- **REQ-11a**: A pessoa **DEVE poder editar a própria inscrição** em `/area/inscricoes`:
  quais deficiências, quais tipos de atendimento e quais dias (campos 12 a 14), mais o
  campo de especificação do `Outro`. Requisito novo do ADR-014 — as seis changes da v1
  assumiam inscrição escrita uma vez e nunca mais tocada, o que deixava a pessoa presa a um
  dado errado sem canal de correção.
- **REQ-11b**: A edição DEVE usar **o mesmo schema Zod** do formulário de inscrição, com as
  mesmas mensagens, e atualizar `atualizado_em`. Não há histórico de versões na V1 — dívida
  consciente registrada no ADR-014.
- **REQ-11c**: Há **no máximo uma inscrição por pessoa** (`modelo-de-dados` REQ-15). A tela
  é de edição de um registro, não de lista com vários itens; o plural do REQ-8 vale para os
  interesses dentro dela, não para inscrições.

### Bloco "Meu crachá"

> **`/area/cracha` não é desta change** (ADR-013, bloqueio B20): a tela inteira, incluindo o
> envio da foto, é de `cracha-do-associado`. O que fica aqui é o **bloco do painel** que
> leva até lá. Os REQ-12 a REQ-14 abaixo descrevem só esse bloco, não a tela de destino.

- **REQ-12**: O bloco do painel DEVE exibir prévia com foto, nome, `numero_registro` e situação,
  mais o **QR Code** do endereço público de verificação, a **URL escrita por extenso** ao lado
  dele, e a informação de que a página mostra apenas nome, número e situação.

  > **v3.** Antes era uma linha de texto com o caminho entre `<code>`, seguida da confissão
  > "esta tela ainda não foi construída" — que o dono mandou tirar, com razão: uma pendência
  > minha não é informação para quem usa. O QR é o mesmo que vai no verso do crachá
  > (`cracha-do-associado` REQ-21), e vê-lo aqui é como a pessoa confere que o crachá dela
  > funciona antes de precisar dele.
  >
  > **A URL por extenso é obrigatória junto do código**, não alternativa: quem confere pode
  > não ter câmera, e um QR sozinho exclui exatamente quem está do outro lado do balcão.
  >
  > **Ressalva honesta**: `/verificar/<numero>` ainda não existe — é a Fatia 5 de
  > `cracha-do-associado`, travada pela T0.4. Até ela subir, o código leva a um 404. Isso
  > está em `openspec/ESTADO.md` e **não** foi escondido da spec.

- **REQ-13**: A prévia NÃO DEVE exibir tipo de deficiência, independentemente do opt-in da
  change `cracha-do-associado` — o opt-in vale para o crachá impresso, não para esta tela.
- **REQ-14**: Sem foto, o bloco DEVE mostrar um espaço reservado com a palavra "Sem foto",
  explicar em uma linha que o crachá precisa de foto para ser impresso e oferecer "Enviar minha
  foto". O restante do painel continua funcionando; a falta de foto não bloqueia nada além da
  impressão.

### Bloco "Meus dados"

- **REQ-15**: O bloco DEVE exibir nome, data de nascimento, e-mail, telefone e endereço
  **completo, com CEP**, cada um com rótulo visível acima do valor, e a ação "Alterar meus
  dados".

  > **v3.** O CEP entrou no formulário de atendimento em 2026-08-06 e **ninguém veio
  > acrescentá-lo aqui** — o dado era gravado, era devolvido pela API e não aparecia na
  > tela. É o defeito típico de campo que nasce fora de change: some no caminho entre o
  > banco e o olho de quem lê.

- **REQ-15a**: A alteração DEVE cobrir nome, telefone, marcação de WhatsApp e endereço
  completo, e **NÃO DEVE** oferecer e-mail, CPF nem data de nascimento. Cada ausência DEVE
  estar escrita na tela, com o caminho para resolver.

  > O e-mail não é um campo comum: ele é a chave do login **e** entra no sal da derivação
  > da senha no navegador ([ADR-005](../../../docs/adr/adr-005-parametros-do-scrypt.md)).
  > Trocá-lo sem refazer a derivação transforma a senha certa em senha errada, sem aviso e
  > sem volta — a pessoa perde a conta por ter corrigido um typo. Trocar e-mail é um fluxo
  > de reautenticação, e vira tarefa própria quando alguém precisar.
  >
  > CPF e data de nascimento identificam a pessoa perante a associação; corrigi-los pela
  > internet, sem conferência, é o caminho por onde uma conta passa a ser de outra pessoa.

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
- **REQ-22**: A confirmação DEVE ser **um modal**, aberto pelo botão de excluir na própria
  página `/area/excluir`. Uma página, um modal, e pronto — decisão do dono em 2026-08-06
  (ADR-013), substituindo tanto as três telas de `consentimento-e-privacidade` quanto as duas
  caixas de seleção decididas na Fase 2.
- **REQ-22a**: O modal DEVE cumprir, como critério **bloqueante**:
  - foco preso dentro dele enquanto estiver aberto;
  - `Esc` fecha sem excluir;
  - ao abrir, o foco vai para o texto ou para o botão de cancelar — **nunca** para o de
    confirmar;
  - ao fechar, o foco volta para o botão que o abriu;
  - `role="dialog"`, `aria-modal="true"` e rótulo acessível ligado ao título;
  - `prefers-reduced-motion` respeitado na abertura.
- **REQ-23**: É **proibido** exigir digitação de palavra de confirmação (por exemplo, teclar
  "EXCLUIR"). Digitar palavra em caixa alta é barreira real para quem tem dificuldade motora ou
  intelectual, e este site atende exatamente essas pessoas.
- **REQ-24**: O botão que confirma dentro do modal DEVE dizer o **verbo da ação** —
  "Excluir" —, nunca "OK", "Sim" nem "Confirmar", e DEVE ser contornado, nunca preenchido.

  > **v3.** A v2 exigia o rótulo longo "Excluir minha conta". Na prática ele não cabia ao
  > lado de "Cancelar" nos 400 px úteis do modal, e os dois botões empilhavam — o que faz
  > um par de escolhas parecer uma lista de passos, exatamente o oposto do que um modal de
  > confirmação precisa comunicar. O dono viu e mandou encurtar.
  >
  > O que o requisito protege continua de pé: o botão diz **o que acontece**, não uma
  > partícula vazia. "OK" e "Confirmar" seguem proibidos porque não dizem nada — quem
  > chegou ali distraído lê "OK" e clica. "Excluir" não deixa dúvida, e o objeto da ação
  > está no título ("Tem certeza?") e no parágrafo logo acima.

- **REQ-24a**: Os dois botões do modal DEVEM ficar **na mesma linha** sempre que couberem,
  com a saída segura à esquerda. Abaixo da largura em que couberem, empilham — e aí o alvo
  de 44 px vence o alinhamento, nunca o contrário.
- **REQ-25**: A ação preenchida do modal DEVE ser **"Cancelar"**. A saída segura é a mais
  fácil de acertar.
- **REQ-26**: O que a exclusão apaga está em [`modelo-de-dados`](../modelo-de-dados/spec.md)
  **REQ-28**, escrito uma vez só e válido para o projeto inteiro. Esta change **executa** esse
  contrato e encerra a sessão.

  > **Bloqueio B23 do gate.** Havia três listas divergentes do que a exclusão apaga: esta não
  > mencionava preservar o `numero_registro`, `cadastro-e-login` exigia preservá-lo, e
  > `consentimento-e-privacidade` mandava apagar "conta e crachá". Três contratos para os
  > mesmos dados.

  O que a associação precisa manter por obrigação legal, e por quanto tempo, segue
  `[A CONFIRMAR]` (PB-1 de `consentimento-e-privacidade`) e **não pode ser inventado** no
  código nem no texto da tela.

- **REQ-27**: Após a exclusão, `/verificar/<numero_registro>` responde **HTTP 200**, mostra o
  número e a situação `inativo`, e **não mostra nome** — o nome deixou de existir. O
  `numero_registro` é preservado e nunca reutilizado, para que um crachá antigo não passe a
  identificar outra pessoa (`modelo-de-dados` REQ-29, `cracha-do-associado` REQ-28a). O
  `[A CONFIRMAR]` da v1 está **fechado**.
- **REQ-28**: A página DEVE oferecer a alternativa humana com o telefone da associação.

### Estados de tela

- **REQ-29**: O estado "carregando" DEVE ocupar exatamente o mesmo espaço do conteúdo final,
  para que a página não pule, com o texto "Carregando suas informações…" em região
  `aria-live="polite"`. É proibida animação em laço infinito ou pulsante.
- **REQ-30**: Falha ao carregar um bloco DEVE degradar apenas aquele bloco, com mensagem que
  diz o que fazer, mantendo os demais utilizáveis.

### Acessibilidade (bloqueante)

- **REQ-31**: Todas as telas DEVEM atender WCAG 2.2 AA, verificado por axe sem violação de
  **nível A ou AA** — a régua única do projeto, medida pela conformidade WCAG e não pela
  severidade que o axe atribui: um `h1` por tela, hierarquia de headings sem pulo,
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
topo, a inscrição com o status "Interesse registrado", a prévia do crachá com foto, os
dados de contato e, no fim, o bloco de excluir conta com borda vermelha e botão contornado.
Clica em "Ver minhas inscrições" e confere a data do pedido. Depois, em "Alterar meus dados",
corrige o telefone e salva.

**Erros e bordas.**

- Sem sessão: redireciona ao login preservando o destino; nada do associado é renderizado.
- Sem nenhuma inscrição: estado vazio com o botão do cadastro de atendimento e o telefone.
- Sem foto: prévia com espaço reservado, explicação e "Enviar minha foto"; o resto funciona.
- Carregando: espaço reservado do mesmo tamanho, com anúncio em `aria-live`.
- Bloco de inscrições falha e os outros carregam: só ele mostra o erro e o que fazer.
- Modal de exclusão aberto e fechado por Esc: nada é apagado e o foco volta ao botão.
- Exclusão confirmada: dados do REQ-26 apagados, sessão encerrada, e a pessoa vai para uma
  página pública de confirmação que não exige login.
- Tentativa de reabrir `/area/*` após excluir: comporta-se como sessão inexistente.

## Fora de escopo

Repetido de propósito: autenticação, sessão e guarda de rota (`cadastro-e-login`); as tabelas
(`modelo-de-dados`); consentimento do Art. 11, política de privacidade e "Seus direitos"
(`consentimento-e-privacidade`); `/area/cracha` inteira, incluindo o envio da foto, a geração,
a exportação e `/verificar/<numero>` (`cracha-do-associado`); a **criação** da inscrição e os
15+3 campos (`formulario-atendimento`); mudança de status e moderação (`painel-admin`);
exportação de dados em arquivo; notificação por e-mail ou SMS.

**Mudou na v2:** a **edição** da inscrição entrou no escopo (REQ-11a, ADR-014) — só a criação
continua sendo de `formulario-atendimento`. E o **campo 12** passa a ser editável aqui, porque
é justamente o dado que a pessoa precisa corrigir; o que continua proibido é **exibi-lo** em
qualquer tela que não seja a de edição (REQ-5).

## Premissas e dependências

- **`modelo-de-dados` fechada** — dependência dura; esta change não cria coluna.
- Sessão e **guarda de rota de `/area/*`** entregues por `cadastro-e-login`, que também emite
  o `numero_registro`. Esta change não implementa verificação de sessão própria.
- Inscrição criada e schema Zod compartilhado entregues por `formulario-atendimento`.
- Foto e interface `ArmazenamentoFoto` entregues por `cracha-do-associado`.
- Texto da política e da página "Seus direitos" entregues por `consentimento-e-privacidade`.
- Design das cinco telas aprovado no Claude Design antes de qualquer HTML.
- Resposta `[A CONFIRMAR]` da APPD e do jurídico sobre retenção pós-exclusão.

---

## Critérios de aceite (Gherkin)

Todos os dados abaixo são fictícios.

```gherkin
Funcionalidade: Painel da área do associado
  Cobre REQ-1 a REQ-4, REQ-8, REQ-9, REQ-11, REQ-11a, REQ-11b, REQ-11c, REQ-12, REQ-15 e
  REQ-18 da SPEC-area-do-associado

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

  Cenário: A pessoa edita a própria inscrição
    Dado o associado fictício com uma inscrição gravada
    Quando ele abre /area/inscricoes e troca os dias e os tipos de atendimento
    E salva
    Então a linha existente é alterada, e nenhuma linha nova é criada
    E "atualizado_em" passa a ser mais recente que "criado_em"
    E os valores novos aparecem na tela sem recarregar a página

  Cenário: A edição usa o mesmo schema da inscrição
    Dado o associado fictício editando a inscrição
    Quando ele desmarca todos os tipos de atendimento e salva
    Então a alteração é recusada com a mesma mensagem que o formulário daria
    E os valores anteriores continuam gravados no banco
    E nada do que ele digitou na tela é apagado

  Cenário: Pessoa não altera status de inscrição
    Dado o associado fictício com uma inscrição em "Interesse registrado"
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
    Quando são renderizadas /area, /area/dados, /area/inscricoes e /area/excluir
    Então nenhuma delas contém as palavras "Física", "Intelectual ou Neurodivergentes",
      "Sensorial (visão, audição, fala)" ou "Outro" referidas à pessoa
    E o valor não aparece em HTML oculto, atributo data-*, comentário nem JSON embutido
    E nenhuma resposta de API consumida pela área traz o campo

  Cenário: Opt-in do crachá não vaza para a prévia da área
    Dado o associado fictício com o opt-in de tipo de deficiência marcado no crachá
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

  Cenário: A exclusão mora numa página só
    Dado o associado fictício "APPD-2026-00042" em /area
    Quando ele aciona "Excluir minha conta"
    Então o navegador vai para a rota /area/excluir
    E a tela tem h1 "Excluir minha conta"
    E não existe segunda rota de confirmação nem rota de recibo

  Cenário: A página explica o que sai, o que fica e que é irreversível
    Quando o associado fictício abre /area/excluir
    Então existem os blocos "O que é apagado", "O que a associação precisa manter" e "Isto não
      pode ser desfeito"
    E o bloco do que a associação mantém está marcado com [A CONFIRMAR], incluindo o prazo
    E o bloco de irreversibilidade traz ícone e texto, além da cor

  Cenário: O modal confirma, e nunca pede para digitar palavra
    Dado o associado fictício em /area/excluir
    Quando ele aciona "Excluir minha conta"
    Então abre um elemento com role="dialog" e aria-modal="true"
    E o rótulo acessível do modal está ligado ao título dele
    E não existe nenhum campo de texto que peça digitar palavra de confirmação

  Cenário: O foco do modal nunca começa no botão destrutivo
    Dado que o modal de exclusão acabou de abrir
    Então o foco está no texto do modal ou no botão "Cancelar"
    E nunca no botão "Excluir minha conta"
    E o botão que confirma diz o que faz, nunca "OK" nem "Confirmar"

  Cenário: O modal prende o foco e devolve ao fechar
    Dado que o modal de exclusão está aberto
    Quando percorro a página inteira com Tab
    Então o foco nunca sai do modal
    Quando aciono Esc
    Então o modal fecha, nada é apagado, e o foco volta ao botão que o abriu

  Cenário: A ação preenchida é a saída segura
    Dado que o modal de exclusão está aberto
    Então o único botão preenchido é "Cancelar"
    E "Excluir minha conta" é contornado em vermelho, com fundo transparente

  Cenário: Exclusão confirmada executa o contrato do modelo de dados
    Dado o associado fictício "APPD-2026-00042" com inscrição, foto e dois consentimentos
    Quando ele confirma no modal
    Então o efeito é exatamente o do REQ-28 de modelo-de-dados, sem lista própria aqui
    E a sessão é encerrada
    E ele chega a uma confirmação na mesma página, que não exige login

  Cenário: Depois de excluir, a verificação pública responde sem nome
    Dado que o associado fictício "APPD-2026-00042" excluiu a conta
    Quando alguém abre /verificar/APPD-2026-00042
    Então a resposta é HTTP 200
    E mostra o número e a situação "inativo"
    E não contém o nome da pessoa
    E o número nunca é atribuído a outra conta

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

  Cenário: O endereço exibido inclui o CEP
    Dado o associado fictício com CEP 12239-530 gravado
    Quando ele abre /area
    Então o bloco "Meus dados" mostra "CEP 12239-530"
    E a alteração em /area/dados chega com o campo de CEP preenchido com o mesmo valor

  Cenário: A alteração não oferece e-mail, CPF nem data de nascimento
    Quando o associado fictício abre /area/dados
    Então não existe campo editável de e-mail, de CPF nem de data de nascimento
    E a tela explica que os três não são alterados por ali e para onde ir

  Cenário: Requisição que tenta alterar e-mail é recusada
    Dado uma requisição de alteração montada fora da interface, contendo o campo email
    Quando ela é enviada
    Então o servidor recusa com 422 por campo desconhecido
    E o e-mail gravado continua o mesmo

  Cenário: Salvar não sobrescreve a marcação de WhatsApp
    Dado o associado fictício com telefoneWhatsapp igual a "Não"
    Quando ele abre /area/dados, altera só o bairro e salva
    Então o valor gravado de telefoneWhatsapp continua "Não"
```

```gherkin
Funcionalidade: QR Code da verificação pública
  Cobre REQ-12 da SPEC-area-do-associado

  Cenário: O bloco do crachá traz o QR e a URL por extenso
    Quando o associado fictício APPD-2026-00042 abre /area
    Então o bloco "Meu crachá" contém um elemento com role="img" rotulado com a URL
    E a mesma URL aparece escrita por extenso, em texto selecionável
    E a URL termina em "/verificar/APPD-2026-00042"

  Cenário: O QR é desenhado sem JavaScript no aparelho
    Dado um navegador com JavaScript desligado
    Quando ele abre /area
    Então o HTML entregue pelo servidor já contém o SVG do código

  Cenário: O QR não é montado por injeção de marcação
    Quando o código-fonte do componente de QR é inspecionado
    Então não existe v-html, innerHTML nem concatenação de string de marcação

  Cenário: A tela não confessa pendência de construção
    Quando o associado fictício abre /area
    Então não existe nenhum texto dizendo que uma tela ainda não foi construída
```

```gherkin
Funcionalidade: Acessibilidade da área do associado
  Cobre REQ-31 a REQ-34 da SPEC-area-do-associado

  Cenário: Sem violação de acessibilidade automatizável
    Dado os cinco estados: painel completo, sem inscrição, sem foto, carregando e exclusão
    Quando axe é executado em cada um, em 1280 px e em 360 px
    Então não há violação de nível A nem AA
    # Régua única do projeto, na configuração do axe no CI, nunca repetida por change.
    E cada tela tem exatamente um h1 e nenhuma quebra de nível de heading

  Cenário: Percurso completo de exclusão só com teclado
    Dado /area aberta e apenas o teclado disponível
    Quando são usados Tab, Shift+Tab, Enter e Espaço
    Então é possível chegar a /area/excluir, abrir o modal, percorrê-lo sem sair dele,
      e acionar "Cancelar" — tudo sem mouse
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
    E todo alvo interativo tem no mínimo 44 x 44 px, com 8 px de folga entre vizinhos
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

## Definition of Ready — auditoria desta spec

Seção que faltava na v1 e reprovou no gate (bloqueio B19, junto com `cracha-do-associado`):
esta change não se autoauditava e não emitia veredito próprio.

| Item                          | Situação                                                  |
| ----------------------------- | --------------------------------------------------------- |
| Spec sem ambiguidade pendente | **Não** — dois bloqueios abertos, abaixo                  |
| Priorizada                    | Do coordenador; não é decisão desta spec                  |
| Critério de aceite testável   | **Sim** — todo cenário ligado a um REQ, sem órfão         |
| Escopo fechado                | **Sim** — quatro rotas na proposal, quatro nos requisitos |

**Bloqueios, cada um com dono:**

- `[dependência]` `modelo-de-dados`, `cadastro-e-login` (sessão e guarda de rota) e
  `formulario-atendimento` (a inscrição existir) precisam fechar antes. É a change com mais
  dependências do conjunto, e a que menos sofre por esperar. Dono: **Arthur Barbero**.
- `[escopo] R-7` — nenhuma das quatro telas tem design aprovado no Claude Design.
  Dono: **Arthur Barbero**. Bloqueia toda tarefa de tela.
- `[APPD]` O prazo de retenção exibido no bloco "O que a associação precisa manter" segue
  `[A CONFIRMAR]` (PB-1 de `consentimento-e-privacidade`). Não bloqueia a implementação;
  bloqueia a publicação com dado real.

**Resolvidos desde a v1:**

- ~~B22, escopo declarava 4 rotas e os requisitos entregavam 5~~ — `/area/cracha` saiu
  (ADR-013). Agora são quatro dos dois lados.
- ~~B23, três listas divergentes do que a exclusão apaga~~ — uma lista só, em
  `modelo-de-dados` REQ-28.
- ~~B17, listar inscrições sem chave que ligue inscrição a associado~~ — resolvido pelo
  ADR-012: toda inscrição pertence a uma conta.
- ~~B6, `/area/excluir` com três donos~~ — é desta change.
- ~~B20, `/area/cracha` com três donos~~ — é de `cracha-do-associado`.
- ~~Contradição D, status inalcançável na V1~~ — um valor só (ADR-014).
- ~~Dependência não declarada com `cadastro-e-login`~~ — declarada acima.

**Veredito: NÃO-READY para tarefa de tela** (R-7), e **bloqueada por três dependências**.
É a última change da fila, por construção.
