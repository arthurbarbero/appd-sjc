/**
 * `PUT /api/area/cracha` — grava o opt-in de imprimir o tipo de deficiência.
 *
 * REQ-25 e REQ-26 de `cracha-do-associado`. A rota aceita **um único campo booleano**, e
 * é de propósito: qualquer outra coisa que entrasse aqui viraria caminho lateral para
 * alterar cadastro sem passar pela validação de `/api/area/meus-dados`.
 *
 * Em 2026-08-21 ela chegou a aceitar dois campos, com o opt-in do CID; ele foi revogado no
 * mesmo dia, por decisão do dono, e a rota voltou ao desenho de um campo só.
 *
 * A escolha vale **só para o crachá**. Nenhuma outra rota lê esta coluna.
 */

import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  /*
    Um campo, de novo — o do CID saiu em 2026-08-21.

    Havia dois opt-ins nesta rota: imprimir o tipo de deficiência e imprimir o CID. O
    segundo deixou de existir por decisão do dono, que juntou "guardar" e "imprimir" no
    consentimento do formulário. Sem opt-in não há o que gravar aqui, e a rota volta a
    aceitar **um único campo booleano** — que era o desenho original e o motivo dele:
    qualquer coisa a mais vira caminho lateral para alterar cadastro sem passar pela
    validação de `/api/area/meus-dados`.
  */
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
