# Spec: Site institucional público da APPD-SJC

- ID: SPEC-site-institucional · Deriva de: PROP-20260805-site-institucional
- Status: rascunho (aguarda gate do revisor de spec)
- Dono do conteúdo: Arthur Barbero · Aprovador da spec: Arthur Barbero
- Versão: v1 · Data: 2026-08-05

## Objetivo

Entregar as 17 páginas públicas sem banco de dados do site da APPD-SJC — informação
encontrável em no máximo dois cliques, acessível por teclado e leitor de tela em nível
WCAG 2.2 AA verificado por ferramenta, e sem nenhuma afirmação apresentada como fato sem
verificação.

## Como ler os requisitos

Esta spec é retroativa (ver `proposal.md`). Cada requisito traz o estado real da
implementação em 2026-08-05:

- **[FEITO]** — implementado e inspecionado manualmente, mas **ainda não provado por
  teste automatizado**. "Feito" aqui significa "o código está lá", não "passou no gate".
- **[PARCIAL]** — implementado em parte, com a lacuna nomeada no próprio requisito.
- **[PENDENTE]** — não existe.

Nenhum requisito conta como validado antes de o cenário de aceite correspondente rodar
verde. O gate de validação (`validacao-aceite`) é item a item.

---

## A. Estrutura, rotas e navegação

- **REQ-1** [FEITO] O site DEVE responder HTTP 200 nas 12 rotas públicas desta change,
  que renderizam **17 URLs**: `/`, `/atendimento`, `/atendimento/<slug>` para os 5 slugs
  `fisioterapia`, `psicologia`, `servico-social`, `orientacoes-gerais`,
  `emprestimo-equipamentos`; `/projetos`, `/projetos/<slug>` para os 4 slugs
  `bocha-paralimpica`, `mao-na-roda`, `artesao-da-inclusao`, `informatica-nota-10`;
  `/doar`, `/contato`, `/sobre`, `/regimento`, `/comtrad`.

  > **A contagem é 17 URLs públicas + a 404**, e essa frase é a única válida no projeto.
  > A v1 dizia "18 páginas" e listava 17 caminhos; três esquemas de cenário diziam "as 18
  > páginas mais a 404", somando a 404 duas vezes; e o REQ-33 mandava o `sitemap.xml` trazer
  > "as 18 URLs", o que colocaria a página de erro no sitemap. Quem fosse escrever o teste
  > teria de adivinhar entre 17 e 18 (bloqueio B3 do gate). **A 404 não é URL pública:** não
  > entra no sitemap, e nas auditorias entra como item declarado à parte.

- **REQ-2** [FEITO] O menu principal DEVE ter exatamente 6 itens, nesta ordem: Início,
  Atendimento, Projetos, Doar, Sobre nós, Contato. O item correspondente à rota atual
  DEVE ter `aria-current="page"`; nenhum outro item pode ter.
- **REQ-3** [FEITO] De qualquer página pública desta change, o formulário de atendimento
  (`/atendimento/inscricao`) DEVE estar alcançável em no máximo 2 cliques.
- **REQ-4** [FEITO] Cada card de serviço ou de projeto DEVE levar à página própria
  daquele item (`/atendimento/<slug>` ou `/projetos/<slug>`), nunca a um formulário
  genérico. Na home, nenhuma URL de destino pode se repetir em mais de 2 dos blocos de
  chamada.
- **REQ-5** [FEITO] Toda página de serviço e de projeto DEVE seguir a mesma espinha, na
  mesma ordem: `h1` com o nome, o que é, para quem, conteúdo sobre a área, o que esperar,
  como funciona na APPD, perguntas frequentes, chamada para cadastro, contato humano
  alternativo.
- **REQ-6** [FEITO] As três regras do atendimento — vaga por fila, sessões **somente no
  período da manhã** e contribuição sugerida de R$ 50,00 mensais ajustável — DEVEM estar
  visíveis na página do serviço **antes** do botão que leva ao formulário, e não só
  dentro do formulário.
- **REQ-7** [FEITO] Rota desconhecida DEVE responder **HTTP 404 de verdade** no cabeçalho
  da resposta (não 200 com aparência de erro), com `h1` próprio, os atalhos "Preciso de
  atendimento" e "Quero doar", a lista dos 9 serviços e projetos com link direto, e o
  telefone da sede.
- **REQ-8** [PARCIAL] A busca da página 404 DEVE, ao ser submetida, levar a um resultado.
  **Hoje o campo existe e não busca nada**: o `submit` é interceptado e descartado
  (`@submit.prevent` sem função). Campo que aceita texto e não faz nada é pior que campo
  ausente — promete e falha em silêncio. Resolução aceita: (a) submeter para uma página de
  resultados que filtre `TODAS_AS_OFERTAS` mais as páginas institucionais por termo, ou
  (b) remover o campo e deixar só os links diretos. Decisão do dono; qualquer uma das
  duas encerra o requisito, "deixar como está" não encerra.

## B. Acessibilidade (WCAG 2.2 AA) — requisito de primeira classe

Esta seção não é apêndice de qualidade. Um requisito reprovado aqui **bloqueia a entrega
da página**, do mesmo jeito que uma rota quebrada bloquearia.

- **REQ-9** [FEITO] Cada uma das 17 páginas, mais a 404, DEVE ter **exatamente um** `h1`, com texto
  não vazio, e ele DEVE nomear o assunto daquela página (não o nome do site em todas).
