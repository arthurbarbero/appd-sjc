/**
 * `GET /api/area/copia` — a cópia dos próprios dados, do Art. 18 (portabilidade e acesso).
 *
 * T9 de `consentimento-e-privacidade` (REQ-15). Devolve **tudo** o que está guardado sobre
 * a pessoa autenticada, mais o histórico completo de eventos de consentimento, em JSON que
 * outro serviço consegue ler.
 *
 * Esta é a única rota da área que devolve o campo 12 junto com o resto — e é legítimo:
 * quem pede é a dona do dado, autenticada, sobre ela mesma. As outras rotas continuam
 * separando o campo sensível de propósito (`area-do-associado` REQ-5), e o teste de
 * vazamento conhece esta exceção pelo nome.
 *
 * **A foto não vem aqui.** Ela é baixada por `/api/area/foto`, que já exige sessão. Embutir
 * um retrato em base64 no meio do JSON deixaria a cópia pesada e, pior, faria a foto viajar
 * em toda leitura da tela — quando o que a pessoa quer, quase sempre, é só conferir o que
 * está guardado.
 */

import { asc, eq } from 'drizzle-orm'
import { semConsentimento } from '~~/shared/inscricao'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const bd = usarBanco(event)

  const pessoa = await bd.query.usuarios.findFirst({
    where: eq(schema.usuarios.id, sessao.id),
    columns: {
      numeroRegistro: true,
      nome: true,
      email: true,
      cpf: true,
      nascimento: true,
      telefone: true,
      telefoneWhatsapp: true,
      cep: true,
      endereco: true,
      numero: true,
      complemento: true,
      bairro: true,
      municipio: true,
      cuidadorNome: true,
      cuidadorContato: true,
      situacao: true,
      crachaMostraDeficiencia: true,
      criadoEm: true,
      atualizadoEm: true,
    },
  })
  if (!pessoa) throw createError({ statusCode: 404 })

  const inscricao = await bd.query.inscricoesAtendimento.findFirst({
    where: eq(schema.inscricoesAtendimento.usuarioId, sessao.id),
    columns: {
      deficiencias: true,
      deficienciaOutro: true,
      atendimentos: true,
      atendimentoOutro: true,
      dias: true,
      status: true,
      criadoEm: true,
      atualizadoEm: true,
    },
  })

  // Ordem crescente: o histórico se lê de cima para baixo, do primeiro aceite ao último
  // evento. É como a pessoa conta a própria história, e não como o banco a devolve.
  /*
    **Todos** os termos, e não só o do Art. 11.

    O filtro por `deficiencia-art11` fazia sentido enquanto existia um termo só. Com o CID
    (ADR-020) ele passou a esconder metade da verdade: a pessoa autorizava guardar o
    diagnóstico e o histórico não mencionava, o que num lugar chamado "seus direitos" é o
    oposto do que a tela promete. Pior — sem aparecer, não havia o que retirar.
  */
  const eventos = await bd.query.consentimentos.findMany({
    where: eq(schema.consentimentos.usuarioId, sessao.id),
    orderBy: asc(schema.consentimentos.registradoEm),
    columns: { termoId: true, versao: true, hash: true, evento: true, registradoEm: true },
  })

  const deficiencias = inscricao ? (JSON.parse(inscricao.deficiencias) as string[]) : []
  const temFoto = await bd.query.fotos.findFirst({
    where: eq(schema.fotos.usuarioId, sessao.id),
    columns: { id: true },
  })

  return {
    geradoEm: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    pessoa,
    inscricao: inscricao
      ? {
          ...inscricao,
          deficiencias,
          atendimentos: JSON.parse(inscricao.atendimentos) as string[],
          dias: JSON.parse(inscricao.dias) as string[],
          /* Diz o estado em vez de deixar quem lê deduzir de uma palavra no meio da lista. */
          consentimentoRetirado: semConsentimento(deficiencias),
        }
      : null,
    consentimentos: eventos,
    // Caminho, não conteúdo: a foto se baixa por aqui, com sessão, e nunca por endereço
    // aberto. `null` quando não há foto — o campo existe para a cópia ser completa.
    foto: temFoto ? { baixarEm: '/api/area/foto' } : null,
  }
})
