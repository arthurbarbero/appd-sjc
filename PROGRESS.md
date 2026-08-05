# PROGRESS — appd-sjc

Estado vivo do projeto. Atualizar ao fim de cada sessão.

## Agora

Fase 0 — Fundação.

## Decisões tomadas

- 2026-08-05 — Stack fechada: Nuxt 4 + Cloudflare Workers/D1 + Drizzle, tudo em free
  tier sem cartão. R2 descartado por exigir método de pagamento; foto do crachá vai
  como BLOB no D1, atrás de interface trocável.
- 2026-08-05 — Trilha "outra stack" da skill `novo-projeto`: sem template Copier
  (é Python-only); fundação mínima montada à mão.
- 2026-08-05 — Conta Cloudflare adiada: o spike da Fase 0 roda 100% local
  (miniflare/`wrangler --local`). Conta só quando for deployar.

## Feito

- [x] Scaffold Nuxt 4.5 (`nuxi init -t minimal`), TS strict, `lang="pt-BR"`.
- [x] ESLint (@nuxt/eslint) + Prettier + Vitest com teste verde.
- [x] pre-commit com gitleaks bloqueante + prettier + eslint.
- [x] CI GitHub Actions: format, lint, typecheck, test + varredura de segredos.
- [x] Drizzle + wrangler configurados (D1 local).
- [x] `openspec/changes/` e `openspec/archive/` criados.

## Em aberto / próximos passos

- [ ] Spike: rota Nitro gravando e lendo no D1 local + `scrypt` do `node:crypto` no
      runtime workerd (`nodejs_compat`). Resultado vira ADR.
- [ ] `gh repo create appd-sjc --public --source=. --push`.
- [ ] Fase 1 — discovery e inventário de conteúdo de appd.org.br.
- [ ] AÇÃO DO DONO (quando for deployar): criar conta Cloudflare gratuita. NÃO ativar R2.

## Bugs / riscos conhecidos

- `npm audit` aponta 7 vulnerabilidades **só em dependência de desenvolvimento**
  (esbuild via drizzle-kit; undici via miniflare/wrangler). Nenhuma entra no bundle
  de produção. Revisar quando drizzle-kit/wrangler publicarem correção.
- `wrangler.jsonc` tem `database_id` de placeholder — trocar pelo id real depois de
  `wrangler d1 create appd-sjc`.

## Dívidas conscientes

- `shared/utils/registro.ts` existe como teste de fumaça da fundação; a spec de
  verdade do número de registro nasce na change `cracha-do-associado` (Fase 3).