- **REQ-10** [FEITO] A hierarquia de headings DEVE ser sequencial: nenhum nível pulado
  para baixo (`h1` → `h3` sem `h2` é falha), e nenhum heading vazio ou usado só para dar
  tamanho de fonte.
- **REQ-11** [FEITO] Todo elemento focável DEVE exibir foco visível com anel de **3px**
  (`--foco-largura`) e folga de 2px (`--foco-folga`). Nenhuma regra `outline: none` pode
  existir sem um indicador substituto de contraste ≥ 3:1 com o fundo adjacente.
- **REQ-12** [FEITO] Todo alvo de toque interativo (botão, link de navegação, controle de
  formulário) DEVE medir no mínimo **44 × 44 px CSS** na área clicável, com **8 px de
  folga** entre alvos vizinhos — régua única do projeto —, em telas de 320px
  a 1920px de largura. Link dentro de parágrafo corrido está isento (exceção do critério
  2.5.8 do WCAG 2.2).
- **REQ-13** [PARCIAL] Todo par texto/fundo DEVE atingir **4,5:1** (texto corrente) ou
  **3:1** (texto ≥ 24px ou ≥ 19px em negrito); todo componente de interface, borda de
  campo, estado de foco e ícone informativo DEVE atingir **3:1**. Os valores estão
  calculados e documentados em `DESIGN.md`; **falta medir o renderizado** — cor calculada
  em token não prova cor pintada na tela, porque sobreposição, opacidade herdada, sombra
  e imagem de fundo mudam o resultado. Medição no navegador é obrigatória para fechar.
- **REQ-14** [FEITO] Nenhuma informação pode ser transmitida **só por cor**. Erro, aviso,
  sucesso, selo "A confirmar" e link DEVEM ter, além da cor, ao menos um destes: texto
  por extenso, ícone com rótulo textual, sublinhado ou borda.
- **REQ-15** [FEITO] O documento DEVE declarar `lang="pt-BR"` no elemento `<html>` em
  todas as rotas, inclusive na 404.
- **REQ-16** [FEITO] O primeiro elemento focável de toda página DEVE ser o link "Pular
  para o conteúdo", que DEVE ficar visível ao receber foco e mover o foco para o
  `<main id="conteudo">`.
- **REQ-17** [FEITO] Todo o site DEVE ser operável só pelo teclado: nenhuma armadilha de
  foco, nenhuma ação disponível apenas por sobrevoo ou clique, ordem de tabulação igual à
  ordem visual. O botão do menu mobile DEVE refletir o estado em `aria-expanded` e apontar
  para o menu em `aria-controls`.
- **REQ-18** [FEITO] Toda `<img>` DEVE ter atributo `alt`. Imagem informativa descreve a
  informação; imagem decorativa usa `alt=""` e não é anunciada. `alt` não pode repetir a
  legenda adjacente.
- **REQ-19** [FEITO] O texto corrente DEVE ter no mínimo **17px** (`--texto-corpo`). Em
  zoom de 200% e em viewport de 320px de largura, o conteúdo DEVE refluir sem rolagem
  horizontal e sem perda de conteúdo ou função.
- **REQ-20** [FEITO] Com `prefers-reduced-motion: reduce`, nenhuma animação ou transição
  com duração maior que 0 pode ser executada.
- **REQ-21** [PENDENTE] Uma auditoria automatizada com **axe-core** DEVE rodar sobre as
  17 páginas e a 404 e reportar **zero** violação de **nível A ou AA** — régua única do
  projeto, definida **uma vez** na configuração do axe no CI e importada pelas outras cinco
  changes, nunca repetida em spec (bloqueio B24) —, e o passo
  DEVE ser bloqueante no CI. **Não existe nenhum teste de acessibilidade no projeto
  hoje** — `CLAUDE.md` promete "Vitest + axe" e o `package.json` não tem axe. Violações
  `moderate`/`minor` viram lista com dono e prazo, não bloqueiam.
- **REQ-22** [PENDENTE] Um teste ponta a ponta DEVE cobrir o caminho crítico de cada
  público, só pelo teclado. Hoje existem **4 testes unitários de um formatador de número
  de registro** e nenhum teste de fluxo.

## C. Conteúdo e veracidade

- **REQ-23** [FEITO] Nenhuma afirmação sobre a APPD pode ser publicada como fato sem
  verificação. Todo dado não confirmado pela associação DEVE aparecer com o selo **"A
  confirmar"**, em texto por extenso, adjacente à afirmação que ele qualifica.
- **REQ-24** [FEITO] **Telefone e chave PIX nunca são inventados**, nem como placeholder:
  número plausível pode ser a linha de uma pessoa real, e chave PIX inventada manda
  dinheiro do doador para a conta de outro. Nesses dois campos só entra dado real
  publicado, ou o campo fica vazio e marcado.
- **REQ-25** [FEITO] Conteúdo vencido não migra: nenhuma página pode anunciar evento com
  data passada como se estivesse aberto (evento de 15/12/2019, jantar de 20/04/2024).
- **REQ-26** [FEITO] Nenhuma tela pode prometer um efeito que não acontece. Enquanto a
  APPD não informar o e-mail que recebe as mensagens, o formulário de contato DEVE dizer,
  na confirmação, que nada foi enviado e por quê.
- **REQ-27** [FEITO] Toda afirmação numérica ou de pesquisa citada no conteúdo DEVE ter
  fonte identificável no rascunho correspondente em `docs/servicos/`. Afirmação sem fonte
  verificável não vai ao ar — precedente: a alegação de que "pesquisas comprovam" renda
  per capita 50% a 70% menor, que não existe em IBGE, IPEA, OMS nem Banco Mundial.

