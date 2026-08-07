/**
 * `GET /api/area/cracha` — o que o crachá imprime, e nada além.
 *
 * Fatia 4 de `cracha-do-associado`. A projeção é a lista do REQ-20 e do REQ-21, e o
 * REQ-22 é o que ela **não** traz: endereço, telefone da pessoa, data de nascimento,
 * cuidador e e-mail ficam de fora porque não vão para o cartão.
 *
 * O tipo de deficiência só sai daqui **se a pessoa marcou o opt-in** (REQ-25). Sem a
 * marca, o campo não é consultado — a proteção está na consulta, não na disciplina de
 * quem escreve o template.
 */

import { eq } from 'drizzle-orm'
import { TIPO_ARMAZENADO } from '~~/shared/foto'

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const bd = usarBanco(event)

  const conta = await bd.query.usuarios.findFirst({
    where: eq(schema.usuarios.id, sessao.id),
    columns: {
      nome: true,
      numeroRegistro: true,
      situacao: true,
      crachaMostraDeficiencia: true,
    },
  })
  if (!conta) throw createError({ statusCode: 401 })

  // Só consulta o campo 12 quando ele vai ser impresso. Sem opt-in, o dado sensível não
  // chega nem a sair do banco.
  const deficiencias = conta.crachaMostraDeficiencia
    ? await bd.query.inscricoesAtendimento
        .findFirst({
          where: eq(schema.inscricoesAtendimento.usuarioId, sessao.id),
          columns: { deficiencias: true },
        })
        .then((i) => (i ? (JSON.parse(i.deficiencias) as string[]) : []))
    : []

  const foto = await armazenamentoFoto(bd).ler(sessao.id)

  setHeader(event, 'Cache-Control', 'private, no-store')

  return {
    nome: conta.nome,
    numeroRegistro: conta.numeroRegistro,
    situacao: conta.situacao as 'ativo' | 'inativo',
    mostraDeficiencia: conta.crachaMostraDeficiencia,
    deficiencias,
    foto: foto ? `data:${TIPO_ARMAZENADO};base64,${paraBase64(foto.conteudo)}` : null,
  }
})

function paraBase64(bytes: Uint8Array): string {
  let binario = ''
  for (const byte of bytes) binario += String.fromCharCode(byte)
  return btoa(binario)
}
