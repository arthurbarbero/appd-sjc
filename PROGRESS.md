# PROGRESS — appd-sjc

Estado vivo do projeto. Atualizar ao fim de cada sessão.

## Agora

**No ar desde 2026-08-20** em <https://appd-sjc.appd-sjc.workers.dev>, com CI e deploy
verdes e a migration `0004` aplicada no D1 remoto.

O dono conferiu no celular em 21/08 e aprovou a disposição geral — "ficou bom" —, com
cinco ajustes, que estão na branch `ajustes-mobile`: o "Mostrar senha" virou ícone de
olho, o "Sim/Não" do WhatsApp encostou na base do campo vizinho, a área do associado
ganhou fileira rolável no telefone, o retrato do topo saiu, e **quem já tem foto pode
trocá-la** — não podia, e isso era defeito pré-existente.

A origem é uma **revisão do dono em vídeo**, de 16min40s, percorrendo o site no ar. O
áudio foi transcrito localmente (faster-whisper `large-v3-turbo`, offline) e cada item
conferido contra o quadro do minuto citado: inventário em
`docs/revisoes/revisao-dono-2026-08-20.md`, transcrição ao lado.

**Trinta apontamentos, e boa parte era um defeito só.** `p { max-width: var(--medida) }`
com `--medida: 68ch` valia para todo parágrafo do site, dentro de um container de 1120px —
a mesma queixa ("pequenininho", "espremido", "cortado") apareceu em sete telas
independentes. A medida saiu do seletor de elemento e passou à classe `.prosa`,
centralizada; as treze larguras avulsas que cada página tinha inventado viraram três
tokens.

**As três fases estão feitas.**

| Frente                   | Estado                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| Sistema de largura       | feito, com teste que reprova largura nova fora de token                                    |
| B1, foto ausente na área | feito — **não era carregamento**: a tela desenhava a palavra "Foto" num retângulo cinza    |
| B3, recorte em branco    | feito — cancelar devolvia o vazio no lugar da foto que havia                               |
| B2, salto de rolagem     | **dispensado pelo dono**; o "subir ao clicar e ao salvar", que era outra coisa, foi feito  |
| ✕ do erro de campo       | feito em 28 lugares; a frase passa a carregar a sinalização não-cromática                  |
| Conteúdo e campos        | feito — 16 itens em home, cadastro, área, exclusão, crachá, sobre e contato                |
| Campos 20 e 21           | feito — estado (do CEP, que já devolvia a UF) e país, com migration `0004`                 |
| Cabeçalho e menu         | feito — painel deslizante da direita, hambúrguer, marca sem texto em largura intermediária |
| Área do associado        | feito — menu à esquerda, conteúdo à direita, com fileira de volta abaixo de 760px          |

**A Fase 2 não passou pelo canvas por liberação do dono** em 2026-08-20: "estou liberando
pra você pegar inspirações na internet e fazer você mesmo". No lugar do gate de design
entrou medição: axe A/AA sem violação em 390, 1000 e 1280px, com o painel aberto e
fechado, e o ciclo de teclado conferido — abrir, percorrer, `Esc`, foco de volta ao botão.

**A Fase 4 saiu da change.** A foto do crachá físico mostrou que não é diagramação: cinco
campos que o modelo não tem, identidade visual fora do `DESIGN.md`, e a frente do cartão
real imprimindo CID e CPF — contra o que a nossa própria tela promete (ADR-019). Vira
proposal próprio.

**Números**: `npm test` de 233 para **332**. `npm run aceite` de 143 para **211**
verificações, repetível — roda duas vezes seguidas sem reprovar.

### A armadilha que custou a maior parte de uma sessão

O gate parecia reprovar com `401` em toda rota de `/api/area`, e o mesmo acontecia no
commit anterior à change — o que parecia defeito antigo do produto. Não era nenhum dos
dois: eu subia o worker com `wrangler dev .output/server/index.mjs`, que **ignora o
`wrangler.jsonc`** e portanto não carrega o segredo que sela o cookie de sessão. O cookie
existia e não abria.

`npm run aceite` sobe o servidor sozinho, do jeito certo. **Só passe `APPD_BASE` para
apontar a um endereço que já está no ar** — nunca para um worker subido à mão.