## D. Desempenho

- **REQ-28** [FEITO] Toda imagem de conteúdo DEVE ser servida em **WebP**. Imagem abaixo
  da dobra DEVE usar `loading="lazy"` e `decoding="async"`.
- **REQ-29** [PARCIAL] Toda `<img>` DEVE declarar `width` e `height` (ou proporção fixa
  em CSS) para que o deslocamento cumulativo de layout (CLS) fique **≤ 0,1** por página.
  As imagens da galeria hoje não declaram dimensão no HTML — a altura vem da grade em
  CSS, o que provavelmente segura o CLS, mas **não foi medido**.
- **REQ-30** [PARCIAL] O peso transferido no primeiro carregamento, sem cache, no build
  de produção, DEVE ser **≤ 500 KB** em rota sem galeria e **≤ 1 MB** em rota com
  galeria. Imagem abaixo da dobra carregada por `lazy` não conta. As 36 imagens já foram
  comprimidas para WebP (8,3 MB → 1,4 MB, maior arquivo 116 KB), mas **o peso por rota
  nunca foi medido no build**.
- **REQ-31** [FEITO] Nenhuma página pode fazer requisição a host de terceiro. Fonte,
  ícone e imagem são auto-hospedados; nenhum IP de visitante é entregue a outro servidor.

## E. Migração de URL e SEO técnico

- **REQ-32** [PENDENTE] O site DEVE responder **301** nestas 7 URLs antigas, que já estão
  compartilhadas por aí e continuam sendo abertas:

  | URL antiga                       | Destino                         |
  | -------------------------------- | ------------------------------- |
  | `/sobre-nos`                     | `/sobre`                        |
  | `/projetos-sociais`              | `/projetos`                     |
  | `/colaborador`                   | `/doar`                         |
  | `/bocha-adaptada`                | `/projetos/bocha-paralimpica`   |
  | `/oficina-inclusiva-mao-na-roda` | `/projetos/mao-na-roda`         |
  | `/artesao-da`                    | `/projetos/artesao-da-inclusao` |
  | `/regimento-interno`             | `/regimento`                    |

  As rotas antigas sem equivalente (`/comtrad` legado, `/eventos`, `/certificados`,
  `/certificados-1`, `/swim-4-ghange`, `/swin-four-changer`, `/edit`) caem na 404 útil,
  por decisão registrada em `docs/arquitetura-informacao.md`. **Nada disso está
  implementado.**

- **REQ-33** [PENDENTE] O site DEVE servir `sitemap.xml` com as **17** URLs públicas desta
  change e **nenhuma** URL de área autenticada, de verificação de crachá ou de
  formulário com dado de pessoa.
- **REQ-34** [PARCIAL] O `robots.txt` DEVE proibir a indexação das rotas que exponham
  dado de pessoa e apontar o `sitemap.xml`. Hoje ele tem 2 linhas (`User-Agent: *` /
  `Disallow:`) — libera tudo e não aponta sitemap nenhum. Precisa ser revisado antes de
  qualquer publicação.
- **REQ-35** [FEITO] Cada página DEVE ter `<title>` único e descritivo. As rotas de
  entrada dos três públicos (`/`, `/atendimento`, `/doar`) DEVEM ter `meta description`.

---

## Comportamento esperado

### Caminho feliz — Público 1 (pessoa com deficiência e família)

Chega por busca em qualquer página → identifica o site em uma frase → "Preciso de
atendimento" → página do serviço, onde lê fila, período da manhã e contribuição sugerida
**antes** do botão → formulário. Alternativa para quem não preenche formulário: WhatsApp
oficial na própria página do serviço.

### Caminho feliz — Público 2 (doador)

Home → "Quero doar" → Central de Doações → vê o favorecido, o CNPJ e o destino do
dinheiro → copia a chave PIX ou lê o QR → ou escolhe doação em espécie e combina a
retirada.

### Caminho feliz — Público 3 (voluntário)

Qualquer página → Sobre nós (seção "Quer ajudar?") ou rodapé → Contato com o assunto
"Quero ser voluntário" pré-selecionável.

### Erros e bordas

- **Slug inexistente** em `/atendimento/<slug>` ou `/projetos/<slug>`: 404 de verdade,
  com a mesma página útil.
- **Sem JavaScript**: as páginas são renderizadas no servidor; conteúdo e navegação
  continuam legíveis e navegáveis. O menu mobile e a cópia da chave PIX degradam — a
  chave PIX DEVE continuar visível como texto selecionável, nunca só atrás do botão de
  copiar.
- **`navigator.clipboard` indisponível ou negado** (contexto não seguro, navegador
  antigo): a interface não pode afirmar que copiou. A chave permanece visível para cópia
  manual.
- **Imagem que não carrega**: o `alt` sustenta o sentido da página.
- **Campo obrigatório vazio no contato**: a lista de erros aparece no topo, cada item é
  link para o campo, e a mensagem diz o que fazer — não "campo inválido".
- **Dado que a APPD ainda não confirmou**: aparece com o selo "A confirmar", nunca com
  valor inventado, nunca omitido em silêncio.

---

## Fora de escopo (explícito)

Repetido aqui de propósito, porque é onde o escopo vaza:

- Banco de dados, login, sessão, dado de pessoa — outras changes.
- `/atendimento/inscricao` (o formulário em si) — change `formulario-atendimento`.
- Envio real da mensagem de contato — bloqueado por P0-4 em `docs/pendencias-appd.md`.
- `/privacidade`, `/seus-direitos`, `/cadastro`, `/entrar`, `/area/*`,
  `/verificar/<numero>`.
