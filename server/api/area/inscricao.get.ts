/**
 * `GET /api/area/inscricao` — a inscrição completa, **com** o tipo de deficiência.
 *
 * Rota separada de propósito. `meus-dados` alimenta o painel e por isso não devolve o
 * campo 12 (REQ-5); esta existe só para a tela de correção, que é a única que pode
 * exibi-lo — porque é lá que a pessoa conserta o próprio dado.
 *
 * Separar as duas rotas em vez de usar um parâmetro é o que impede o dado sensível de
 * viajar por engano: quem chama a rota do painel não consegue pedir o campo, nem sem
 * querer nem de propósito.
 */

import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const bd = usarBanco(event)
  const inscricao = await bd.query.inscricoesAtendimento.findFirst({
    where: eq(schema.inscricoesAtendimento.usuarioId, sessao.id),
  })
  if (!inscricao) throw createError({ statusCode: 404 })

  return {
    deficiencias: JSON.parse(inscricao.deficiencias) as string[],
    deficienciaOutro: inscricao.deficienciaOutro ?? '',
    atendimentos: JSON.parse(inscricao.atendimentos) as string[],
    atendimentoOutro: inscricao.atendimentoOutro ?? '',
    dias: JSON.parse(inscricao.dias) as string[],
  }
})