Outra, menor: rodar o aceite várias vezes junto de scripts que também criam conta estoura
a cota de 12 cadastros por 15 minutos, e o `429` aparece disfarçado de outro defeito.
Limpar com `wrangler d1 execute appd-sjc --local --command "DELETE FROM tentativas;"`.

### Três coisas que ficaram com o dono

1. ~~**A biografia da fundadora**~~ — **encerrado em 2026-08-20**. Conferi `appd.org.br`:
   não existe texto sobre Maria Claudete além da frase de que ela fundou, e o dono
   dispensou. A assimetria fica.
2. **O atendimento de manhã** — saiu do site junto com o bloco "Antes de começar". A
   constante segue em `shared/conteudo.ts`; se a informação importa, o lugar é
   `/atendimento`.
3. **A Fase 4** — o crachá impresso espera proposal próprio, e a palavra do dono depois
   de conferir esta leva de ajustes.

### Uma revogação registrada

Apagar as duas linhas do crachá **revoga o REQ-24 de `cracha-do-associado`**, que está
arquivada e validada. O comportamento não mudou — a geração segue local, no navegador —,
mas o requisito que obrigava a tela a dizer isso deixou de valer. Marcado na spec
arquivada, e o gate de aceite agora exige a **ausência** da frase.

---

## Decisões tomadas

- 2026-08-05 — Stack fechada: Nuxt 4 + Cloudflare Workers/D1 + Drizzle, tudo em free
  tier sem cartão. R2 descartado por exigir método de pagamento; foto do crachá vai
  como BLOB no D1, atrás de interface trocável.
- 2026-08-05 — Trilha "outra stack" da skill `novo-projeto`: sem template Copier
  (é Python-only); fundação mínima montada à mão.
- 2026-08-05 — Conta Cloudflare adiada: o spike da Fase 0 roda 100% local
  (miniflare/`wrangler --local`). Conta só quando for deployar.
- 2026-08-05 — Spike **aprovado**, stack confirmada: Drizzle+D1 e `scrypt` do
  `node:crypto` funcionam no workerd real. Registrado em `docs/adr/adr-001` e
  `adr-002`; código do spike removido no commit seguinte (fica no histórico, `b7e321d`).
- 2026-08-06 — **O formulário de atendimento cria a conta** (ADR-012). Acrescenta
  e-mail, CPF e senha às 15 perguntas; nenhuma das 15 muda. Conta é da pessoa
  atendida, uma por pessoa: mãe com dois filhos cria duas contas.
- 2026-08-06 — **Dono único por rota e por recurso** (ADR-013). Vale a fronteira do
  `openspec/README.md`. Exclusão de conta: uma página, um modal, e pronto.
- 2026-08-06 — **A inscrição é registro de interesse editável** (ADR-014). Não existe
  fila nem matrícula na APPD; o status tem um valor só, e a pessoa edita o próprio
  cadastro. ~~Painel de gerenciamento fica na V1.1.~~ **Superado em 2026-08-07**: o
  acesso de administrador entra na V1 e é a próxima change (ADR-016).

## Feito

- [x] Scaffold Nuxt 4.5 (`nuxi init -t minimal`), TS strict, `lang="pt-BR"`.
- [x] ESLint (@nuxt/eslint) + Prettier + Vitest com teste verde.
- [x] pre-commit com gitleaks bloqueante + prettier + eslint.
- [x] CI GitHub Actions: format, lint, typecheck, test + varredura de segredos.
- [x] Drizzle + wrangler configurados (D1 local).
- [x] `openspec/changes/` e `openspec/archive/` criados.

- [x] Spike: Drizzle+D1 e `scrypt` no runtime workerd — os dois passaram (ADR-001, ADR-002).
- [x] Repo público publicado: https://github.com/arthurbarbero/appd-sjc — CI verde.
- [x] Identidade dos commits usa o e-mail `noreply` do GitHub: repo público não expõe
      e-mail pessoal em metadado de commit.

## Aprendizados

- `gitleaks/gitleaks-action` varre o intervalo `<commit>^..HEAD` e **quebra no push
  inicial**, porque o primeiro commit não tem pai. Trocado pelo binário rodando
  `gitleaks git` sobre o histórico inteiro — mais simples e determinístico.
- Arquivo `.example` com valor de placeholder de alta entropia dispara a regra
  `generic-api-key`. Solução: valor vazio + allowlist por caminho em `.gitleaks.toml`.

