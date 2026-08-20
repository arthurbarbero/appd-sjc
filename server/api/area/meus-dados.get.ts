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
      // Exibido travado em /area/dados desde 2026-08-20, junto de e-mail e nascimento.
      cpf: true,
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
      estado: true,
      pais: true,
      situacao: true,
    },
  })
  if (!conta) throw createError({ statusCode: 401 })

  /*
    Devolve **só a conta**, desde 2026-08-07.

    Antes esta rota juntava conta, inscrição e foto numa resposta só. O dono decidiu por
    **uma chamada por bloco**: se a inscrição falhar, o painel mostra o erro dentro daquele
    bloco e o resto continua utilizável, em vez de a tela inteira virar "não conseguimos
    carregar". As outras duas são `resumo-inscricao` e `tem-foto`.

    A conta é o único bloco sem o qual a página não existe — se ela cair, não há área.
  */
  return { conta }
})
