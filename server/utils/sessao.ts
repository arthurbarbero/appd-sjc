/**
 * Sessão em cookie selado (ADR-002), sobre `nuxt-auth-utils`.
 *
 * Não há tabela de sessão, e isso é decisão registrada (`modelo-de-dados` REQ-33): o
 * cookie carrega o pouco que precisa, selado com a chave que só o servidor tem.
 *
 * A dívida aceita no ADR-002: **cookie selado não é revogável**. Um cookie roubado vale
 * até expirar, e "Sair" apaga o cookie deste aparelho, não a sessão de outro. A tela diz
 * isso em vez de prometer o contrário (REQ-14).
 */

import type { H3Event } from 'h3'

/**
 * O que entra no selo. Nunca senha, hash, e-mail, endereço ou dado de saúde (REQ-11) —
 * cookie vai e volta em toda requisição e mora no disco do aparelho.
 */
export interface DadosSessao {
  id: string
  numeroRegistro: string
  primeiroNome: string
  emitidaEm: string
}

/** 7 dias (REQ-12): prazo curto justamente porque não dá para revogar. */
export const DURACAO_SESSAO_SEGUNDOS = 7 * 24 * 60 * 60

export async function abrirSessao(event: H3Event, dados: DadosSessao): Promise<void> {
  await setUserSession(event, { user: dados }, { maxAge: DURACAO_SESSAO_SEGUNDOS })
}

export async function fecharSessao(event: H3Event): Promise<void> {
  await clearUserSession(event)
}

/**
 * Sessão do pedido, ou `null`.
 *
 * Cookie ausente, adulterado e expirado dão o mesmo resultado de propósito (REQ-12):
 * distinguir os três na resposta conta ao visitante coisas sobre o servidor.
 */
export async function sessaoAtual(event: H3Event): Promise<DadosSessao | null> {
  try {
    const sessao = await getUserSession(event)
    const usuario = sessao?.user as DadosSessao | undefined
    return usuario?.id ? usuario : null
  } catch {
    return null
  }
}