- Motor de busca com índice de conteúdo (ver REQ-8: a decisão é buscar de verdade ou
  remover o campo).
- Deploy em domínio da APPD.
- Revisão editorial dos textos pela associação — atividade dela, não entrega de código.
- Analytics, cookie e qualquer rastreamento.

## Premissas e dependências

- `design-system/tokens.css` e `design-system/base.css` são a **fonte da verdade** de
  contraste, foco e alvo; `DESIGN.md` documenta os valores medidos. Divergência entre eles
  é defeito.
- `shared/conteudo.ts` é a fonte única de conteúdo; texto não vive na página.
- Nuxt 4 com Nitro no preset `cloudflare_module`; o 301 do REQ-32 precisa funcionar no
  runtime workerd, não só no `nuxt dev`.
- Ferramentas a adicionar: `axe-core` + `@axe-core/playwright` (ou equivalente) para o
  REQ-21, e um executor de e2e para o REQ-22. Ambas de custo zero e locais.
- Os 15 campos e as opções do formulário de atendimento não mudam
  (`docs/campos-formulario.md`) — é o que fixa os 5 slugs de serviço.

---

## Critérios de aceite (Gherkin)

Cada cenário aponta o REQ que cobre. Cenário que não pode ser automatizado hoje traz a
marca `[manual]` e vira dívida de automação, não desculpa.

### Estrutura e navegação

```gherkin
Funcionalidade: Rotas públicas respondem
  Cobre REQ-1

  Esquema do Cenário: Rota pública responde 200 com conteúdo
    Dado que o site está servido no build de produção
    Quando eu requisito "<rota>"
    Então o código de resposta é 200
    E o corpo contém um elemento <main> não vazio

    Exemplos:
      | rota                                   |
      | /                                      |
      | /atendimento                           |
      | /atendimento/fisioterapia              |
      | /atendimento/psicologia                |
      | /atendimento/servico-social            |
      | /atendimento/orientacoes-gerais        |
      | /atendimento/emprestimo-equipamentos   |
      | /projetos                              |
      | /projetos/bocha-paralimpica            |
      | /projetos/mao-na-roda                  |
      | /projetos/artesao-da-inclusao          |
      | /projetos/informatica-nota-10          |
      | /doar                                  |
      | /contato                               |
      | /sobre                                 |
      | /regimento                             |
      | /comtrad                               |
```

```gherkin
Funcionalidade: Menu principal
  Cobre REQ-2

  Cenário: Menu tem seis itens na ordem definida
    Dado que estou em qualquer rota pública
    Quando eu leio a navegação com rótulo acessível "Principal"
    Então ela tem exatamente 6 links
    E os rótulos, em ordem, são "Início", "Atendimento", "Projetos", "Doar",
      "Sobre nós", "Contato"

  Cenário: Só a rota atual é marcada como página corrente
    Dado que estou em "/doar"
    Quando eu inspeciono a navegação principal
    Então exatamente 1 link tem aria-current="page"
    E esse link é "Doar"

  Cenário: Item de seção marca a página corrente na rota filha
    Dado que estou em "/projetos/bocha-paralimpica"
    Quando eu inspeciono a navegação principal
    Então o link "Projetos" tem aria-current="page"
```

```gherkin
Funcionalidade: Caminho até o formulário de atendimento
  Cobre REQ-3, REQ-4

  Esquema do Cenário: Formulário alcançável em no máximo dois cliques
    Dado que estou em "<rota>"
    Quando eu percorro os links da página em até 2 níveis de profundidade
    Então existe um caminho de no máximo 2 cliques até "/atendimento/inscricao"

    Exemplos:
      | rota                          |
      | /                             |
      | /projetos/informatica-nota-10 |
      | /comtrad                      |
      | /regimento                    |

  Cenário: Card de serviço leva à página do serviço, não ao formulário
    Dado que estou na home
    Quando eu clico no card "Fisioterapia"
    Então a URL é "/atendimento/fisioterapia"
    E o h1 da página é "Fisioterapia"

  Cenário: Nenhum destino se repete em mais de dois blocos de chamada da home
    Dado que estou na home
    Quando eu coleto o href de todos os links dos blocos de chamada
    Então nenhuma URL de destino aparece mais de 2 vezes
```

```gherkin
Funcionalidade: Anatomia comum das nove landing pages
  Cobre REQ-5, REQ-6

  Esquema do Cenário: A página do serviço traz a espinha na ordem
    Dado que estou em "/atendimento/<slug>"
    Quando eu leio os headings de nível 2 na ordem do documento
    Então existe seção de "o que é", "para quem", "como funciona na APPD" e
      "perguntas frequentes"
    E a última chamada de ação leva a "/atendimento/inscricao"
    E existe um contato humano alternativo com telefone da associação

    Exemplos:
      | slug                     |
      | fisioterapia             |
      | psicologia               |
      | servico-social           |
      | orientacoes-gerais       |
      | emprestimo-equipamentos  |

  Cenário: As três regras aparecem antes do botão do formulário
    Dado que estou em "/atendimento/psicologia"
    Quando eu comparo a posição no documento
    Então o texto sobre fila, período da manhã e contribuição sugerida de R$ 50,00
      aparece antes do link para "/atendimento/inscricao"
```

