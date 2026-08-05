# ADR-001: Cloudflare Workers + D1 como plataforma do site

Status: Aceito
Data: 2026-08-05
Decisores: Arthur Barbero (dono do projeto), Claude Code (execução do spike)

## Contexto

O site é de uma associação sem fins lucrativos. A restrição mais dura não é técnica, é
financeira e operacional: **custo de operação R$ 0 e sem cartão de crédito
cadastrado**, porque não há quem banque nem quem administre uma cobrança recorrente. O
site precisa de banco de dados (cadastro de associado, inscrições de atendimento,
crachá), não só de páginas estáticas. Também precisa sobreviver a uma troca de mãos: o
projeto será entregue à APPD, então a plataforma tem que ser administrável por alguém
que não é desenvolvedor.

## Decisão

Vamos usar **Cloudflare Workers** (Nuxt 4 com Nitro no preset `cloudflare_module`)
com **Cloudflare D1** (SQLite) e **Drizzle ORM** com migrations versionadas, porque o
free tier cobre folgado o volume da associação, não exige método de pagamento, e o
desenvolvimento roda 100% local sem conta nenhuma.

## Alternativas consideradas

| Alternativa                      | Prós                              | Contras                                                               | Por que NÃO                                                                    |
| -------------------------------- | --------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Site estático + Google Forms     | custo zero real, zero manutenção  | sem crachá, sem área do associado, dado sensível num form de terceiro | não entrega o produto; e joga dado de saúde num serviço fora do nosso controle |
| Vercel/Netlify + Postgres (Neon) | DX excelente, Postgres de verdade | free tier de banco com pausa/expiração; upgrade pede cartão           | risco de o banco sumir ou pedir pagamento sem ninguém para responder           |
| VPS barata (Hetzner/Oracle)      | controle total                    | custo mensal, patch de SO, backup, alguém de plantão                  | não existe custo mensal aceitável nem quem opere depois da entrega             |
| Cloudflare Workers + R2 p/ fotos | storage de objeto próprio, barato | **R2 exige método de pagamento cadastrado**                           | quebra a restrição inegociável — ver ADR de armazenamento de foto (Fase 3)     |

## Consequências

- **Positivas**: custo zero verificado; deploy por `wrangler` sem cartão; SQLite via D1
  é mais que suficiente para o volume; desenvolvimento offline com miniflare, o que
  significa que qualquer voluntário clona e roda sem pedir credencial a ninguém.
- **Negativas / dívida**:
  - Lock-in real no D1 e nos bindings da Cloudflare. Sair implica reescrever a camada
    de dados (o Drizzle amortece, mas não zera).
  - Runtime workerd não é Node: nem toda biblioteca npm funciona. Precisa de
    `nodejs_compat` e de spike antes de adotar dependência que toque em I/O ou crypto.
  - Limites do free tier: 100 mil requisições/dia, 5 milhões de linhas lidas/dia,
    500 MB de banco. Confortável hoje; não é infinito.
  - A conta Cloudflare ainda não existe. Até criá-la, `database_id` no
    `wrangler.jsonc` é um placeholder e nada foi deployado.
- **Gatilho de revisão**: se o banco passar de ~350 MB, se o free tier de requisições
  for estourado com regularidade, ou se a Cloudflare passar a exigir cartão para
  Workers/D1 — reabrir e comparar com hospedagem doada.

## Evidência (spike, timebox 30 min)

Commit `b7e321d`. Rodado com `wrangler dev` — runtime **workerd real**, não o dev
server do Nuxt:

- Migration gerada pelo `drizzle-kit generate` e aplicada com
  `wrangler d1 migrations apply appd-sjc --local`: 2 comandos executados com sucesso.
- Rota Nitro gravando e lendo no D1 via Drizzle (`drizzle-orm/d1`), com o binding
  chegando em `event.context.cloudflare.env.DB`: `{"d1":{"ok":true,...}}`.
- **Nenhuma conta Cloudflare foi criada** para nada disso. O modo local não pede login.
