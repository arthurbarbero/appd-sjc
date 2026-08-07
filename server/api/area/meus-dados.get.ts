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
      // A tela de correção precisa dele preenchido: sem isto o formulário assumiria um
      // valor padrão e gravaria por cima da resposta real da pessoa ao salvar.
      telefoneWhatsapp: true,
      cep: true,
      endereco: true,
      numero: true,
      complemento: true,
      bairro: true,
      municipio: true,
      situacao: true,
    },
  })
  // A conta é o único bloco sem o qual a página não existe: sem ela não há área.
  if (!conta) throw createError({ statusCode: 401 })

  /*
    Degradação por bloco (REQ-33, cenário "Falha em um bloco não derruba os outros").

    A chamada continua sendo **uma só** — três requisições numa conexão ruim são três
    chances de falhar, e o público deste site tem conexão ruim. O que muda é que cada
    trecho falha por conta própria aqui dentro: se a consulta de inscrições cair, o painel
    ainda mostra crachá, dados e exclusão, com o erro contido no bloco que o causou.

    Sem isto, um `findFirst` que estoura derruba a tela inteira e a pessoa vê "não
    conseguimos carregar" sem saber que só uma parte falhou.
  */
  const inscricao = await bd.query.inscricoesAtendimento
    .findFirst({
      where: eq(schema.inscricoesAtendimento.usuarioId, sessao.id),
      columns: { atendimentos: true, dias: true, status: true, criadoEm: true },
    })
    .catch(() => 'falhou' as const)

  const foto = await bd.query.fotos
    .findFirst({
      where: eq(schema.fotos.usuarioId, sessao.id),
      columns: { id: true },
    })
    .catch(() => 'falhou' as const)

  const inscricaoFalhou = inscricao === 'falhou'
  const fotoFalhou = foto === 'falhou'

  return {
    conta,
    inscricaoFalhou,
    fotoFalhou,
    inscricao:
      inscricaoFalhou || !inscricao
        ? null
        : {
            atendimentos: JSON.parse(inscricao.atendimentos) as string[],
            dias: JSON.parse(inscricao.dias) as string[],
            status: inscricao.status,
            criadoEm: inscricao.criadoEm,
          },
    temFoto: !fotoFalhou && Boolean(foto),
  }
})
