/**
 * `GET /api/area/meus-dados` — tudo que a área do associado precisa, numa chamada.
 *
 * **O tipo de deficiência não sai daqui** (`area-do-associado` REQ-5), e a projeção é
 * explícita por isso: um `SELECT *` mandaria o dado sensível para o navegador, onde ele
 * ficaria no cache, no histórico e em qualquer extensão instalada. A tela de correção,
 * que é a única que pode exibi-lo, tem rota própria.
 */

import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const bd = usarBanco(event)

  const conta = await bd.query.usuarios.findFirst({
    where: eq(schema.usuarios.id, sessao.id),
    columns: {
      numeroRegistro: true,
      nome: true,
      nascimento: true,
      email: true,
      telefone: true,
      endereco: true,
      numero: true,
      complemento: true,
      bairro: true,
      municipio: true,
      situacao: true,
    },
  })
  if (!conta) throw createError({ statusCode: 401 })

  const inscricao = await bd.query.inscricoesAtendimento.findFirst({
    where: eq(schema.inscricoesAtendimento.usuarioId, sessao.id),
    columns: { atendimentos: true, dias: true, status: true, criadoEm: true },
  })

  const foto = await bd.query.fotos.findFirst({
    where: eq(schema.fotos.usuarioId, sessao.id),
    columns: { id: true },
  })

  return {
    conta,
    inscricao: inscricao
      ? {
          atendimentos: JSON.parse(inscricao.atendimentos) as string[],
          dias: JSON.parse(inscricao.dias) as string[],
          status: inscricao.status,
          criadoEm: inscricao.criadoEm,
        }
      : null,
    temFoto: Boolean(foto),
  }
})