```gherkin
Funcionalidade: Página 404 útil
  Cobre REQ-7

  Cenário: Rota inexistente responde 404 de verdade
    Dado que o site está servido no build de produção
    Quando eu requisito "/pagina-que-nunca-existiu"
    Então o código de resposta é 404
    E a página tem exatamente 1 elemento h1
    E o h1 não culpa a pessoa nem usa jargão técnico

  Cenário: Slug de serviço inexistente cai na 404
    Quando eu requisito "/atendimento/quiropraxia"
    Então o código de resposta é 404

  Cenário: Slug de projeto inexistente cai na 404
    Quando eu requisito "/projetos/natacao"
    Então o código de resposta é 404

  Cenário: A 404 oferece as duas ações principais e as nove páginas
    Dado que estou na página 404
    Quando eu leio os links
    Então existe link para "/atendimento/inscricao" e para "/doar"
    E existem 5 links para "/atendimento/<slug>" e 4 para "/projetos/<slug>"
    E existe um link de telefone "tel:" da sede
```

```gherkin
Funcionalidade: Busca da 404 não pode ser decorativa
  Cobre REQ-8 (PARCIAL — o campo existe e não busca nada)

  Cenário: Busca submetida entrega resultado
    Dado que estou na página 404
    E que o campo de busca está visível
    Quando eu digito "fisioterapia" e submeto pelo teclado
    Então eu chego a uma lista de resultados que contém "Fisioterapia"
    E o número de resultados é anunciado por região aria-live

  Cenário: Busca sem resultado explica o que fazer
    Dado que estou na página 404
    Quando eu busco "xilofone"
    Então a página diz que nada foi encontrado
    E oferece o telefone da sede como caminho alternativo

  Cenário: Alternativa aceita — campo removido
    Dado que a decisão do dono foi remover a busca
    Quando eu inspeciono a página 404
    Então não existe nenhum campo de busca
    E os links diretos para os 9 serviços e projetos continuam presentes
```

### Acessibilidade

```gherkin
Funcionalidade: Um h1 por página e hierarquia de headings
  Cobre REQ-9, REQ-10

  Esquema do Cenário: Exatamente um h1 com texto útil
    Dado que carrego "<rota>"
    Quando eu conto os elementos h1
    Então o total é exatamente 1
    E o texto do h1 não está vazio
    E o texto do h1 não é igual ao das outras 16 páginas

      | rota                                |
      | /                                   |
      | /atendimento                        |
      | /atendimento/fisioterapia           |
      | /atendimento/psicologia             |
      | /atendimento/servico-social         |
      | /atendimento/orientacoes-gerais     |
      | /atendimento/emprestimo-equipamentos |
      | /projetos                           |
      | /projetos/bocha-paralimpica         |
      | /projetos/mao-na-roda               |
      | /projetos/artesao-da-inclusao       |
      | /projetos/informatica-nota-10       |
      | /doar                               |
      | /contato                            |
      | /sobre                              |
      | /regimento                          |
      | /comtrad                            |
      | /uma-rota-que-nao-existe            |

  Esquema do Cenário: Nenhum nível de heading é pulado
    Dado que carrego "<rota>"
    Quando eu leio os headings na ordem do documento
    Então o primeiro é h1
    E nenhum heading sobe mais de 1 nível em relação ao anterior
    E nenhum heading tem texto vazio

      | rota                                |
      | /                                   |
      | /atendimento                        |
      | /atendimento/fisioterapia           |
      | /atendimento/psicologia             |
      | /atendimento/servico-social         |
      | /atendimento/orientacoes-gerais     |
      | /atendimento/emprestimo-equipamentos |
      | /projetos                           |
      | /projetos/bocha-paralimpica         |
      | /projetos/mao-na-roda               |
      | /projetos/artesao-da-inclusao       |
      | /projetos/informatica-nota-10       |
      | /doar                               |
      | /contato                            |
      | /sobre                              |
      | /regimento                          |
      | /comtrad                            |
      | /uma-rota-que-nao-existe            |
```

```gherkin
Funcionalidade: Foco visível e operação por teclado
  Cobre REQ-11, REQ-16, REQ-17

  Cenário: Todo elemento interativo recebe foco visível com anel de 3px
    Dado que uso apenas o teclado
    Quando eu percorro a home com Tab até o último elemento focável
    Então cada elemento focado tem outline com largura computada de 3px
    E o outline tem offset de 2px
    E nenhum elemento focado tem outline-style "none"

  Cenário: O primeiro Tab é o pular para o conteúdo
    Dado que a página acabou de carregar e o foco está no documento
    Quando eu pressiono Tab uma vez
    Então o elemento focado é o link "Pular para o conteúdo"
    E ele está visível na viewport
    Quando eu pressiono Enter
    Então o foco passa para o elemento com id "conteudo"

  Cenário: Menu mobile é operável por teclado e informa o estado
    Dado que a viewport tem 360px de largura
    E que o menu está fechado
    Quando eu focalizo o botão "Menu" e pressiono Enter
    Então o botão tem aria-expanded="true"
    E o elemento referenciado por aria-controls está visível
    E o próximo Tab entra no primeiro link do menu

  Cenário: Não existe armadilha de foco
    Dado que uso apenas o teclado em "/doar"
    Quando eu percorro a página inteira com Tab e depois com Shift+Tab
    Então eu consigo sair de todo elemento focado
    E a ordem de tabulação corresponde à ordem visual dos elementos
```

```gherkin
Funcionalidade: Alvo de toque
  Cobre REQ-12

  Esquema do Cenário: Controles medem no mínimo 44 por 44 px
    Dado que a viewport tem <largura>px de largura
    Quando eu meço a caixa de cada botão, link de navegação, link de rodapé e
      controle de formulário
    Então nenhuma medida de altura ou largura é menor que 44px
    E a distância entre alvos vizinhos é de no mínimo 8px
    E links dentro de parágrafo corrido ficam de fora da medição

    Exemplos:
      | largura |
      | 320     |
      | 768     |
      | 1920    |
```

