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

## Em aberto / próximos passos

- [ ] Fase 1 — discovery e inventário de conteúdo de appd.org.br.
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

## Dívidas conscientes

- `shared/utils/registro.ts` existe como teste de fumaça da fundação; a spec de
  verdade do número de registro nasce na change `cracha-do-associado` (Fase 3).
