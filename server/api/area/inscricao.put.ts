/**
 * `PUT /api/area/inscricao` — a pessoa corrige o próprio cadastro.
 *
 * Requisito novo do [ADR-014](../../../docs/adr/adr-014-inscricao-como-registro-de-interesse.md):
 * as seis changes escritas antes assumiam inscrição escrita uma vez e nunca mais tocada,
 * o que deixava a pessoa presa a um dado errado sem canal de correção. **É o que ela ganha
 * em relação à planilha de hoje.**
 *
 * Altera a linha existente e atualiza `atualizado_em`. Nunca cria linha nova — o REQ-15
 * garante uma inscrição por pessoa, e o `UNIQUE` do banco recusaria de qualquer forma.
 */

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { ATENDIMENTOS, DEFICIENCIAS, DIAS } from '~~/shared/validacao/inscricao'

/**
 * Só os campos que a tela de correção edita.
 *
 * As listas vêm do mesmo módulo do formulário, e não de uma cópia: duplicar o
 * vocabulário aqui é como as duas telas divergem sem ninguém perceber.
 */
const esquemaCorrecao = z
  .object({
    deficiencias: z.array(z.enum(DEFICIENCIAS)).min(1, 'Marque pelo menos uma opção.'),
    deficienciaOutro: z.string().trim().min(2).max(100).optional(),
    atendimentos: z.array(z.enum(ATENDIMENTOS)).min(1, 'Marque pelo menos um atendimento.'),
    atendimentoOutro: z.string().trim().min(2).max(100).optional(),
    dias: z.array(z.enum(DIAS)).min(1, 'Marque pelo menos um dia.'),
  })
  .strict()
  .refine((d) => !d.deficiencias.includes('Outro') || !!d.deficienciaOutro, {
    path: ['deficienciaOutro'],
    message: 'Você marcou "Outro": descreva em poucas palavras.',
  })
  .refine((d) => !d.atendimentos.includes('Outro') || !!d.atendimentoOutro, {
    path: ['atendimentoOutro'],
    message: 'Você marcou "Outro": descreva em poucas palavras.',
  })

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const validado = esquemaCorrecao.safeParse(await readBody(event))
  if (!validado.success) {
    const erros: Record<string, string> = {}
    for (const p of validado.error.issues) erros[String(p.path[0] ?? 'formulario')] = p.message
    throw createError({ statusCode: 422, data: { erros } })
  }

  const d = validado.data
  const bd = usarBanco(event)

  const resultado = await bd
    .update(schema.inscricoesAtendimento)
    .set({
      deficiencias: JSON.stringify(d.deficiencias),
      deficienciaOutro: d.deficienciaOutro ?? null,
      atendimentos: JSON.stringify(d.atendimentos),
      atendimentoOutro: d.atendimentoOutro ?? null,
      dias: JSON.stringify(d.dias),
      atualizadoEm: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    })
    .where(eq(schema.inscricoesAtendimento.usuarioId, sessao.id))

  if (!resultado.success) throw createError({ statusCode: 500 })
  return { salvo: true }
})
