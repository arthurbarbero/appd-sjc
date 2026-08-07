/**
 * Limite de frequência por identificador, com a chave sempre em HMAC.
 *
 * Regra única do projeto (`modelo-de-dados` REQ-30, `cracha-do-associado` REQ-33a): o
 * identificador — IP na inscrição e na verificação, e-mail normalizado no login — **nunca**
 * é gravado em claro. Um mecanismo antienumeração que guardasse os e-mails tentados seria
 * ele mesmo a lista que se quer proteger, e um que guardasse IP viraria registro de quem
 * visitou um site de associação de pessoas com deficiência.
 *
 * O segredo vive em Cloudflare Secrets. Sem ele a aplicação **recusa contar**, e a rota
 * decide o que fazer — nunca conta em claro por falta de chave.
 */

import { and, eq, gte, sql } from 'drizzle-orm'
import type { H3Event } from 'h3'
import type { Banco } from './bd'

export type EscopoLimite = 'inscricao' | 'verificacao' | 'login'

/**
 * Endereço de quem pediu, na ordem em que a Cloudflare o entrega.
 *
 * `cf-connecting-ip` é posto pela borda e não é falsificável pelo cliente;
 * `x-forwarded-for` entra como segundo, para o `wrangler dev` local ter algo.
 */
export function ipDoPedido(event: H3Event): string {
  const cabecalhos = getRequestHeaders(event)
  const encaminhado = cabecalhos['x-forwarded-for']?.split(',')[0]?.trim()
  return cabecalhos['cf-connecting-ip'] || encaminhado || '0.0.0.0'
}

/** `HMAC-SHA-256(<identificador>, segredo)` em hexadecimal — o formato que o `CHECK` exige. */
export async function chaveHmac(valor: string, segredo: string): Promise<string> {
  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const assinatura = await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(valor))
  return [...new Uint8Array(assinatura)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function segredoDoLimite(event: H3Event): string {
  const env = event.context.cloudflare?.env as { LIMITE_SEGREDO?: string } | undefined
  const segredo = env?.LIMITE_SEGREDO ?? process.env.LIMITE_SEGREDO
  if (!segredo) {
    throw createError({
      statusCode: 503,
      statusMessage: 'LIMITE_SEGREDO ausente: sem ele não há como contar sem gravar IP em claro.',
    })
  }
  return segredo
}

export interface Limite {
  escopo: EscopoLimite
  /** Quantas requisições cabem na janela. */
  maximo: number
  /** Tamanho da janela, em segundos. */
  janelaSegundos: number
}

/**
 * Registra a tentativa e diz se ela estourou o limite.
 *
 * Conta **antes** de responder, e conta também a tentativa que estoura: quem insiste
 * durante o bloqueio continua bloqueado, em vez de zerar o contador ao parar por um
 * instante.
 *
 * Limpa o que passou da janela na mesma ida ao banco. Sem isso a tabela cresceria para
 * sempre num plano gratuito com cota de linhas.
 */
export async function registrarTentativa(
  event: H3Event,
  bd: Banco,
  identificador: string,
  limite: Limite,
): Promise<{ excedeu: boolean }> {
  const chave = await chaveHmac(identificador, segredoDoLimite(event))
  const agora = Date.now()
  const iso = (ms: number) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z')
  const inicioJanela = iso(agora - limite.janelaSegundos * 1000)

  await bd
    .delete(schema.tentativas)
    .where(
      and(
        eq(schema.tentativas.escopo, limite.escopo),
        sql`${schema.tentativas.criadoEm} < ${inicioJanela}`,
      ),
    )

  await bd.insert(schema.tentativas).values({
    chaveHash: chave,
    escopo: limite.escopo,
    criadoEm: iso(agora),
  })

  const [linha] = await bd
    .select({ total: sql<number>`count(*)` })
    .from(schema.tentativas)
    .where(
      and(
        eq(schema.tentativas.chaveHash, chave),
        eq(schema.tentativas.escopo, limite.escopo),
        gte(schema.tentativas.criadoEm, inicioJanela),
      ),
    )

  return { excedeu: (linha?.total ?? 0) > limite.maximo }
}