```gherkin
Funcionalidade: Contraste medido no renderizado
  Cobre REQ-13 (PARCIAL)

  Cenário: Texto corrente atinge 4,5:1 na cor efetivamente pintada
    Dado que carrego cada uma das 17 páginas e a 404 no navegador
    Quando eu calculo o contraste de cada nó de texto usando a cor computada e a cor
      de fundo efetiva do ancestral que pinta
    Então nenhum nó de texto com fonte menor que 24px fica abaixo de 4,5:1
    E nenhum nó com fonte de 24px ou mais fica abaixo de 3:1

  Cenário: Componente, borda e foco atingem 3:1
    Dado que carrego cada uma das 17 páginas e a 404
    Quando eu meço borda de campo, borda de cartão, anel de foco e ícone informativo
    Então nenhum fica abaixo de 3:1 contra o fundo adjacente

  Cenário: Texto sobre imagem e sobre superfície escura
    Dado que carrego "/projetos/bocha-paralimpica" e o rodapé de qualquer página
    Quando eu meço o contraste de texto sobreposto a imagem ou a fundo escuro
    Então o resultado é medido contra a cor real do pixel de fundo, não contra o token
    E nenhum par fica abaixo do mínimo do critério correspondente
```

```gherkin
Funcionalidade: Nada sinalizado só por cor
  Cobre REQ-14

  Cenário: Erro de formulário tem texto, não só cor
    Dado que estou em "/contato"
    Quando eu submeto o formulário vazio
    Então cada erro traz texto por extenso dizendo o que fazer
    E o resumo no topo lista os erros com link para cada campo
    E a informação continua compreensível com o filtro de escala de cinza aplicado

  Cenário: Selo "A confirmar" é texto, não cor
    Dado que estou em qualquer página que exiba dado não confirmado
    Quando eu leio o selo
    Então ele contém a expressão "A confirmar" por extenso
    E o ícone que o acompanha tem aria-hidden="true"

  Cenário: Link se distingue do texto sem depender de cor
    Dado que aplico o filtro de escala de cinza na página
    Quando eu comparo um link dentro de parágrafo com o texto ao redor
    Então o link continua distinguível por sublinhado ou peso
```

```gherkin
Funcionalidade: Idioma, imagem, tamanho de texto e movimento
  Cobre REQ-15, REQ-18, REQ-19, REQ-20

  Esquema do Cenário: Documento declara o idioma
    Dado que requisito "<rota>"
    Então o elemento html tem lang="pt-BR"

      | rota                                |
      | /                                   |
      | /atendimento                        |
      | /atendimento/fisioterapia           |
      | /atendimento/psicologia             |
      | /atendimento/servico-social         |
      | /atendimento/orientacoes-gerais     |
      | /atendimento/emprestimo-equipamentos |
      | /projetos                           |
      | /projetos/bocha-paralimpica         |
      | /projetos/mao-na-roda               |
      | /projetos/artesao-da-inclusao       |
      | /projetos/informatica-nota-10       |
      | /doar                               |
      | /contato                            |
      | /sobre                              |
      | /regimento                          |
      | /comtrad                            |
      | /uma-rota-que-nao-existe            |

  Cenário: Toda imagem tem alt e a decorativa é silenciosa
    Dado que carrego as 17 páginas e a 404
    Quando eu inspeciono cada elemento img
    Então todos têm o atributo alt presente
    E nenhuma imagem informativa tem alt vazio
    E nenhum alt repete literalmente a legenda adjacente

  Cenário: Texto corrente não fica abaixo de 17px
    Dado que carrego as 17 páginas e a 404 com a configuração padrão do navegador
    Quando eu leio o font-size computado dos parágrafos de conteúdo
    Então nenhum é menor que 17px

  Cenário: Reflow em 320px sem rolagem horizontal
    Dado que a viewport tem 320px de largura
    Quando eu carrego cada uma das 17 páginas e a 404
    Então a largura de rolagem do documento não excede a largura da viewport
    E nenhum conteúdo ou função fica inacessível

  Cenário: [manual] Zoom de 200% preserva conteúdo e função
    Dado que aplico zoom de 200% em viewport de 1280px
    Quando eu percorro a home
    Então todo conteúdo continua legível e todo controle continua operável

  Cenário: Movimento reduzido é respeitado
    Dado que o navegador informa prefers-reduced-motion: reduce
    Quando eu carrego qualquer página e interajo com botões e cartões
    Então nenhuma transição ou animação tem duração computada maior que 0
```

```gherkin
Funcionalidade: Auditoria automatizada de acessibilidade
  Cobre REQ-21 (PENDENTE)

  Cenário: axe não acusa violação séria ou crítica
    Dado que o site está servido no build de produção
    Quando eu rodo axe-core com o conjunto de regras wcag2a, wcag2aa, wcag21aa e
      wcag22aa em cada uma das 17 páginas e na 404
    E o relatório separa, em lista com dono e prazo, as violações de severidade
      "moderate" ou "minor" que estão fora de A e AA — elas não bloqueiam
    E o número de violações de nível A ou AA é 0
    # Régua única do projeto, na configuração do axe no CI, nunca repetida por change.
    E o relatório é gravado como artefato do CI

  Cenário: A auditoria é bloqueante no CI
    Dado que uma violação de nível AA é introduzida de propósito
    Quando o CI roda no pull request
    Então o job de acessibilidade falha
    E o merge fica bloqueado

  Cenário: axe roda também nos estados, não só no carregamento
    Dado que estou em "/contato" com o formulário submetido vazio
    E em qualquer página com o menu mobile aberto
    Quando eu rodo axe nesses estados
    Então o resultado também é zero violação séria ou crítica
```