- [x] Fase 1 — `docs/inventario-conteudo.md` (15 páginas varridas),
      `docs/campos-formulario.md`, `docs/arquitetura-informacao.md`,
      `docs/pendencias-appd.md`.
- [x] Conteúdo das nove landing pages em `docs/servicos/`, com fontes oficiais e
      marcações `[A CONFIRMAR]`. Índice e prioridades da revisão em
      `docs/servicos/README.md`.

## Decisões da Fase 2

- **Design system v2** (2026-08-05): a v1 herdava do site atual raio 0, borda marrom,
  ausência de sombra, superfície bege, rodapé oliva e rótulo em CAIXA ALTA — juntos,
  datavam a interface. Nenhum era requisito de acessibilidade. A v2 modernizou tudo
  isso mantendo AA em todos os pares. Marca preservada.
- **Atkinson Hyperlegible** como fonte única, desenhada para baixa visão.
- **Data de nascimento**: digitar é o caminho principal, calendário é atalho, com mês e
  ano em lista suspensa. Máscaras em telefone e data, não bloqueantes.
- **Ação destrutiva nunca preenchida**, e confirmação por caixas de seleção em vez de
  digitar palavra — teclar "EXCLUIR" é barreira para o público do site.

## Decisões da Fase 1 (a APPD pode derrubar)

- **Nove landing pages, uma por serviço e projeto** (decisão do dono, 2026-08-05 —
  substitui a proposta anterior de publicar só os três projetos com texto). Cada página
  tem conteúdo pesquisado sobre a área, com fontes, e marcações `[A CONFIRMAR]` no que
  descreve especificamente a APPD. A associação revisa antes de ir ao ar. Rascunhos em
  `docs/servicos/`.
  - Serviços (estão no formulário): `/atendimento/<slug>` — fisioterapia, psicologia,
    serviço social, orientações gerais, empréstimo de equipamentos.
  - Projetos (não estão no formulário): `/projetos/<slug>` — bocha paralímpica, mão na
    roda, artesão da inclusão, informática nota 10.
- **Não se inventa telefone nem chave PIX**, mesmo com autorização para usar
  placeholder: número plausível pode ser a linha de uma pessoa real, e PIX inventado
  manda dinheiro do doador para a conta de outro. Nesses dois campos, só dado real
  publicado ou marcação vazia.
- Cadastro de **pessoa com deficiência** é central e está no escopo, nas changes
  `cadastro-e-login` e `formulario-atendimento`. O que ficou de fora da V1 é cadastro de
  **voluntário**, que vira assunto no formulário de contato — cadastro sem ninguém para
  triar produz caixa de entrada abandonada.
- Rotas em pt-BR curtas (`/sobre`, `/doar`, `/atendimento`, `/projetos/<slug>`), com
  301 das URLs antigas que têm equivalente; as sem equivalente caem na 404 útil.
- Conteúdo vencido (evento de 2019, jantar de 2024) não migra.

## Fase 2 e implementação (2026-08-05)

- [x] DESIGN.md com a marca auditada contra WCAG AA; duas cores herdadas reprovaram e
      foram ajustadas.
- [x] Design system v2 (tokens, base, 8 previews) local e no Claude Design.
- [x] 16 prompts de tela; 9 telas geradas no canvas e importadas.
- [x] Site em Nuxt: home, hub de atendimento, 5 serviços, lista e 4 projetos, doações,
      contato, sobre, regimento, COMTRAD, 404 e o formulário de 15 campos.
- [x] PIX real: a chave é o CNPJ da associação. QR gerado do payload BR Code, com CRC
      conferido — **falta escanear com o app do banco antes de publicar**.
- [x] 36 imagens do site atual baixadas, distribuídas e comprimidas para WebP:
      8,3 MB → 1,4 MB (-83%). Logo: 289 KB → 45 KB.
- [x] Regimento interno e COMTRAD saem da orfandade e viram páginas de verdade.
- [x] Imagens comprimidas para WebP: 8,3 MB → 1,4 MB (-83%).
- [x] ADRs 003 (foto como BLOB no D1) e 004 (liberação imediata do crachá).

## Em aberto / próximos passos

