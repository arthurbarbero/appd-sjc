# PROGRESS — appd-sjc

Estado vivo do projeto. Atualizar ao fim de cada sessão.

## Agora

**No ar em <https://appd-sjc.appd-sjc.workers.dev>** (v0.2.0, 2026-08-07) — publicado a
cada push na `main`, depois de prettier, eslint, vue-tsc, vitest e gitleaks passarem.
Endereço de demonstração: o banco por trás dele não é de produção, e nada vai para o
domínio da APPD antes de a associação revisar.

O ciclo de conta funciona ponta a ponta — cadastrar, entrar, ver a área, corrigir os
próprios dados, sair e excluir a conta —, percorrido **contra produção**, não só local.

**Duas changes arquivadas**, as primeiras: `modelo-de-dados` e `revisao-de-interface`.

**O gate deixou de depender de leitura.** Três comandos dizem o estado em dois minutos:

| Comando          | O que cobre                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `npm test`       | 155 testes — restrição de banco, emissão concorrente, regressão de interface e a auditoria mecânica das specs                        |
| `npm run aceite` | 78 verificações no workerd real: ciclo de conta, sete larguras, axe A/AA em dez telas. Aceita `APPD_BASE` para rodar contra produção |
| CI               | os dois acima, mais prettier, eslint, vue-tsc e gitleaks no histórico completo                                                       |

**Próximo passo**: fechar `site-institucional` (19 tasks, quase todas de medição e SEO,
nenhuma dependendo de terceiro) e mapear os cenários de `cadastro-e-login`,
`formulario-atendimento` e `area-do-associado` para onde eles já rodam — o caminho está
em `openspec/PARECER-GATE-AUTOMATICO.md`.

**O que trava o resto**: `cracha-do-associado` espera o design das dez telas (T0.4);
`consentimento-e-privacidade` espera o ADR-006; a redefinição de senha espera um caminho
de e-mail ou SMS gratuito, ainda em pesquisa — e é a lacuna mais séria do que está no ar,
porque hoje quem esquece a senha perde a conta.

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
  cadastro. Painel de gerenciamento por perfil fica nomeado como escopo da V1.1.

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
- [ ] **Revisor independente sobre `modelo-de-dados`** antes da primeira migration. O
      T5 foi autorrevisão e está declarado como tal no parecer.
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
- [ ] Escrever os ADRs 005, 006, 008 a 011 (ver `docs/adr/README.md`). O 007 foi
      liberado: o protocolo `ATD-` perdeu a função com o cadastro embutido.
- [ ] **Pesquisar caminho gratuito de e-mail ou SMS** para "esqueci minha senha"
      (pedido do dono, 2026-08-06). Com o cadastro embutido, toda pessoa tem senha, e
      sem esse caminho **o login não pode ir ao ar**. Restrição: custo zero, sem cartão.
      Comparar pelo menos serviço de e-mail transacional com plano gratuito, envio pelo
      próprio Worker e alternativas de SMS — com data, limite mensal e se exige cartão.
      Nenhuma conta externa criada sem o dono mandar.
- [ ] Telas ainda não implementadas: Cadastro, Login, Área do Associado, Crachá,
      Verificação pública e Política de Privacidade. Prompts prontos em
      `docs/prompts-design/`.
- [ ] Auditoria completa das 9 telas do handoff: só a 404 foi revisada a fundo. Achados
      dela que valem para todas: Google Fonts por CDN (já corrigido na implementação),
      `<html>` sem `lang` e links de rede social inventados.
- [ ] Levar `docs/pendencias-appd.md` à associação — 4 respostas são P0 e travam
      telas: catálogo de serviços real, chave PIX, logo em vetor, e-mail do contato.
- [x] ~~Definir parâmetros do scrypt.~~ **Medido em 2026-08-06** e virou problema maior:
      ver ADR-005. O gatilho de "50 ms p95" do ADR-002 estava calibrado contra a coisa
      errada — o teto real é 10 ms de CPU por requisição no plano gratuito.
- [ ] Achar caminho de custo zero para e-mail de recuperação de senha (Fase 3).
- [ ] AÇÃO DO DONO (quando for deployar): criar conta Cloudflare gratuita. NÃO ativar R2.

## Atrito de ambiente resolvido (2026-08-06)

## Bugs / riscos conhecidos

- `npm audit` aponta 7 vulnerabilidades **só em dependência de desenvolvimento**
  (esbuild via drizzle-kit; undici via miniflare/wrangler). Nenhuma entra no bundle
  de produção. Revisar quando drizzle-kit/wrangler publicarem correção.
- `wrangler.jsonc` tem `database_id` de placeholder — trocar pelo id real depois de
  `wrangler d1 create appd-sjc`.
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

**Rito**: o gate de spec virou `test/gate-spec.spec.ts` e deixou de ser autorrevisão. Na
primeira execução reprovou dez checagens, nove defeito real — quatro ADRs citados e nunca
escritos, nove requisitos sem critério de aceite.

**Limpeza**: `design-system/` saiu da raiz (CSS para `app/assets/css/`, galeria para
`docs/design-system/`); `shared/` achatado em quatro arquivos sem pasta; scripts do
`package.json` de 18 para 12; `parar-workerd.mjs` apagado depois de corrigir a causa —
o runner do aceite não derrubava a árvore de processos que abria.

**Registrado como aberto, não como decidido**: CSS puro nunca foi escolha do dono.
