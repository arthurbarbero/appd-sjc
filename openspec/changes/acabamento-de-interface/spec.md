# Spec: acabamento de interface

- ID: SPEC-20260820-acabamento-de-interface
- Proposal: [`proposal.md`](proposal.md) — aprovado pelo dono em 2026-08-20
- Inventário de origem:
  [`docs/revisoes/revisao-dono-2026-08-20.md`](../../../docs/revisoes/revisao-dono-2026-08-20.md)
- Fases 1 a 3. **A Fase 4 (crachá impresso) saiu desta change** — ver "Fora de escopo".

## Objetivo

Fechar os 26 apontamentos da revisão do dono de 20/08 sem tratá-los como 26 problemas.
A maior parte deles é **uma** regra de largura mal escopada reaparecendo em sete telas;
três são defeito de comportamento; o resto é conteúdo e forma de campo, tela por tela.

Ao fim, três coisas precisam ser verdade: o conteúdo ocupa a largura do bloco em vez de
metade da tela, a navegação da área não move a página sozinha, e nenhuma tela sinaliza
erro só por cor.

## Requisitos

### Sistema de largura (REQ-1 a REQ-6)

O defeito de origem: `app/assets/css/base.css:50` aplica `max-width: var(--medida)` — com
`--medida: 68ch` (`tokens.css:69`) — a **todo** `p` do site, dentro de um container de
1120px (`app/layouts/default.vue:142`).

- **REQ-1** — A medida de leitura deixa de ser aplicada por seletor de elemento. Nenhuma
  regra do site limita a largura de `p` pelo simples fato de ser `p`.
- **REQ-2** — A medida passa a ser aplicada por um portador explícito de texto corrido
  (classe ou container nomeado). Onde ela vale: texto corrido de página institucional,
  política e conteúdo longo. **Onde não vale**: campo de formulário e sua dica, cartão,
  célula de grade, coluna já restrita por container, e qualquer bloco cuja largura já foi
  decidida pelo pai.
- **REQ-3** — Existe um token único de largura de bloco, e todas as telas o usam. Nenhuma
  página define largura de conteúdo por conta própria.
- **REQ-4** — Blocos de conteúdo são centralizados no container em todas as larguras de
  viewport. Ao estreitar a janela, o conteúdo acompanha o bloco em vez de escapar para a
  esquerda.
- **REQ-5** — O formulário de atendimento e as telas de `/area` usam a largura de bloco de
  REQ-3, e não uma largura menor herdada de outra regra.
- **REQ-6** — A medida de leitura continua existindo como valor. Este requisito **não**
  autoriza texto corrido com linha longa demais: onde REQ-2 diz que a medida vale, ela
  vale inteira.

### Defeitos (REQ-7 a REQ-10)

- **REQ-7** — A foto enviada no cadastro aparece no cartão de identificação de `/area`,
  não só em `/area/cracha`.
- **REQ-8** — Trocar de seção dentro da área do associado **não altera a posição de
  rolagem por efeito colateral**. A pessoa vê o início da seção que abriu.
- **REQ-9** — Nenhum clique em área neutra da página provoca rolagem. O defeito relatado
  degradou durante a gravação, de "ao trocar de aba" para "a cada clique": a task começa
  por reproduzir e nomear a causa, e só então corrige. Corrigir o sintoma sem a causa
  reprova este requisito.
- **REQ-10** — No recorte da foto, sair do recorte sem confirmar **preserva a imagem
  anterior**. Nenhum caminho de interação resulta em foto em branco.

### Mensagem de erro (REQ-11 a REQ-13)

Hoje cada erro de campo é `<span class="icone" aria-hidden="true">✕</span>` colado ao
texto, repetido em todos os campos de `app/pages/atendimento/inscricao.vue`.

- **REQ-11** — O `✕` sai de todas as mensagens de erro de campo.
- **REQ-12** — A mensagem passa a ser só a frase, em vermelho, em corpo menor que o do
  campo — **e nunca abaixo de `--texto-rotulo` (15px), que é o piso duro do site**.
