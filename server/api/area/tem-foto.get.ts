/**
 * `GET /api/area/tem-foto` — se existe foto do crachá, e nada além disso.
 *
 * O bloco do crachá no painel precisa saber só isso para escolher entre a prévia e o
 * estado "Sem foto". Devolver a imagem aqui seria mandar 100 KB de dado sensível para
 * desenhar um quadradinho.
 *
 * É a terceira das chamadas do painel: se esta falhar, o bloco do crachá diz que não
 * conseguiu conferir, e os outros dois seguem funcionando.
 */

import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const foto = await usarBanco(event).query.fotos.findFirst({
    where: eq(schema.fotos.usuarioId, sessao.id),
    columns: { id: true },
  })

  return { temFoto: Boolean(foto) }
})
