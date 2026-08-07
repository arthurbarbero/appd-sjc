/**
 * Acesso ao D1 — um lugar só, para nenhuma rota montar a conexão do seu jeito.
 *
 * O binding `DB` vem de `wrangler.jsonc` e chega pelo contexto do Worker. Em
 * desenvolvimento com `nuxt dev` ele não existe: aí a rota devolve 503 com mensagem que
 * diz o que fazer, em vez de estourar com "cannot read property of undefined".
 */

import { drizzle, type AnyD1Database, type DrizzleD1Database } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'
import * as schema from '../database/schema'

export type Banco = DrizzleD1Database<typeof schema>

export function usarBanco(event: H3Event): Banco {
  const d1 = (event.context.cloudflare?.env as { DB?: AnyD1Database } | undefined)?.DB
  if (!d1) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'Banco indisponível: rode com `npm run preview` (workerd) em vez de `npm run dev`.',
    })
  }
  return drizzle(d1, { schema })
}

export { schema }
