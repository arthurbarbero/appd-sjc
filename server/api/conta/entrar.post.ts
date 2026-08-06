/**
 * `POST /api/conta/entrar` — login.
 *
 * A regra que organiza este arquivo inteiro: **nada aqui pode revelar se um e-mail tem
 * conta** (REQ-25). Mesma mensagem, mesmo status, mesmo corpo e mesmo tempo para senha
 * errada e para e-mail inexistente. Por isso o `gastarTempoEquivalente` quando a conta
 * não existe — sem ele, o relógio responde o que a mensagem esconde.
 */

import { eq } from 'drizzle-orm'
import { normalizaEmail } from '~~/shared/auth/derivacao'

const MENSAGEM_UNICA = 'E-mail ou senha não confere. Confira e tente de novo.'

export default defineEventHandler(async (event) => {
  const bd = usarBanco(event)
  const corpo = await readBody(event)

  const email = normalizaEmail(String(corpo?.email ?? ''))
  const chave = String(corpo?.chaveDerivada ?? '')

  if (!email || !/^[0-9a-f]{64}$/.test(chave)) {
    throw createError({ statusCode: 401, data: { mensagem: MENSAGEM_UNICA } })
  }

  const conta = await bd.query.usuarios.findFirst({
    where: eq(schema.usuarios.email, email),
  })

  // Conta inexistente ou já excluída seguem o mesmo caminho de senha errada.
  if (!conta || conta.situacao !== 'ativo' || !conta.senhaHash || !conta.senhaParams) {
    gastarTempoEquivalente(chave)
    throw createError({ statusCode: 401, data: { mensagem: MENSAGEM_UNICA } })
  }

  const confere = conferirSenha(chave, { hash: conta.senhaHash, params: conta.senhaParams })
  if (!confere) {
    throw createError({ statusCode: 401, data: { mensagem: MENSAGEM_UNICA } })
  }

  await abrirSessao(event, {
    id: conta.id,
    numeroRegistro: conta.numeroRegistro,
    primeiroNome: (conta.nome ?? '').split(' ')[0] || 'Associado',
    emitidaEm: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  })

  return { entrou: true }
})
