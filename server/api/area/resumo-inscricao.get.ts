/**
 * `GET /api/area/resumo-inscricao` — o que o **bloco de inscrições do painel** mostra.
 *
 * Rota própria por dois motivos, e os dois importam:
 *
 * **Degradação por bloco.** O painel faz uma chamada por bloco (decisão do dono,
 * 2026-08-07): se esta cair, as inscrições mostram erro e o resto da página continua
 * utilizável. Numa chamada única, qualquer falha apaga a tela inteira.
 *
 * **Ela não devolve o tipo de deficiência**, e não tem como pedir. Quem exibe o campo é
 * `/api/area/inscricao`, que só a tela de correção usa. Separar as rotas em vez de usar um
 * parâmetro é o que impede o dado sensível de viajar por engano.
 */

import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const inscricao = await usarBanco(event).query.inscricoesAtendimento.findFirst({
    where: eq(schema.inscricoesAtendimento.usuarioId, sessao.id),
    columns: { atendimentos: true, dias: true, status: true, criadoEm: true },
  })

  // Sem inscrição não é erro: é o estado vazio, que a tela trata oferecendo o próximo passo.
  if (!inscricao) return { inscricao: null }

  return {
    inscricao: {
      atendimentos: JSON.parse(inscricao.atendimentos) as string[],
      dias: JSON.parse(inscricao.dias) as string[],
      status: inscricao.status,
      criadoEm: inscricao.criadoEm,
    },
  }
})
