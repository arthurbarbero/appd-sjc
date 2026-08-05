# Proposal: Site institucional público da APPD-SJC

- ID: PROP-20260805-site-institucional · Status: em discussão
- Origem: decisão do dono em 2026-08-05 (registrada em `PROGRESS.md`, "a Fase 3 foi
  pulada por decisão do dono para ter algo rodando") + Fase 1 do projeto
  (`docs/inventario-conteudo.md`, `docs/arquitetura-informacao.md`,
  `docs/pendencias-appd.md`)
- Autor do registro: Claude Code (papel especificador) · Dono do conteúdo: Arthur Barbero
- Data: 2026-08-05 · Versão: v1

## Aviso: esta change é retroativa

A implementação **precedeu** a spec. Em 2026-08-05 o dono decidiu ter o site rodando
antes de escrever o rito, e as 12 rotas públicas foram implementadas nos commits
`8b82523`, `96b0141`, `7f95d89`, `25f3c89` e `fa34150`. Este documento não descreve algo
a construir: ele **documenta o que existe e trava o que ficou faltando**.

Consequência prática, e é ela que justifica escrever a change mesmo agora: o código
existente nunca passou por um critério de aceite. Ninguém provou que a hierarquia de
headings está correta, que o contraste renderizado bate com o calculado, que o caminho
crítico funciona só no teclado. Hoje o projeto tem **4 testes unitários de um formatador
de número de registro** e **zero teste de acessibilidade ou de fluxo**. A spec existe
para transformar "parece certo na tela" em "passou ou falhou".

O que **não** se faz aqui: fingir que é greenfield e escrever requisito já satisfeito
como se fosse trabalho futuro. Cada requisito abaixo carrega o estado real — atendido,
parcialmente atendido ou pendente — e as tasks separam os dois grupos.

## Motivação (por quê)

O site atual (appd.org.br, plataforma Wix) não entrega os três públicos que a associação
tem. Os problemas abaixo são achados do inventário da Fase 1, não impressões:

**Seis problemas de link, cada um com endereço.** Fonte:
`docs/inventario-conteudo.md`, `docs/arquitetura-informacao.md` e
`docs/pendencias-appd.md`.

1. O link do WhatsApp na home **mobile** tem dois caracteres invisíveis (U+202A) na URL e
   um número que não bate com nenhum telefone publicado. Na prática, quem acessa pelo
   celular não consegue falar com a associação.
2. `/artesao-da` — URL truncada, sem o resto do nome.
3. `/swim-4-ghange` e `/swin-four-changer` — duas grafias erradas da mesma página, ambas
   no ar.
4. A home aponta para o link `/edit` de um formulário do Google.
5. Sete páginas no ar sem nenhuma entrada de menu (órfãs), entre elas o regimento interno
   e o COMTRAD.
6. `/certificados` publica 37 PDFs individuais com nome de pessoa, em URL pública e
   indexável, sem autenticação.

**`h1` ausente em 14 das 15 páginas**, e 10 delas sem heading nenhum. Para quem navega
por leitor de tela, a página não tem estrutura: é um bloco de texto sem mapa.

**Cinco blocos da home levando ao mesmo formulário.** Seis blocos visuais quase
idênticos, cinco com o mesmo destino. A pessoa escolhe entre coisas que parecem
diferentes e chega sempre no mesmo lugar — o oposto de navegação. Pior no caso do Artesão
e da Informática Nota 10: o bloco convida, o formulário de destino não tem a opção
correspondente no campo "Tipo de Atendimento" (`docs/pendencias-appd.md`, P0-1b).

Some-se: nenhuma forma de doar que funcione (o único meio concreto é um boleto escaneado
com `last-modified` de 2016-07-01), nenhuma página para quem quer ser voluntário, e
conteúdo vencido no ar (evento de 15/12/2019 com cadastro aberto, jantar de 20/04/2024
com voucher ainda anunciado).

## Escopo (o que entra)

As páginas públicas que **não dependem de banco de dados, login ou dado de pessoa** —
18 páginas em 12 rotas:

| Rota                               | Páginas | Estado        |
| ---------------------------------- | ------- | ------------- |
| `/`                                | 1       | implementada  |
| `/atendimento`                     | 1       | implementada  |
| `/atendimento/<slug>` (5 serviços) | 5       | implementadas |
| `/projetos`                        | 1       | implementada  |
| `/projetos/<slug>` (4 projetos)    | 4       | implementadas |
| `/doar`                            | 1       | implementada  |
| `/contato`                         | 1       | implementada  |
| `/sobre`                           | 1       | implementada  |
| `/regimento`                       | 1       | implementada  |
| `/comtrad`                         | 1       | implementada  |
| `/*` não encontrado (404)          | 1       | implementada  |

Entram também, como parte inseparável dessas páginas:

- o layout comum (cabeçalho, menu de 6 itens, rodapé, "pular para o conteúdo");
- a fonte única de conteúdo `shared/conteudo.ts`, com o selo "A confirmar";
- os requisitos de acessibilidade WCAG 2.2 AA **como requisito de primeira classe**, não
  como apêndice de qualidade;
- os requisitos de desempenho (imagens em WebP, orçamento de peso por página);
- os requisitos de veracidade de conteúdo (nada apresentado como fato sem verificação);
- o redirecionamento 301 das URLs antigas e o SEO técnico (`sitemap.xml`, `robots.txt`).

## Fora de escopo (o que NÃO entra)

Explícito, para cortar scope creep depois:

- **Qualquer coisa com banco de dados, login ou dado de pessoa.** Isso é de outras
  changes: `consentimento-e-privacidade`, `cadastro-e-login`, `formulario-atendimento`,
  `cracha-do-associado`, `area-do-associado`, `painel-admin`.
- **O formulário de atendimento** (`/atendimento/inscricao`), embora já exista código
  dele: é a change `formulario-atendimento`. Aqui só se exige que o **caminho até ele**
  funcione.
- **O envio real da mensagem do formulário de contato.** A tela existe e valida, mas não
  entrega a mensagem a ninguém — falta a APPD dizer qual e-mail recebe
  (`docs/pendencias-appd.md`, P0-4). O que esta change exige é que a tela **não minta**
  sobre isso.
- `/privacidade` e `/seus-direitos` — são da change `consentimento-e-privacidade`.
- `/cadastro`, `/entrar`, `/area/*`, `/verificar/<numero>` — outras changes.
- Busca com índice de conteúdo real. O campo de busca da 404 é tratado aqui, mas a
  decisão é entre "fazer buscar" e "remover"; motor de busca próprio não entra na V1.
- Deploy em domínio da APPD. Só `*.workers.dev` até a associação aprovar.
- Revisão editorial da associação sobre os textos das 9 landing pages: é atividade
  **dela**, não entrega de código. Esta change garante que o não confirmado esteja
  marcado.

## Impacto

- **Toca produção / dado sensível / custo real?** Não. Nenhuma página desta change grava
  ou lê dado de pessoa; nada é publicado em domínio da APPD; custo permanece R$ 0. O
  único dado pessoal exibido é o texto institucional sobre pessoas nomeadas em `/sobre`,
  que já está sob o risco R2 de `docs/pendencias-appd.md` e depende de confirmação por
  escrito.
- **Arquitetura/stack afetada?** Não. A stack já está decidida e registrada em
  `docs/adr/adr-001-cloudflare-workers-d1.md`. Duas decisões desta change ainda estão sem
  ADR e precisam ganhar um (ver tasks): (a) implementar antes de especificar, com a dívida
  que isso gerou; (b) publicar 9 landing pages com marcação "A confirmar" em vez de
  esperar a revisão da associação.
- **Dependências / quem é tocado**: `design-system/` (tokens e base são a fonte da
  verdade do contraste, do foco de 3px e do alvo de 44px); `shared/conteudo.ts`;
  `app/layouts/default.vue` e `app/error.vue`; CI do GitHub Actions (precisa ganhar o
  passo de axe e o de e2e).

## Premissas e questões abertas

- **Premissa**: os 15 campos e as opções do formulário de atendimento não mudam
  (`docs/campos-formulario.md`) — o que amarra os slugs das 5 páginas de serviço.
- **Premissa**: a decisão das 9 landing pages (uma por serviço e por projeto) é do dono e
  vale até a APPD derrubar.
- **Questão aberta P0**: chave PIX. Já implementada com o CNPJ como chave e QR gerado do
  payload BR Code com CRC conferido — **falta escanear com o app do banco**. Enquanto não
  escanear, é estrutura validada, não pagamento validado.
- **Questão aberta P0**: qual e-mail recebe a mensagem do formulário de contato.
- **Questão aberta P1**: qual telefone é o WhatsApp oficial (6 números circulam com
  rótulo inconsistente).
- **Questão aberta**: a associação da foto da mulher à fundadora e a do homem ao
  presidente é inferência, não informação confirmada.
- **Risco herdado, não resolvido por esta change**: a logo diz "PESSOAS PORTADORAS DE
  DEFICIÊNCIAS" (razão social registrada) enquanto o texto usa "pessoa com deficiência".
  Marca e texto divergem; é conversa para a associação.

## Próximo passo no fluxo

proposal → spec (`spec.md`) → critério de aceite Gherkin (dentro da spec) → tasks
(`tasks.md`) → validação item a item → `openspec/archive/site-institucional/`.
