# PROGRESS — appd-sjc

Estado vivo do projeto. Atualizar ao fim de cada sessão.

## Agora

Fase 1 concluída. Próxima: Fase 2 — DESIGN no Claude Design (nenhuma tela antes disso).

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

## Em aberto / próximos passos

- [ ] Fase 2 — DESIGN. Começa por `npx brandmd https://www.appd.org.br` e pelo
      DESIGN.md; nenhuma tela é implementada antes da aprovação no Claude Design.
- [ ] Levar `docs/pendencias-appd.md` à associação — 4 respostas são P0 e travam
      telas: catálogo de serviços real, chave PIX, logo em vetor, e-mail do contato.
- [ ] Definir parâmetros do scrypt (N, r, p) na change `cadastro-e-login` — o spike usou
      os padrões do `node:crypto`, que não foram medidos contra o limite de CPU do Worker.
- [ ] Achar caminho de custo zero para e-mail de recuperação de senha (Fase 3).
- [ ] AÇÃO DO DONO (quando for deployar): criar conta Cloudflare gratuita. NÃO ativar R2.

## Bugs / riscos conhecidos

- `npm audit` aponta 7 vulnerabilidades **só em dependência de desenvolvimento**
  (esbuild via drizzle-kit; undici via miniflare/wrangler). Nenhuma entra no bundle
  de produção. Revisar quando drizzle-kit/wrangler publicarem correção.
- `wrangler.jsonc` tem `database_id` de placeholder — trocar pelo id real depois de
  `wrangler d1 create appd-sjc`.
- **Texto institucional errado no site atual**: a página do Artesão afirma que
  "pesquisas comprovam" que a renda per capita das famílias de PcD é 50% a 70% menor.
  Essa pesquisa não existe — busca em IBGE, IPEA, OMS/Banco Mundial e literatura não
  achou nada. O rascunho usa IBGE/PNAD Contínua 2022 e sinaliza a diferença de recorte
  (renda do trabalho da pessoa, não per capita da família). A APPD precisa corrigir na
  origem.
- **Informática Nota 10 pode não existir.** Única menção fora do site: matéria de
  novembro de 2021 sobre "Programa Inclusão Nota 10" — outro nome — como projeto que
  ainda ia começar. A página só vai ao ar se a associação confirmar.

## Dívidas conscientes

- `shared/utils/registro.ts` existe como teste de fumaça da fundação; a spec de
  verdade do número de registro nasce na change `cracha-do-associado` (Fase 3).