- **REQ-13** — A remoção do ícone não pode deixar o erro sinalizado só por cor
  (WCAG 1.4.1). O meio não-cromático passa a ser **a própria frase**, que precisa dizer o
  que está errado — não "Campo inválido" —, permanecer ligada ao campo por
  `aria-describedby` e ser anunciada em região `aria-live`. O resumo de erros no topo do
  formulário segue existindo.

### Cabeçalho e navegação (REQ-14 a REQ-20) — Fase 2, depende de design

- **REQ-14** — Em largura intermediária, o texto "APPD / São José dos Campos" sai do
  cabeçalho, fica só o símbolo, e os seis links do menu ocupam a mesma linha.
- **REQ-15** — Em largura estreita, o botão que hoje mostra a palavra "Menu" passa a ser
  ícone hambúrguer.
- **REQ-16** — Acionar o hambúrguer abre um painel que **desliza da direita para a
  esquerda e se sobrepõe ao conteúdo**. A página não é empurrada para baixo, e a posição
  de rolagem não muda ao abrir nem ao fechar.
- **REQ-17** — O painel contém os mesmos links do menu, na mesma ordem, mais o link de
  conta que hoje fica separado por divisória.
- **REQ-18** — A área do associado troca a fileira de abas por **menu à esquerda e
  conteúdo à direita**, e a troca de seção não recarrega a página.
- **REQ-19** — O cabeçalho próprio da área fica mínimo — foto e link —, sem repetir nome
  e número de registro (que saem por REQ-31).
- **REQ-20** — REQ-16 e REQ-18 são navegação, e por isso os critérios de teclado e foco
  desta spec são **bloqueantes desde a implementação**, não passada final. É a armadilha
  que deixou a T13 de `consentimento-e-privacidade` aberta até hoje.

### Conteúdo e campos (REQ-21 a REQ-41) — Fase 3

**Início**

- **REQ-21** — Saem as duas legendas sob os botões do herói ("Cadastro gratuito…" e
  "Doação de equipamento, fralda ou alimento").
- **REQ-22** — Saem as linhas de apoio das seções "Atendimento" e "Projetos". Ficam
  título e cartões.

**Cadastro de atendimento**

- **REQ-23** — Sai o bloco "Antes de começar" inteiro, e o conteúdo sobe.
- **REQ-24** — O campo 5 (endereço) deixa de ser `textarea` e passa a ser caixa de uma
  linha. Rótulo, ordem e obrigatoriedade não mudam.