- **CSS puro nunca foi decidido pelo dono** (apontado por ele em 2026-08-07). A folha de
  tokens e a base vieram do import do Claude Design em 2026-08-05 e ficaram como estão
  por inércia, não por escolha registrada. **Não é decisão tomada** — é estado de fato.
  Se virar decisão, vira ADR; se virar troca (Tailwind, UnoCSS, biblioteca de
  componentes), o custo é reescrever o estilo de 20 telas e refazer o gate de
  acessibilidade, porque as regras de foco, alvo e contraste hoje moram na folha base.

- [x] QR do PIX **conferido pelo dono em 2026-08-05**: escaneia e resolve.
- [x] Fotos do Sobre nós **confirmadas pelo dono**: a mulher é a fundadora Maria
      Claudete, o homem é o presidente Luiz Carlos.
- [x] Fase 3 — seis changes OpenSpec escritas, com 262 cenários Gherkin.
- [x] Gate do `revisor-spec` rodado: **reprovou as seis**, com 25 bloqueios nomeados.
      Parecer em `openspec/PARECER-GATE.md`. Fase 3 **não está fechada**.
- [x] **As três decisões de fundo, tomadas pelo dono em 2026-08-06** — viraram
      ADR-012 (cadastro embutido no formulário, uma conta por pessoa atendida),
      ADR-013 (dono único por rota e por recurso) e ADR-014 (a inscrição é registro de
      interesse editável, sem fila nem matrícula).
- [x] ~~Decidir quem lê as inscrições na V1.~~ **Premissa caiu**: a APPD não opera fila
      nem matrícula, e hoje só baixa a planilha. O problema não era falta de leitor, era
      a tela prometer fila. Ver ADR-014.
- [x] ~~Contradição `consentimentos.usuario_id NOT NULL` × formulário sem conta.~~
      Resolvida por construção no ADR-012: toda inscrição pertence a uma conta.
- [x] Change `modelo-de-dados` escrita — contrato único de tabela, coluna e chave.
      Resolve 10 dos 25 bloqueios do parecer.
- [x] **T4 da `modelo-de-dados`** — as seis changes reescritas contra o contrato, mais os
      dois itens transversais. Todas viraram v2.
- [x] Bloqueios de forma do parecer fechados: régua única de acessibilidade (B24),
      enumeração no bloqueio por tentativas (B13), contagem "17 URLs + a 404" (B3),
      ADRs renumerados nas tasks (B4, B8, B14, B18), `Exemplos:` em prosa virando tabela,
      zoom de 200% marcado `[manual]`, e as duas seções de Definition of Ready que
      faltavam (B19).
- [x] **T5** rodado: 4 bloqueios, todos fechados no mesmo dia. O mais grave era de
      produto, não de spec — o site ainda dizia a quem entrava que existe fila de vagas,
      com teste de aceite que falharia se a frase fosse removida. Corrigido em
      `shared/conteudo.ts` e nas nove páginas de serviço.
- [x] ~~**Revisor independente sobre `modelo-de-dados`** antes da primeira migration.~~
      **Sem objeto**: a migration foi aplicada em 2026-08-06 e a change foi arquivada em
      2026-08-07. Ficou como dívida assumida, não como pendência — está no parecer.
- [x] **T1 a T3 da `modelo-de-dados`** — schema com as 5 tabelas, migration versionada
      aplicada no D1 local, seed fictício e 39 testes. `npm run db:migrate` e
      `npm run db:seed` funcionam.
- [x] ~~**DECISÃO DO DONO, bloqueante: como guardar senha.**~~ **Decidida em 2026-08-06**:
      opção F do ADR-005 — o `scrypt` caro roda no navegador e o servidor guarda um
      SHA-256 com sal próprio. Está implementada e em produção. Este item continuou
      escrito como pendência bloqueante por um dia; corrigido em 2026-08-07.
- [x] ~~B2 — publicação do texto do presidente e das galerias.~~ **Fechado pelo dono**:
      a APPD autorizou marca e conteúdo, e a autorização inclui o texto com histórico
      clínico, os dois retratos e as galerias. Assunto encerrado; não reabrir.
- [x] ~~Escrever os ADRs 005, 006, 008 a 011.~~ **Todos escritos.** 005 em 2026-08-06;
      008 a 011 em 2026-08-07; 006 em 2026-08-07, com a decisão do dono de que conteúdo de
      página vive no código. A lista de reservados em `docs/adr/README.md` está zerada.
