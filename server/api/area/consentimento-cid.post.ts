/**
 * `POST /api/area/consentimento-cid` — a pessoa retira a autorização de guardar o CID.
 *
 * T5 de `cracha-impresso`, sob o
 * [ADR-020](../../../docs/adr/adr-020-cid-no-cadastro-e-no-cracha.md).
 *
 * ## Por que é rota própria, e não um parâmetro da de consentimento
 *
 * A rota irmã (`consentimento.post.ts`) aceita **um campo booleano só**, de propósito:
 * rota que aceita mais do que precisa vira caminho lateral para alterar cadastro sem
 * passar pela validação certa. Acrescentar ali um `termo` a revogar seria abrir
 * exatamente esse caminho — e num lugar onde o efeito é apagar dado de saúde.
 *
 * Duas rotas com o mesmo desenho custam repetição; uma rota que decide qual dado apagar a
 * partir do corpo custa uma superfície de ataque. A repetição é mais barata.
 *
 * ## O que a retirada faz, e por que as três coisas juntas
 *
 * Apagar o CID sem desligar o opt-in deixaria a marca de "imprimir o CID" ligada apontando
 * para o nada — e ela voltaria a valer no instante em que a pessoa informasse um CID novo,
 * sem que ninguém tivesse pedido isso. Por isso as três acontecem numa transação só:
 * apagar o dado, desligar a impressão e gravar a revogação.
 */

import { and, desc, eq } from 'drizzle-orm'
import { versaoVigente } from '~~/shared/termos'

const TERMO_ID = 'cid-diagnostico'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const corpo = await readBody<{ revogar?: unknown }>(event)
  if (corpo?.revogar !== true) {
    throw createError({ statusCode: 422, data: { motivo: 'Confirme a retirada para concluir.' } })
  }

  const bd = usarBanco(event)
  const agora = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

  const ultimo = await bd.query.consentimentos.findFirst({
    where: and(
      eq(schema.consentimentos.usuarioId, sessao.id),
      eq(schema.consentimentos.termoId, TERMO_ID),
    ),
    orderBy: desc(schema.consentimentos.registradoEm),
    columns: { versao: true, hash: true, evento: true },
  })

  // Já retirado, ou nunca autorizado: não grava revogação. Duas linhas iguais não são erro
  // de banco, mas são ruído no histórico que a pessoa lê em `/seus-direitos`.
  if (!ultimo || ultimo.evento === 'revogacao') return { revogadoEm: null, jaEstava: true }

  /*
    O termo apontado é o que **esta pessoa aceitou**, lido do histórico dela — não o
    vigente hoje. Se o texto tiver mudado desde então, a revogação precisa dizer de que
    autorização ela está saindo, e não da que está no ar agora.

    `versaoVigente` fica só como rede: catálogo sem versão vigente já teria estourado no
    carregamento do módulo.
  */
  const termo = ultimo ?? versaoVigente(TERMO_ID)

  await bd.batch([
    bd
      .update(schema.usuarios)
      .set({ cid: null, cidNoCracha: false, atualizadoEm: agora })
      .where(eq(schema.usuarios.id, sessao.id)),
    bd.insert(schema.consentimentos).values({
      id: crypto.randomUUID(),
      usuarioId: sessao.id,
      termoId: TERMO_ID,
      versao: termo.versao,
      hash: termo.hash,
      evento: 'revogacao',
      registradoEm: agora,
      origem: '/seus-direitos',
    }),
  ])

  return { revogadoEm: agora, jaEstava: false }
})
