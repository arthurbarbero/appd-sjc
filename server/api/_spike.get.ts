import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { drizzle } from 'drizzle-orm/d1'
import { desc } from 'drizzle-orm'
import { spikePing } from '../database/schema'

/**
 * TEMPORÁRIO — spike da Fase 0. Prova, no runtime real do Workers:
 *   1. Drizzle gravando e lendo no D1;
 *   2. scrypt do node:crypto fazendo hash e verify sob `nodejs_compat`.
 * Some assim que o ADR for escrito.
 */

interface AmbienteCloudflare {
  DB: D1Database
}

function hash(senha: string, sal: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(senha, sal, 64, (erro, derivada) => (erro ? reject(erro) : resolve(derivada)))
  })
}

export default defineEventHandler(async (event) => {
  const resultado: Record<string, unknown> = {}

  // --- 1. D1 + Drizzle ---
  try {
    const env = event.context.cloudflare?.env as unknown as AmbienteCloudflare | undefined
    if (!env?.DB) throw new Error('binding DB ausente em event.context.cloudflare.env')

    const db = drizzle(env.DB)
    const agora = new Date().toISOString()
    await db.insert(spikePing).values({ mensagem: 'ping do spike', criadoEm: agora })
    const linhas = await db.select().from(spikePing).orderBy(desc(spikePing.id)).limit(3)

    resultado.d1 = { ok: true, total_lido: linhas.length, ultima: linhas[0] }
  } catch (erro) {
    resultado.d1 = { ok: false, erro: (erro as Error).message }
  }

  // --- 2. scrypt do node:crypto ---
  try {
    const sal = randomBytes(16)
    const senha = 'senha-de-teste-do-spike'
    const derivada = await hash(senha, sal)
    const confere = timingSafeEqual(derivada, await hash(senha, sal))
    const recusaErrada = !timingSafeEqual(derivada, await hash('senha-errada', sal))

    resultado.scrypt = {
      ok: confere && recusaErrada,
      confere,
      recusaErrada,
      bytes: derivada.length,
    }
  } catch (erro) {
    resultado.scrypt = { ok: false, erro: (erro as Error).message }
  }

  return resultado
})