- [x] ~~**Pesquisar caminho gratuito de e-mail ou SMS** para "esqueci minha senha".~~
      **Pesquisado em 2026-08-07** (dez buscas) e virou [ADR-016]. O bloqueio nunca foi o
      provedor: **é o domínio**. MailChannels encerrou para Workers em 31/08/2024; o
      `send_email` da Cloudflare só alcança endereço verificado da própria conta; Resend e
      Brevo exigem verificação por DNS para escrever a destinatário arbitrário. Destrava
      com a publicação em `appd.org.br`.
- [ ] Telas ainda não implementadas: **Crachá** (`/area/cracha`), **Verificação pública**
      (`/verificar/<numero>`), **Política de Privacidade** e **Seus direitos**. Cadastro,
      Login e Área do Associado foram implementados em 2026-08-06 e estão no ar — este
      item os listava como pendentes até 2026-08-07.
- [ ] Auditoria completa das 9 telas do handoff: só a 404 foi revisada a fundo. Achados
      dela que valem para todas: Google Fonts por CDN (já corrigido na implementação),
      `<html>` sem `lang` e links de rede social inventados.
- [ ] Levar `docs/pendencias-appd.md` à associação — 4 respostas são P0 e travam
      telas: catálogo de serviços real, chave PIX, logo em vetor, e-mail do contato.
- [x] ~~Definir parâmetros do scrypt.~~ **Medido em 2026-08-06** e virou problema maior:
      ver ADR-005. O gatilho de "50 ms p95" do ADR-002 estava calibrado contra a coisa
      errada — o teto real é 10 ms de CPU por requisição no plano gratuito.
- [x] ~~Achar caminho de custo zero para e-mail de recuperação de senha (Fase 3).~~
      Item duplicado — o mesmo assunto está acima, com o detalhe do que comparar.
- [x] ~~AÇÃO DO DONO (quando for deployar): criar conta Cloudflare gratuita.~~ **Feita.**
      A conta existe, o D1 remoto está criado com id real em `wrangler.jsonc`, o
      subdomínio `appd-sjc.workers.dev` está registrado e o R2 continua desligado.
- [x] ~~**A foto opcional do formulário não foi implementada.**~~ **Entregue em 2026-08-07**,
      com o componente e o limite únicos de `cracha-do-associado`. Era: A spec de
      `formulario-atendimento` v2.1 registra, como decisão do dono de 2026-08-06, que a
      foto volta ao formulário como campo opcional (REQ-7d a REQ-7f). Não existe no código
      nem em `docs/campos-formulario.md`. Depende do componente de recorte, que é da Fatia
      3 de `cracha-do-associado`.

## Bugs / riscos conhecidos

- `npm audit` aponta 7 vulnerabilidades **só em dependência de desenvolvimento**
  (esbuild via drizzle-kit; undici via miniflare/wrangler). Nenhuma entra no bundle
  de produção. Revisar quando drizzle-kit/wrangler publicarem correção.
- ~~`wrangler.jsonc` tem `database_id` de placeholder.~~ **Resolvido em 2026-08-06**: o id
  do D1 real está lá e o deploy usa ele.
- **A logo diz "PESSOAS PORTADORAS DE DEFICIÊNCIAS"**. É a razão social registrada e
  não muda; mas o texto do site usa "pessoa com deficiência". Marca e texto vão
  divergir, e isso é conversa para a associação.
- **As cores da logo são azul, amarelo e verde.** O vermelho `#8b0000` do design system
  veio do CSS do site antigo, não da marca. Funciona, mas se o objetivo for conversar
  com a logo, trocar a cor de ação por um azul do emblema é mudar um token.
- **Texto institucional errado no site atual**: a página do Artesão afirma que
  "pesquisas comprovam" que a renda per capita das famílias de PcD é 50% a 70% menor.
  Essa pesquisa não existe — busca em IBGE, IPEA, OMS/Banco Mundial e literatura não
  achou nada. O rascunho usa IBGE/PNAD Contínua 2022 e sinaliza a diferença de recorte
  (renda do trabalho da pessoa, não per capita da família). A APPD precisa corrigir na
  origem.
