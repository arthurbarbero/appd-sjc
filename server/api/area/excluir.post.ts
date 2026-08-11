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

import { and, desc, eq } from 'drizzle-orm'
import { versaoVigente } from '~~/shared/termos'

const TERMO_ID = 'deficiencia-art11'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const bd = usarBanco(event)
  const agora = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

  /*
    A revogação aponta para o termo que a pessoa **aceitou**, não para um valor inventado.
    Até 2026-08-11 esta linha gravava `versao: 'v1'` fixa e `hash` com 64 zeros — o mesmo
    marcador de lugar que já tinha sido tirado do cadastro, sobrevivendo aqui. Hash falso
    é pior que campo vazio: o vazio se vê, o falso se acredita.

    Quem nunca aceitou (conta sem consentimento gravado) revoga contra a versão vigente:
    é o único termo do qual faz sentido dizer que ela está saindo.
  */
  const ultimo = await bd.query.consentimentos.findFirst({
    where: and(
      eq(schema.consentimentos.usuarioId, sessao.id),
      eq(schema.consentimentos.termoId, TERMO_ID),
    ),
    orderBy: desc(schema.consentimentos.registradoEm),
    columns: { versao: true, hash: true },
  })
  const termo = ultimo ?? versaoVigente(TERMO_ID)

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
      termoId: TERMO_ID,
      versao: termo.versao,
      hash: termo.hash,
      evento: 'revogacao',
      registradoEm: agora,
      origem: '/area/excluir',
    }),
  ])

  await fecharSessao(event)
  return { excluida: true }
})
