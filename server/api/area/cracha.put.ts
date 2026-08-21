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

  const corpo = await readBody<{ mostraDeficiencia?: unknown; cidNoCracha?: unknown }>(event)

  /*
    Um opt-in por vez, e cada um com o próprio nome.

    A alternativa — um campo `qual` mais um booleano — deixaria a rota escolher o alvo pelo
    corpo, e o alvo aqui é sempre dado sensível. Dois campos nomeados custam duas linhas e
    não abrem essa porta.
  */
  if (typeof corpo?.cidNoCracha === 'boolean') {
    const bd = usarBanco(event)
    /*
      Ligar a impressão exige que exista CID guardado. Sem isso, a marca ficaria pendurada
      apontando para o nada e voltaria a valer sozinha no dia em que a pessoa informasse um
      CID novo — sem ninguém ter pedido.
    */
    if (corpo.cidNoCracha) {
      const conta = await bd.query.usuarios.findFirst({
        where: eq(schema.usuarios.id, sessao.id),
        columns: { cid: true },
      })
      if (!conta?.cid) {
        throw createError({
          statusCode: 422,
          data: { motivo: 'Não há CID guardado para imprimir.' },
        })
      }
    }
    await bd
      .update(schema.usuarios)
      .set({
        cidNoCracha: corpo.cidNoCracha,
        atualizadoEm: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      })
      .where(eq(schema.usuarios.id, sessao.id))
    return { cidNoCracha: corpo.cidNoCracha }
  }

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