- ~~Informática Nota 10 pode não existir.~~ **Resolvido em 2026-08-05**: o dono
  confirmou que viu o projeto funcionando presencialmente. A pesquisa não achou nenhuma
  evidência pública disso (única menção: matéria de novembro de 2021 sobre "Programa
  Inclusão Nota 10", outro nome, projeto "em preparação") — ou seja, é falha de
  divulgação, não projeto inativo. Segue em aberto: o nome correto, horários, turmas e
  quem ministra.

## Dívidas conscientes

- `shared/registro.ts` existe como teste de fumaça da fundação. A spec do número
  de registro está em `cadastro-e-login` (é lá que ele é gerado), não em
  `cracha-do-associado`, que só o exibe.

## Sessão de 2026-08-07 — o que mudou

Dia longo. O resumo do que ficou diferente do começo ao fim:

**Entregue**: `/area/dados` (alterar nome, telefone e endereço), QR Code da verificação
no crachá, CEP e telefone formatados no painel, os 21 pontos da revisão de interface
(fila de vagas, blocos inventados, cartões clicáveis, contato com botão de copiar,
`/sobre` completo, projetos como opção do formulário, logo no rodapé), botão "Sair" — que
não existia para uma rota de API pronta havia um dia.

**Consertado**: o cabeçalho na faixa de 861 a 900 px; entrar e sair sem atualizar o
estado de sessão no cliente; cadastro e login abertos para quem já tinha sessão; a tela
que redeclarava as três listas de escolha em vez de importá-las.

**Publicado**: o deploy falhava por a conta Cloudflare nunca ter registrado subdomínio
`workers.dev` — o Worker subia inteiro e morria no último passo. Registrado, com
`preview_urls` desligado.

**Rito**: o gate de spec virou auditoria mecânica e deixou de ser autorrevisão. Na primeira
execução reprovou dez checagens, nove defeito real — quatro ADRs citados e nunca escritos,
nove requisitos sem critério de aceite. Ela chegou a viver em `test/gate-spec.spec.ts` e
**saiu no fim do dia, por decisão do dono**: `npm test` é para código, não para o rito. O
checklist ficou em `openspec/PARECER-GATE-AUTOMATICO.md`, para a passada manual.

**Decidido pelo dono no fim do dia**: conteúdo de página vive no código, nunca em banco
(ADR-006). E a verificação pública passa a exibir foto e contato de cuidador, mantendo o
tipo de deficiência fora (ADR-015).

**Auditoria do registro**: 18 achados de documento desatualizado, todos corrigidos —
15 links relativos quebrados (12 apontando para `modelo-de-dados` depois de ela ir para
`archive/`), o `CLAUDE.md` descrevendo o scrypt no servidor quando ele roda no navegador,
o montador do design system lendo CSS de uma pasta que a limpeza esvaziou, as seis specs
ainda em "rascunho" depois do gate, e quatro tasks feitas e não marcadas.

**Limpeza**: `design-system/` saiu da raiz (CSS para `app/assets/css/`, galeria para
`docs/design-system/`); `shared/` achatado em quatro arquivos sem pasta; scripts do
`package.json` de 18 para 12; `parar-workerd.mjs` apagado depois de corrigir a causa —
o runner do aceite não derrubava a árvore de processos que abria.

**Registrado como aberto, não como decidido**: CSS puro nunca foi escolha do dono.

## Sessão de 2026-08-11 — o consentimento vira prova verificável

Sessão curta e de um assunto só: as tasks de `consentimento-e-privacidade` que **não**
dependem da APPD nem do canvas. T4, T5, T6 e T12 fechadas, mais metade da T11.

**O catálogo virou contrato** (`shared/termos.ts`): manifesto com `termo_id`, `versao`,
`data_vigencia`, `tipo_mudanca` e `hash`; `validarCatalogo` recusa no carregamento o que
estiver fora de formato; `versaoVigente` resolve por instante, e vigência futura não é
exigida antes da data; `precisaNovoAceite` separa mudança material de editorial;
`conferirIntegridade` recalcula o hash de cada versão a partir do texto.

**O teste de integridade é o que dá sentido ao resto.** Ele não confere um valor escrito à
mão: recalcula e compara com o declarado. Alterar uma letra de um termo já publicado deixa
o CI vermelho, que é como imutabilidade deixa de ser promessa e vira mecanismo. E há um
caso que adultera um catálogo de mentira para provar que a conferência **acusa** — gate que
não detecta o defeito que existe para detectar é carimbo.

**O que era gravado passou a sair do catálogo.** O envio leva o `termoHash` da versão que a
tela resolveu ao abrir, e o servidor grava a versão correspondente a **esse** hash, não a
vigente no instante do POST. Hash fora do catálogo é 422 pedindo releitura. Os dois 422
rodam no workerd real.

**O marcador de lugar tinha um sobrevivente.** `excluir.post.ts` gravava a revogação com
`hash: '0'.repeat(64)` e `versao: 'v1'` fixa — o mesmo defeito que tinha saído do cadastro
quatro dias antes, intacto na rota vizinha. Agora a revogação aponta para o termo que a
pessoa aceitou, lido do histórico dela. Foi achado procurando outra coisa, o que é o
argumento a favor de varrer o repositório inteiro atrás de um padrão em vez de corrigir
onde ele foi visto.

**Duas ressalvas escritas em vez de escondidas:**

1. O bloco 7 do formulário exibe uma **paráfrase** do termo, não o texto do catálogo. O
   hash é do catálogo. "Hash do que foi exibido" só fica literalmente verdadeiro quando a
   T7 trocar o bloco pelo componente que renderiza o texto versionado — e T7 depende do
   design.
2. O cenário "mudança material exige novo aceite" está fechado na **regra** e aberto na
   **tela**: o aviso no próximo acesso autenticado é interface, e interface espera o canvas.

**Números**: `npm test` de 159 para 201; `npm run aceite` de 143 para 148.

### Segunda leva do dia — o design chegou

O dono gerou `/privacidade` e `/seus-direitos` no canvas, e as duas foram lidas por
DesignSync e auditadas em `docs/handoff-design-privacidade.md`. **T3 fechada**, e com ela
caiu o bloqueio de T7 a T13.

**O prompt reescrito valeu o tempo.** A v2 saiu horas antes de o canvas rodar, e nenhum dos
cinco defeitos que a v1 teria produzido apareceu nas telas — a seção de guarda diz o que o
ADR-017 decidiu em vez de fingir pendência, a frase da foto é a estreita e correta, e o
fluxo de exclusão em três telas não voltou.

**`/privacidade` está no ar** (T8): 12 seções, sumário e títulos saindo da mesma lista, e a
versão do termo no topo lida do catálogo em vez de digitada.

**O gate pegou o que o teste de texto deixou passar.** "Cinco linhas renderizadas" tinha
virado "320 caracteres" no vitest, que é chute. A 360px, seis parágrafos passavam de cinco
linhas. A medida certa é a do navegador — altura do parágrafo dividida pela entrelinha —, e
ela agora roda no aceite. O teto do teste de texto virou 200, calibrado contra ela.

**A decisão que travava a T10 foi tomada pelo dono no mesmo dia**: retirar o consentimento
**apaga** o tipo de deficiência, e o campo passa a guardar a palavra "Não consentido". Em
vez de relaxar o `CHECK` do banco — que era a recomendação —, o contrato de dados fica
intacto e o campo diz **por que** está vazio. Campo em branco se leria como "nunca
respondeu"; este valor se lê como "respondeu e depois retirou".

O custo está escrito: é um valor especial num campo de vocabulário fechado, e quem lê
precisa saber que ele existe. Contido por três coisas — a constante única, o
`semConsentimento()` por onde toda leitura passa, e o `z.enum` que impede a palavra de
entrar pelo formulário.

**`/seus-direitos` no ar** (T9 e T10): os dados guardados na tela, o histórico de
consentimento com versão, data e impressão digital, a cópia em JSON, e a retirada em dois
cliques. A retirada faz três coisas numa transação só — apaga o campo 12, desliga o opt-in
de exibição (senão "Não consentido" apareceria na página pública) e grava a revogação.

**Voltar atrás é consentir de novo**: a tela de correção recusa com 422 quem informa a
deficiência de novo sem autorizar de novo, e grava o aceite junto com a correção. Sem isso,
o histórico diria que o dado voltou sozinho.

**T11 fechada**: o bloco "O que a associação precisa manter" passou a dizer por que cada
item fica, com a base legal, e perdeu o `[A CONFIRMAR]` do prazo — a PB-1 caiu com o
ADR-017, e pendência onde já existe decisão é pendência falsa.
