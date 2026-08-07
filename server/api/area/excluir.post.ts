/**
 * `POST /api/area/excluir` — exclusão de conta.
 *
 * Executa **o contrato do `modelo-de-dados` REQ-28**, sem lista própria. Havia três listas
 * divergentes do que apagar antes do gate (bloqueio B23); agora existe uma, escrita na
 * spec do contrato de dados, e este arquivo apenas a cumpre.
 *
 * O que sobrevive, e por quê:
 *
 * - **`numero_registro`**, preservado e nunca reutilizado, para que um crachá antigo não
 *   passe a identificar outra pessoa;
 * - **as linhas de `consentimentos`**, porque são a prova de que o tratamento teve base
 *   legal — e por isso a chave estrangeira delas não tem `ON DELETE CASCADE`. Some uma
 *   linha nova de `revogacao`, que é o registro de que a pessoa pediu para sair.
 */

import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const bd = usarBanco(event)
  const agora = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

  await bd.batch([
    bd.delete(schema.fotos).where(eq(schema.fotos.usuarioId, sessao.id)),
    bd
      .delete(schema.inscricoesAtendimento)
      .where(eq(schema.inscricoesAtendimento.usuarioId, sessao.id)),
    bd
      .update(schema.usuarios)
      .set({
        nome: null,
        email: null,
        cpf: null,
        senhaHash: null,
        senhaParams: null,
        nascimento: null,
        telefone: null,
        telefoneWhatsapp: null,
        endereco: null,
        numero: null,
        complemento: null,
        bairro: null,
        municipio: null,
        cuidadorNome: null,
        cuidadorContato: null,
        chaveIdempotencia: null,
        situacao: 'inativo',
        atualizadoEm: agora,
      })
      .where(eq(schema.usuarios.id, sessao.id)),
    bd.insert(schema.consentimentos).values({
      id: crypto.randomUUID(),
      usuarioId: sessao.id,
      termoId: 'deficiencia-art11',
      versao: 'v1',
      hash: '0'.repeat(64),
      evento: 'revogacao',
      registradoEm: agora,
      origem: '/area/excluir',
    }),
  ])

  await fecharSessao(event)
  return { excluida: true }
})
