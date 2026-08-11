/**
 * `POST /api/area/consentimento` — a pessoa retira o consentimento do Art. 11.
 *
 * T10 de `consentimento-e-privacidade` (REQ-13, REQ-9). Gratuita, a dois cliques de
 * `/seus-direitos`, e **não apaga a conta**.
 *
 * As quatro coisas acontecem numa transação só, porque metade delas é pior que nenhuma:
 *
 * 1. o tipo de deficiência sai do cadastro e dá lugar a `DEFICIENCIA_NAO_CONSENTIDA` —
 *    retirar o consentimento e continuar guardando o dado é retirada de fachada;
 * 2. o opt-in de exibição é desligado, senão a palavra "Não consentido" apareceria na
 *    página pública de verificação, que é o oposto do que a pessoa pediu (ADR-019);
 * 3. entra uma linha de `revogacao` em `consentimentos`, apontando para a versão do termo
 *    que ela tinha aceitado;
 * 4. as linhas anteriores **ficam** — são a prova de que o tratamento teve base legal, e a
 *    tabela é append-only na aplicação (REQ-9).
 *
 * O que **não** acontece: a conta continua, o crachá continua, a inscrição continua com os
 * atendimentos e os dias. Ela retirou uma autorização, não pediu para sumir.
 */

import { and, desc, eq } from 'drizzle-orm'
import { DEFICIENCIA_NAO_CONSENTIDA } from '~~/shared/inscricao'
import { versaoVigente } from '~~/shared/termos'

const TERMO_ID = 'deficiencia-art11'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const corpo = await readBody<{ revogar?: unknown }>(event)
  // Um campo booleano só, como em `cracha.put.ts`: rota que aceita mais do que precisa
  // vira caminho lateral para alterar cadastro sem passar pela validação certa.
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

  // Já retirado: não grava segunda revogação. Duas linhas iguais não são erro de banco,
  // mas são ruído no histórico que a pessoa vai ler em `/seus-direitos`.
  if (ultimo?.evento === 'revogacao') return { revogadoEm: null, jaEstava: true }

  const termo = ultimo ?? versaoVigente(TERMO_ID)

  await bd.batch([
    bd
      .update(schema.inscricoesAtendimento)
      .set({
        deficiencias: JSON.stringify([DEFICIENCIA_NAO_CONSENTIDA]),
        deficienciaOutro: null,
        atualizadoEm: agora,
      })
      .where(eq(schema.inscricoesAtendimento.usuarioId, sessao.id)),
    bd
      .update(schema.usuarios)
      .set({ crachaMostraDeficiencia: false, atualizadoEm: agora })
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
