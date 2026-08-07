/**
 * `PUT /api/area/meus-dados` — a pessoa corrige nome, telefone e endereço.
 *
 * Fatia 3 de `area-do-associado` (REQ-15 a REQ-17). O schema é o **mesmo** que a tela
 * importa (`esquemaMeusDados`), e é por isso que o cenário "Servidor valida com o mesmo
 * schema do cliente" pode ser um teste e não uma promessa: uma requisição montada fora da
 * interface encontra exatamente a régua que o formulário encontrou.
 *
 * Não toca em e-mail, CPF, data de nascimento nem em nada da inscrição — o motivo de cada
 * ausência está escrito junto do schema, em `shared/validacao/inscricao.ts`.
 */

import { eq } from 'drizzle-orm'
import { esquemaMeusDados } from '~~/shared/validacao/inscricao'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const validado = esquemaMeusDados.safeParse(await readBody(event))
  if (!validado.success) {
    const erros: Record<string, string> = {}
    for (const p of validado.error.issues) erros[String(p.path[0] ?? 'formulario')] = p.message
    throw createError({ statusCode: 422, data: { erros } })
  }

  const d = validado.data
  const bd = usarBanco(event)

  const resultado = await bd
    .update(schema.usuarios)
    .set({
      nome: d.nome,
      telefone: d.telefone,
      telefoneWhatsapp: d.telefoneWhatsapp,
      cep: d.cep,
      endereco: d.endereco,
      numero: d.numero,
      complemento: d.complemento ?? null,
      bairro: d.bairro,
      municipio: d.municipio,
      atualizadoEm: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    })
    .where(eq(schema.usuarios.id, sessao.id))

  if (!resultado.success) throw createError({ statusCode: 500 })
  return { salvo: true }
})
