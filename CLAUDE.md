# CLAUDE.md — appd-sjc

Site novo da **APPD-SJC** (Associação das Pessoas com Deficiência de São José dos
Campos, CNPJ 08.074.883/0001-96). Site atual: appd.org.br. Temos autorização da
associação para usar marca e conteúdo. Repo **público**; custo de operação **R$ 0**.

## Stack

Nuxt 4 + Vue 3 + TS strict · Nitro preset `cloudflare_module` · Cloudflare D1 +
Drizzle (migrations versionadas) · auth com `nuxt-auth-utils` + scrypt (`node:crypto`,
`nodejs_compat`) · foto do crachá como BLOB no D1 (R2 exige cartão) atrás da interface
`ArmazenamentoFoto` · Vitest + axe.

## Comandos

```bash
npm run dev              # Nuxt dev
npm test                 # Vitest
npm run lint             # ESLint
npm run typecheck        # vue-tsc
npm run db:generate      # Drizzle → drizzle/migrations
npm run db:aplicar:local # wrangler d1 migrations apply --local
npm run cf:dev           # build + wrangler dev (runtime workerd real)
```

## Regra central

**Nenhuma tela é implementada antes de o design dela ser aprovado no Claude Design.**
Ordem: design system → tela no canvas → aprovação do dono → handoff bundle →
implementação. Faltou design? PARE e peça. O dono opera o canvas; o Claude Code
prepara tokens/prompts e consome o bundle — não gera tela sozinho.

## Inegociáveis

- **Acessibilidade WCAG 2.2 AA é o produto**, não checklist: contraste AA, foco
  visível, teclado 100%, ARIA correto, alvo ≥44px, `prefers-reduced-motion`, texto
  base ≥17px, nada sinalizado só por cor. Critério de aceite bloqueante por tela.
- **LGPD**: tipo de deficiência é dado sensível (Art. 11). Consentimento específico e
  destacado, com versão do termo e data/hora do aceite registrados.
- **Repo público**: zero credencial, zero foto, zero dado de pessoa real versionado.
  Segredos só em Cloudflare Secrets; `.dev.vars` e `.env` fora do git; gitleaks no
  pre-commit e no CI. Seed só com dado fictício explícito.
- **Deploy** só em `*.workers.dev` até a APPD aprovar. Nada no domínio deles sem OK.
- pt-BR em tudo: código, commits, docs, UI.

## Rito

OpenSpec: cada mudança vira `openspec/changes/<slug>/{proposal,spec,tasks}.md` com
critérios Gherkin (inclusive os de acessibilidade); ao concluir e passar no gate, move
para `openspec/archive/`. Decisões estruturais viram ADR em `docs/adr/`.
Estado do projeto em `PROGRESS.md` — atualizar antes de encerrar sessão.

## Estrutura

```
app/          # Vue — assets/css/ (tokens e base), components/, layouts/,
              #   middleware/, pages/, utils/. Telas só depois do handoff de design.
server/       # api/, database/schema.ts, middleware/, utils/
shared/       # domínio puro compartilhado (auto-import Nuxt 4)
drizzle/      # migrations SQL versionadas
public/       # servido como está
test/         # Vitest, mais o gate de aceite em test/aceite/
docs/         # inventário, ADRs, pendências da APPD, prompts e galeria do design system
openspec/     # o rito: changes/ e archive/
scripts/      # utilitários de desenvolvimento chamados pelos comandos npm
```

## O que NÃO fazer

- Não improvisar layout nem "adiantar o HTML" antes do design aprovado.
- Não trocar D1/Workers por serviço que peça cartão (inclui R2).
- Não alterar os 15 campos do formulário de atendimento — réplica fiel do form real
  (rótulos, ordem, obrigatoriedade). Fonte: `docs/campos-formulario.md`.
- Não expor no `/verificar/<numero>` nada além de nome, número e status.
- Não commitar `.output`, `.wrangler`, banco local ou foto.