```gherkin
Funcionalidade: Caminho crítico ponta a ponta
  Cobre REQ-22 (PENDENTE)

  Cenário: Público 1 chega ao formulário só pelo teclado
    Dado que estou na home usando apenas o teclado
    Quando eu navego até "Preciso de atendimento", entro na página do serviço e sigo
      para o cadastro
    Então eu chego em "/atendimento/inscricao"
    E em nenhum passo eu precisei do mouse
    E em todo passo o elemento focado estava visível

  Cenário: Público 2 chega à chave PIX
    Dado que estou na home
    Quando eu sigo "Quero doar"
    Então a Central de Doações mostra favorecido, CNPJ e a chave PIX como texto
    E existe um botão de copiar a chave

  Cenário: Público 3 chega ao contato com assunto de voluntariado
    Dado que estou em "/sobre"
    Quando eu sigo o caminho de voluntariado
    Então eu chego em "/contato"
    E a opção de assunto "Quero ser voluntário" está disponível

  Cenário: Cópia da chave PIX sem API de área de transferência
    Dado que navigator.clipboard não está disponível
    Quando eu aciono o botão de copiar
    Então a interface não afirma que copiou
    E a chave continua visível como texto selecionável
```

### Conteúdo e veracidade

```gherkin
Funcionalidade: Nada apresentado como fato sem verificação
  Cobre REQ-23, REQ-24, REQ-25, REQ-26, REQ-27

  Cenário: Dado não confirmado aparece com selo
    Dado que uma oferta em shared/conteudo.ts tem itens em "aConfirmar"
    Quando eu carrego a página dessa oferta
    Então cada item aparece com o selo "A confirmar" por extenso
    E o selo está adjacente à afirmação que ele qualifica

  Cenário: Telefone publicado bate com a fonte
    Dado que carrego todas as 17 páginas e a 404
    Quando eu coleto todos os links "tel:"
    Então todo número existe em ASSOCIACAO.telefones
    E nenhum número aparece fora dessa lista

  Cenário: Chave PIX é a real ou não existe
    Dado que carrego "/doar"
    Quando eu leio a chave PIX exibida
    Então ela é idêntica ao CNPJ registrado da associação
    E o payload do QR Code decodifica para a mesma chave, com CRC válido

  Cenário: Nenhuma URL contém caractere invisível
    Dado que carrego todas as 17 páginas e a 404
    Quando eu inspeciono o href de todos os links
    Então nenhum contém caractere de controle bidirecional (U+202A a U+202E)
    E nenhum aponta para "/edit" de formulário externo

  Cenário: Conteúdo vencido não está no ar
    Dado que carrego todas as 17 páginas e a 404
    Quando eu procuro por datas de evento
    Então nenhuma página anuncia como aberto um evento com data anterior a hoje

  Cenário: Formulário de contato não promete envio que não acontece
    Dado que estou em "/contato" e preencho os campos obrigatórios
    Quando eu submeto
    Então a confirmação diz explicitamente que nada foi enviado
    E explica que a associação ainda não informou o e-mail que recebe
```

### Desempenho

```gherkin
Funcionalidade: Peso e estabilidade da página
  Cobre REQ-28, REQ-29, REQ-30, REQ-31

  Cenário: Toda imagem de conteúdo é WebP
    Dado que carrego as 17 páginas e a 404
    Quando eu listo o src de cada img de conteúdo
    Então todos terminam em ".webp"

  Cenário: Imagem abaixo da dobra é adiada
    Dado que carrego "/projetos/bocha-paralimpica" com viewport de 1280x800
    Quando eu inspeciono as imagens fora da primeira dobra
    Então todas têm loading="lazy" e decoding="async"

  Cenário: Orçamento de peso da página é respeitado
    Dado o build de produção servido sem cache
    Quando eu meço o total transferido no primeiro carregamento de "<rota>"
    Então rota sem galeria fica em no máximo 500 KB
    E rota com galeria fica em no máximo 1 MB

  Cenário: Layout não pula durante o carregamento
    Dado que carrego cada uma das 17 páginas em conexão limitada a 3G rápido
    Quando eu meço o deslocamento cumulativo de layout
    Então o CLS de cada página é no máximo 0,1

  Cenário: Nenhuma requisição sai para host de terceiro
    Dado que carrego as 17 páginas com o registro de rede aberto
    Quando eu listo os domínios requisitados
    Então todos são a própria origem do site
```

### Migração de URL e SEO técnico