- **REQ-25** — O formulário ganha os campos **20 (Estado)** e **21 (País)**, na ordem, logo
  após Município. Os 15 campos originais e o 16 (CEP) permanecem intactos —
  [ver o contrato de dados](#contrato-de-dados).
- **REQ-26** — Estado é preenchido automaticamente pela consulta de CEP, que já devolve a
  UF junto de rua, bairro e município, e continua editável. CEP não encontrado ou serviço
  fora do ar não bloqueia, na mesma regra que já vale para os outros três.
- **REQ-27** — País nasce com "Brasil" e é editável.
- **REQ-28** — O campo CPF ganha máscara, no mesmo padrão de telefone e data — que o dono
  aprovou no vídeo.
- **REQ-29** — No recorte da foto, o zoom é operável por toque, além do controle atual.
  A tela estreita é o caso citado.
- **REQ-30** — O campo 7 (número) **não é tocado por esta change** — decisão do dono em
  2026-08-20.

**Área do associado**

- **REQ-31** — Sai o cartão que repete nome e número de registro em `/area`.
- **REQ-32** — Em `/area/dados`, o parágrafo que explica por que e-mail, CPF e nascimento
  não mudam é substituído pelos **três campos preenchidos e desabilitados**. Sai a
  explicação de por que foi feito assim.
- **REQ-33** — Em `/area/dados`, as opções de "É WhatsApp" ficam lado a lado.
- **REQ-34** — "Salvar alterações" fica desabilitado enquanto nada mudou no formulário.
- **REQ-35** — Ao salvar, a página volta ao topo e a confirmação recebe foco, no padrão
  de resumo que a tela já usa.
- **REQ-36** — O botão "Sair" usa a paleta do design system. Nenhum azul fora dos tokens.

**Excluir conta**

- **REQ-37** — Sai o parágrafo sobre ficha de atendimento em papel. O aviso "Isto não pode
  ser desfeito" permanece — o dono o leu e aprovou.

**Crachá**

- **REQ-38** — Saem as duas linhas abaixo dos botões de download: "O arquivo é gerado aqui
  no seu navegador." e "Nada é enviado para fora."

  **Ressalva registrada, decisão do dono**: são a única declaração na tela de que a foto
  não sobe para servidor nenhum. A garantia continua verdadeira no código — a geração é
  local — e deixa de ser dita ao titular.

**Sobre e Contato**

- **REQ-39** — Em `/sobre`, a biografia da fundadora e a do presidente têm a mesma
  profundidade. Hoje uma tem um parágrafo e a outra tem quatro. O conteúdo novo é do dono;
  a tela só precisa comportá-lo sem tratar um dos dois como nota de rodapé.
- **REQ-40** — Em `/contato`, quem está autenticado encontra nome, e-mail e telefone já
  preenchidos, e pode editá-los antes de enviar.
- **REQ-41** — O botão "Conferir minha mensagem" passa a dizer o que acontece ao ser
  acionado. **O envio continua fora de escopo** — segue parado na pendência da APPD.

### Acessibilidade (bloqueante — WCAG 2.2 AA)

- **REQ-42** — O painel do menu (REQ-16) é operável só por teclado: abre, percorre,
  fecha por `Esc`, e o foco volta ao botão que o abriu.
- **REQ-43** — Enquanto o painel está aberto, o foco não escapa para o conteúdo atrás.
- **REQ-44** — O menu lateral da área (REQ-18) tem a seção atual marcada por
  `aria-current="page"` **e** por meio visual não-cromático, como já vale hoje.
- **REQ-45** — A troca de seção sem recarregar a página move o foco para o início do
  conteúdo novo e anuncia a mudança. Navegação em página única que não anuncia deixa quem
  usa leitor de tela sem saber que algo mudou.
- **REQ-46** — Os campos desabilitados de REQ-32 continuam legíveis: contraste AA no
  estado desabilitado, ou o estado é obtido por `readonly` em vez de `disabled`.
- **REQ-47** — `prefers-reduced-motion` desliga a animação de deslize do painel.
- **REQ-48** — Alvos de toque ≥44px, foco visível e texto ≥17px continuam valendo em tudo
  que esta change tocar.

## Contrato de dados

Dois campos novos em `usuarios`, com migration versionada:

| Coluna   | Tipo   | Nulo | Origem                                    |
| -------- | ------ | ---- | ----------------------------------------- |
| `estado` | `text` | sim  | campo 20, preenchido pela consulta de CEP |
| `pais`   | `text` | sim  | campo 21, padrão "Brasil" no formulário   |

Anuláveis porque as linhas já existentes não têm o dado, e porque a exclusão de conta
anonimiza as colunas pessoais — o mesmo motivo das outras. `modelo-de-dados` está
arquivada: pelo adendo dela, **coluna nova cabe; tabela nova reabriria a change**, e aqui
não há tabela nova.

`docs/campos-formulario.md` passa a listar os campos 20 e 21 com a data e o dono da
decisão, no mesmo formato do campo 16.

## Fora de escopo (explícito)

- **O crachá impresso.** K1 e K2 saíram desta change em 2026-08-20. A foto do crachá
  físico mostrou que não é diagramação: são cinco campos que o modelo não tem (CRAS,
  Credencial de Transporte, Emissão, Validade, Contato de Emergência), uma identidade
  visual que não está no `DESIGN.md`, e uma colisão com o ADR-019 — a frente do cartão
  real imprime CID e CPF, e a nossa tela promete o contrário. Vira proposal próprio.
- **Projetos** — suspenso pelo dono: "a maioria nem está mais funcionando".
- **Os `[A CONFIRMAR]`** — conteúdo do dono, revisados em bloco.
- **O envio do formulário de contato** — pendência da APPD (qual e-mail recebe).
- **O campo 7 (número)** — REQ-30.
- **A T7 de `consentimento-e-privacidade`** — o componente da caixa de consentimento
  continua sendo dela. Esta change encosta no bloco 7 só pelo formato do erro (REQ-11).
- **Redefinição de senha e painel administrativo** — outra change.

## Premissas e dependências

- **Fase 2 depende de design aprovado no Claude Design** (REQ-14 a REQ-19). É a regra do
  `CLAUDE.md`, e não há exceção aqui: o cabeçalho, o painel deslizante e o menu lateral da
  área são telas.
- Fases 1 e 3 não passam pelo canvas — não criam tela nova, ajustam o que existe.
- A suíte atual (`npm test`, 233 testes; `npm run aceite`, 169 verificações) tem regressão
  de interface e **vai reprovar** em vários pontos. É a intenção. Cada fase atualiza o que
  quebrou e acrescenta o seu.

## Critério de aceite (Gherkin)

### Funcionalidade: A largura do conteúdo

```gherkin
Cenário: Texto corrido respeita a medida de leitura
  Cobre REQ-2, REQ-6
  Dado que uma pessoa abre uma página de conteúdo longo em uma janela de 1280px
  Quando a página termina de carregar
  Então a largura da linha do texto corrido não passa da medida de leitura
  E o bloco está centralizado no container

Cenário: Nenhum parágrafo é estreitado por ser parágrafo
  Cobre REQ-1
  Dado o código-fonte do site
  Quando se procura por regra que limite a largura de "p" por seletor de elemento
  Então nenhuma é encontrada

Cenário: O formulário usa a largura do bloco
  Cobre REQ-5
  Dado que uma pessoa abre o cadastro de atendimento em uma janela de 1280px
  Quando a página termina de carregar
  Então os campos ocupam a largura de bloco definida pelo token único
  E não uma largura menor herdada da medida de leitura

Cenário: Ao estreitar a janela o conteúdo acompanha o bloco
  Cobre REQ-4
  Dado o cadastro de atendimento aberto em 1280px
  Quando a janela é reduzida a 900px
  Então o conteúdo permanece centralizado no container
  E nenhum bloco escapa para a esquerda

Cenário: Todas as telas usam o mesmo token de largura
  Cobre REQ-3
  Dado o código-fonte das páginas
  Quando se procura definição própria de largura de conteúdo por página
  Então nenhuma é encontrada fora do token único
```

### Funcionalidade: Os defeitos relatados

```gherkin
Cenário: A foto enviada aparece no cartão da área
  Cobre REQ-7
  Dado que uma pessoa concluiu o cadastro com foto
  Quando ela abre "/area"
  Então a sua foto aparece no cartão de identificação

Cenário: Trocar de seção não move a página
  Cobre REQ-8
  Dado que uma pessoa está no topo de "/area"
  Quando ela aciona "Meu crachá" no menu da área
  Então a nova seção é exibida a partir do seu início
  E a posição de rolagem não foi alterada por efeito colateral

Cenário: Clique em área neutra não rola a página
  Cobre REQ-9
  Dado que uma pessoa está em qualquer tela de "/area"
  Quando ela clica em uma região sem controle interativo
  Então a posição de rolagem permanece a mesma

Cenário: Sair do recorte sem confirmar preserva a foto
  Cobre REQ-10
  Dado que uma pessoa já tem foto enviada e abre o recorte para trocá-la
  Quando ela sai do recorte sem confirmar
  Então a foto anterior continua exibida
  E nenhum estado da tela mostra imagem em branco
```

### Funcionalidade: A mensagem de erro

```gherkin
Cenário: O erro não tem ícone e continua legível
  Cobre REQ-11, REQ-12
  Dado um campo obrigatório deixado em branco
  Quando a pessoa tenta enviar o formulário
  Então a mensagem de erro aparece sem o caractere "✕"
  E o corpo do texto é menor que o do campo e não menor que 15px

Cenário: O erro não é sinalizado só por cor
  Cobre REQ-13
  Dado um campo com erro
  Quando a página é examinada sem distinção de cor
  Então a mensagem em texto diz o que está errado, não "campo inválido"
  E ela está ligada ao campo por aria-describedby
  E foi anunciada em região aria-live
```

### Funcionalidade: Cabeçalho e menu

```gherkin
Cenário: Em largura intermediária o cabeçalho perde o texto da marca
  Cobre REQ-14
  Dado o site aberto em uma janela de largura intermediária
  Quando o cabeçalho é exibido
  Então apenas o símbolo da marca aparece
  E os seis links do menu ocupam a mesma linha

Cenário: O menu estreito abre por cima, vindo da direita
  Cobre REQ-15, REQ-16, REQ-17
  Dado o site aberto em janela estreita
  Quando a pessoa aciona o ícone hambúrguer
  Então um painel desliza da direita e se sobrepõe ao conteúdo
  E a página não é empurrada para baixo
  E a posição de rolagem não muda
  E o painel lista os mesmos links do menu, na mesma ordem

Cenário: O painel é operável só por teclado
  Cobre REQ-42, REQ-43
  Dado o painel fechado e o foco no ícone hambúrguer
  Quando a pessoa aciona por teclado
  Então o painel abre e o foco entra nele
  E o foco não alcança o conteúdo atrás enquanto ele está aberto
  E "Esc" fecha o painel e devolve o foco ao ícone

Cenário: Movimento reduzido desliga o deslize
  Cobre REQ-47
  Dado um sistema com "prefers-reduced-motion" ativo
  Quando o painel é aberto
  Então ele aparece sem animação de deslize
```

### Funcionalidade: A área do associado

```gherkin
Cenário: O menu da área fica à esquerda e o conteúdo à direita
  Cobre REQ-18, REQ-19
  Dado que uma pessoa autenticada abre "/area" em janela larga
  Quando a página termina de carregar
  Então o menu das seções aparece à esquerda e o conteúdo à direita
  E o cabeçalho da área mostra foto e link, sem repetir nome e número

Cenário: Trocar de seção anuncia a mudança
  Cobre REQ-45, REQ-44
  Dado que uma pessoa navega por teclado no menu da área
  Quando ela aciona outra seção
  Então a página não recarrega
  E o foco vai para o início do conteúdo novo
  E a mudança é anunciada
  E a seção atual está marcada por aria-current e por meio não-cromático

Cenário: O cartão repetido saiu
  Cobre REQ-31
  Dado "/area" aberta
  Quando a página é exibida
  Então não há cartão repetindo nome e número de registro

Cenário: Os três campos travados substituem a explicação
  Cobre REQ-32, REQ-46
  Dado "/area/dados" aberta
  Quando a seção "Quem é você" é exibida
  Então e-mail, CPF e data de nascimento aparecem como campos preenchidos e não editáveis
  E não há parágrafo explicando por que eles não mudam
  E o contraste do texto neles atende AA

Cenário: Salvar só fica disponível com alteração
  Cobre REQ-34, REQ-35
  Dado "/area/dados" recém-aberta, sem nenhuma alteração
  Então "Salvar alterações" está desabilitado
  Quando a pessoa altera um campo e salva
  Então a página volta ao topo
  E a confirmação recebe o foco

Cenário: O botão Sair usa a paleta do site
  Cobre REQ-36
  Dado qualquer tela de "/area"
  Quando o botão "Sair" é exibido
  Então a sua cor vem dos tokens do design system
```

### Funcionalidade: Conteúdo que sai e conteúdo que entra

```gherkin
Cenário: A home perde as legendas e as linhas de apoio
  Cobre REQ-21, REQ-22
  Dado a página inicial aberta
  Quando ela é exibida
  Então não há legenda sob os botões do herói
  E as seções "Atendimento" e "Projetos" mostram título e cartões, sem linha de apoio

Cenário: O cadastro perde o bloco de abertura
  Cobre REQ-23
  Dado o cadastro de atendimento aberto
  Quando ele é exibido
  Então não há bloco "Antes de começar"
  E o primeiro grupo de campos aparece logo abaixo do título

Cenário: A tela de exclusão perde o parágrafo da ficha em papel
  Cobre REQ-37
  Dado "/area/excluir" aberta
  Quando ela é exibida
  Então não há parágrafo sobre ficha de atendimento em papel
  E o aviso "Isto não pode ser desfeito" continua presente

Cenário: O crachá perde as duas linhas
  Cobre REQ-38
  Dado "/area/cracha" aberta
  Quando ela é exibida
  Então não há a linha "O arquivo é gerado aqui no seu navegador."
  E não há a linha "Nada é enviado para fora."

Cenário: As duas biografias têm a mesma profundidade
  Cobre REQ-39
  Dado "/sobre" aberta
  Quando a seção "Quem começou e quem conduz" é exibida
  Então a fundadora e o presidente têm biografias de profundidade equivalente

Cenário: Contato pré-preenchido para quem está autenticado
  Cobre REQ-40
  Dado que uma pessoa autenticada abre "/contato"
  Quando o formulário é exibido
  Então nome, e-mail e telefone aparecem preenchidos
  E ela pode editá-los

Cenário: Quem não está autenticado vê o formulário vazio
  Cobre REQ-40
  Dado que uma pessoa não autenticada abre "/contato"
  Quando o formulário é exibido
  Então nenhum campo vem preenchido
```

### Funcionalidade: Os campos novos do endereço

```gherkin
Cenário: Estado vem preenchido pela consulta de CEP
  Cobre REQ-25, REQ-26
  Dado o cadastro de atendimento aberto
  Quando a pessoa informa um CEP encontrado
  Então rua, bairro, município e estado são preenchidos
  E todos continuam editáveis

Cenário: CEP fora do ar não bloqueia o estado
  Cobre REQ-26
  Dado que a consulta de CEP falha
  Quando a pessoa continua o preenchimento
  Então o campo de estado permanece editável e vazio
  E o envio não é impedido por causa disso

Cenário: País nasce preenchido
  Cobre REQ-27
  Dado o cadastro de atendimento aberto
  Quando o grupo de endereço é exibido
  Então o campo País mostra "Brasil"
  E ele é editável

Cenário: Os campos originais não mudaram
  Cobre REQ-25, REQ-30
  Dado o formulário de atendimento
  Quando os seus campos são comparados com docs/campos-formulario.md
  Então os 15 originais mantêm rótulo, ordem e obrigatoriedade
  E o campo 7 (número) não teve validação nem dica alteradas
  E os campos 20 e 21 aparecem após o município

Cenário: As colunas novas gravam
  Cobre REQ-25
  Dado um cadastro enviado com estado e país preenchidos
  Quando a linha é lida no banco
  Então "estado" e "pais" contêm os valores informados
```

## Rastreabilidade

| Item do vídeo            | Requisito             | Fase |
| ------------------------ | --------------------- | ---- |
| T1, C2, C3, P2, `/sobre` | REQ-1 a REQ-6         | 1    |
| T2                       | REQ-3, REQ-4          | 1    |
| B1                       | REQ-7                 | 1    |
| B2                       | REQ-8, REQ-9          | 1    |
| B3                       | REQ-10                | 1    |
| T5                       | REQ-11 a REQ-13       | 1    |
| T3                       | REQ-14                | 2    |
| T4                       | REQ-15 a REQ-17       | 2    |
| A1                       | REQ-18, REQ-19        | 2    |
| H1, H2, H3               | REQ-21, REQ-22        | 3    |
| C1                       | REQ-23                | 3    |
| C4                       | REQ-24                | 3    |
| C6                       | REQ-25 a REQ-27       | 3    |
| C7                       | REQ-28                | 3    |
| C8                       | REQ-29                | 3    |
| C5                       | REQ-30 (sem ação)     | —    |
| A2                       | REQ-31                | 3    |
| A3                       | REQ-32                | 3    |
| A4                       | REQ-33                | 3    |
| A5                       | REQ-34, REQ-35        | 3    |
| A6                       | REQ-36                | 3    |
| E1                       | REQ-37                | 3    |
| K4                       | REQ-38                | 3    |
| P3                       | REQ-39                | 3    |
| P4                       | REQ-40                | 3    |
| P5 (só o rótulo)         | REQ-41                | 3    |
| K1, K2                   | fora — change própria | —    |
| P1                       | fora                  | —    |
