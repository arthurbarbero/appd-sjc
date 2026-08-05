# appd-sjc

Site da **APPD-SJC** — Associação das Pessoas com Deficiência de São José dos Campos
(CNPJ 08.074.883/0001-96, fundada em 2006).

Projeto voluntário, em desenvolvimento, feito com autorização da associação para uso
de marca e conteúdo. **Ainda não é o site oficial** — o site no ar é
[appd.org.br](https://www.appd.org.br).

## Princípios

- **Acessibilidade WCAG 2.2 AA é o produto**, não um item de checklist. Toda tela é
  avaliada por contraste, navegação por teclado, foco visível, ARIA e leitor de tela
  antes de ser considerada pronta.
- **Custo zero de operação.** A associação não paga hospedagem: tudo roda no free
  tier da Cloudflare (Workers + D1), sem cartão cadastrado.
- **LGPD levada a sério.** O cadastro coleta dado de saúde (tipo de deficiência), que
  é dado sensível pelo Art. 11 — com consentimento específico, destacado e registrado.
- **Privacidade no repositório.** Este repo é público e não contém nenhuma
  credencial, foto ou dado de pessoa real. Seeds usam dados fictícios explícitos.

## Stack

Nuxt 4 · Vue 3 · TypeScript strict · Cloudflare Workers (Nitro preset
`cloudflare_module`) · Cloudflare D1 (SQLite) com Drizzle ORM · Vitest.

## Rodando localmente

Requisitos: Node 22+ e npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

Qualidade:

```bash
npm run lint         # ESLint
npm run typecheck    # vue-tsc
npm test             # Vitest
npm run format       # Prettier
```

Runtime real do Cloudflare (workerd) com banco D1 local:

```bash
npm run db:aplicar:local   # aplica as migrations no SQLite local
npm run cf:dev             # build + wrangler dev
```

Nenhuma conta Cloudflare é necessária para desenvolver: o `wrangler` simula Workers e
D1 localmente.

## Como contribuir

O projeto segue um rito de spec (`openspec/`) e uma regra dura: **nenhuma tela é
implementada antes de o design dela ser aprovado**. Antes de abrir PR, leia
[CLAUDE.md](CLAUDE.md) — ele resume as regras do repositório — e rode lint, typecheck
e testes.

Bugs de acessibilidade têm prioridade sobre qualquer outra coisa.

## Licença

A definir junto com a APPD-SJC. O código será aberto; marca, logo, fotos e textos
institucionais pertencem à associação e não estão cobertos pela licença do código.