```gherkin
Funcionalidade: Redirecionamento das URLs antigas
  Cobre REQ-32 (PENDENTE)

  Esquema do Cenário: URL antiga com equivalente redireciona com 301
    Dado que o site roda no runtime workerd (não só no servidor de desenvolvimento)
    Quando eu requisito "<antiga>" sem seguir redirecionamento
    Então o código de resposta é 301
    E o cabeçalho Location é "<destino>"

    Exemplos:
      | antiga                         | destino                         |
      | /sobre-nos                     | /sobre                          |
      | /projetos-sociais              | /projetos                       |
      | /colaborador                   | /doar                           |
      | /bocha-adaptada                | /projetos/bocha-paralimpica     |
      | /oficina-inclusiva-mao-na-roda | /projetos/mao-na-roda           |
      | /artesao-da                    | /projetos/artesao-da-inclusao   |
      | /regimento-interno             | /regimento                      |

  Esquema do Cenário: URL antiga sem equivalente cai na 404 útil
    Quando eu requisito "<antiga>"
    Então o código de resposta é 404
    E a página traz os links dos 9 serviços e projetos

    Exemplos:
      | antiga             |
      | /eventos           |
      | /certificados      |
      | /certificados-1    |
      | /swim-4-ghange     |
      | /swin-four-changer |

  Cenário: Redirecionamento não vira corrente nem laço
    Quando eu sigo o redirecionamento de cada URL antiga
    Então cada uma chega ao destino final em exatamente 1 salto
```

```gherkin
Funcionalidade: sitemap.xml e robots.txt
  Cobre REQ-33 (PENDENTE), REQ-34 (PARCIAL), REQ-35

  Cenário: sitemap lista as páginas públicas e nada além
    Quando eu requisito "/sitemap.xml"
    Então o código de resposta é 200 e o tipo é "application/xml"
    E ele contém as 18 URLs públicas desta change
    E não contém "/area", "/verificar", "/cadastro", "/entrar" nem
      "/atendimento/inscricao"

  Cenário: robots aponta o sitemap e protege rota com dado de pessoa
    Quando eu requisito "/robots.txt"
    Então ele contém uma linha "Sitemap:" apontando para "/sitemap.xml"
    E ele proíbe "/area/" e "/verificar/"

  Cenário: Cada página tem título único
    Dado que carrego as 17 páginas e a 404
    Quando eu coleto o elemento title de cada uma
    Então não existem dois títulos iguais
    E cada título identifica a página e a associação

  Cenário: Rotas de entrada têm meta description
    Dado que carrego "/", "/atendimento" e "/doar"
    Então cada uma tem meta name="description" com 50 a 160 caracteres
```

---

## Rastreabilidade

| REQ    | Tema                            | Estado   | Cenário de aceite      |
| ------ | ------------------------------- | -------- | ---------------------- |
| REQ-1  | 12 rotas / 18 páginas           | FEITO    | Rotas públicas         |
| REQ-2  | Menu de 6 itens                 | FEITO    | Menu principal         |
| REQ-3  | 2 cliques até o formulário      | FEITO    | Caminho até o form     |
| REQ-4  | Card leva à página própria      | FEITO    | Caminho até o form     |
| REQ-5  | Anatomia comum das 9 páginas    | FEITO    | Anatomia comum         |
| REQ-6  | 3 regras antes do botão         | FEITO    | Anatomia comum         |
| REQ-7  | 404 de verdade e útil           | FEITO    | Página 404 útil        |
| REQ-8  | Busca da 404 funciona           | PARCIAL  | Busca da 404           |
| REQ-9  | Um h1 por página                | FEITO    | Um h1 e hierarquia     |
| REQ-10 | Hierarquia de headings          | FEITO    | Um h1 e hierarquia     |
| REQ-11 | Foco visível de 3px             | FEITO    | Foco e teclado         |
| REQ-12 | Alvo de 44px com 8px de folga   | FEITO    | Alvo de toque          |
| REQ-13 | Contraste AA medido             | PARCIAL  | Contraste renderizado  |
| REQ-14 | Nada só por cor                 | FEITO    | Nada só por cor        |
| REQ-15 | lang="pt-BR"                    | FEITO    | Idioma e imagem        |
| REQ-16 | Pular para o conteúdo           | FEITO    | Foco e teclado         |
| REQ-17 | Teclado 100%                    | FEITO    | Foco e teclado         |
| REQ-18 | alt em toda imagem              | FEITO    | Idioma e imagem        |
| REQ-19 | Texto ≥17px, reflow, zoom       | FEITO    | Idioma e imagem        |
| REQ-20 | prefers-reduced-motion          | FEITO    | Idioma e imagem        |
| REQ-21 | axe sem violação séria          | PENDENTE | Auditoria automatizada |
| REQ-22 | e2e do caminho crítico          | PENDENTE | Caminho crítico        |
| REQ-23 | Selo "A confirmar"              | FEITO    | Nada como fato         |
| REQ-24 | Telefone e PIX nunca inventados | FEITO    | Nada como fato         |
| REQ-25 | Conteúdo vencido não migra      | FEITO    | Nada como fato         |
| REQ-26 | Tela não promete o que não faz  | FEITO    | Nada como fato         |
| REQ-27 | Afirmação com fonte             | FEITO    | Nada como fato         |
| REQ-28 | Imagens em WebP                 | FEITO    | Peso e estabilidade    |
| REQ-29 | CLS ≤ 0,1                       | PARCIAL  | Peso e estabilidade    |
| REQ-30 | Orçamento de peso por rota      | PARCIAL  | Peso e estabilidade    |
| REQ-31 | Zero host de terceiro           | FEITO    | Peso e estabilidade    |
| REQ-32 | 301 das 7 URLs antigas          | PENDENTE | Redirecionamento       |
| REQ-33 | sitemap.xml                     | PENDENTE | sitemap e robots       |
| REQ-34 | robots.txt revisado             | PARCIAL  | sitemap e robots       |
| REQ-35 | title único e description       | FEITO    | sitemap e robots       |

Resumo: 35 requisitos — 26 [FEITO] (implementados, nenhum provado por teste automatizado),
5 [PARCIAL] e 4 [PENDENTE].
