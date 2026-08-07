/**
 * `PUT /api/area/foto` — recebe a foto do crachá já recortada e comprimida.
 *
 * T2.3 de `cracha-do-associado`. O corpo é o JPEG cru, não JSON: base64 inflaria 33% um
 * payload que já tem teto apertado.
 *
 * **O servidor não confia no cliente** (REQ-14). Quem posta aqui pode ter contornado a
 * tela inteira — `curl` não passa por `canvas`. Por isso tipo, dimensão e tamanho são
 * conferidos nos bytes recebidos, e não no que o cabeçalho ou o formulário afirmam.
 */

import { ALTURA, LARGURA, TETO_BYTES, TIPO_ARMAZENADO, dimensoesJpeg } from '~~/shared/foto'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const corpo = await readRawBody(event, false)
  if (!corpo || !corpo.length) {
    throw createError({ statusCode: 400, data: { motivo: 'Nenhuma imagem foi recebida.' } })
  }

  const bytes = new Uint8Array(corpo)

  // Ordem importa: o teto é a checagem mais barata e a que mais protege o banco.
  if (bytes.length > TETO_BYTES) {
    throw createError({
      statusCode: 413,
      data: {
        motivo: `A imagem tem ${bytes.length} bytes e o limite é ${TETO_BYTES}.`,
      },
    })
  }

  const dimensoes = dimensoesJpeg(bytes)
  if (!dimensoes) {
    throw createError({
      statusCode: 400,
      data: { motivo: 'O arquivo recebido não é um JPEG válido.' },
    })
  }

  if (dimensoes.largura !== LARGURA || dimensoes.altura !== ALTURA) {
    throw createError({
      statusCode: 400,
      data: {
        motivo: `A imagem precisa ter ${LARGURA} × ${ALTURA} pixels; veio ${dimensoes.largura} × ${dimensoes.altura}.`,
      },
    })
  }

  await armazenamentoFoto(usarBanco(event)).gravar(sessao.id, {
    conteudo: bytes,
    tipo: TIPO_ARMAZENADO,
    largura: dimensoes.largura,
    altura: dimensoes.altura,
  })

  return { gravada: true }
})
