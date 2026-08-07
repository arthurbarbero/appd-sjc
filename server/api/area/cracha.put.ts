/**
 * `PUT /api/area/cracha` — grava o opt-in de imprimir o tipo de deficiência.
 *
 * REQ-25 e REQ-26 de `cracha-do-associado`. A rota aceita **um único campo booleano**, e
 * é de propósito: qualquer outra coisa que entrasse aqui viraria caminho lateral para
 * alterar cadastro sem passar pela validação de `/api/area/meus-dados`.
 *
 * A escolha vale **só para o crachá**. Nenhuma outra rota lê esta coluna.
 */

import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const corpo = await readBody<{ mostraDeficiencia?: unknown }>(event)
  if (typeof corpo?.mostraDeficiencia !== 'boolean') {
    throw createError({ statusCode: 422, data: { motivo: 'Informe verdadeiro ou falso.' } })
  }

  const resultado = await usarBanco(event)
    .update(schema.usuarios)
    .set({
      crachaMostraDeficiencia: corpo.mostraDeficiencia,
      atualizadoEm: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    })
    .where(eq(schema.usuarios.id, sessao.id))

  if (!resultado.success) throw createError({ statusCode: 500 })
  return { salvo: true }
})
