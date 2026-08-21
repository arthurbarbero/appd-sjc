/**
 * `POST /api/atendimento/modo` — liga ou desliga o modo atendimento neste navegador.
 *
 * Ligar eleva o teto de cadastros do aparelho por seis horas, e **não faz mais nada**: não
 * dispensa consentimento, não afrouxa validação, não abre dado de ninguém. Ver
 * `server/utils/modo-atendimento.ts`.
 *
 * ## A senha é contada no limite de login
 *
 * Uma rota que confere senha e não conta tentativa é uma rota de força bruta. O escopo usado
 * é `login`, e não um escopo novo: o `CHECK` da tabela `tentativas` fecha o vocabulário em
 * três valores, e abrir um quarto custaria uma migration que recria a tabela — por um
 * rótulo. O que esta rota faz **é** autenticação, então o escopo não mente.
 *
 * O identificador continua sendo o IP em HMAC, nunca em claro (`modelo-de-dados` REQ-30).
 */

const LIMITE = { escopo: 'login', maximo: 10, janelaSegundos: 900 } as const

export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ senha?: unknown; desligar?: unknown }>(event)

  if (corpo?.desligar === true) {
    desligarModoAtendimento(event)
    return { ligado: false }
  }

  if (typeof corpo?.senha !== 'string') {
    throw createError({ statusCode: 422, data: { motivo: 'Informe a senha do atendimento.' } })
  }

  const bd = usarBanco(event)
  const { excedeu } = await registrarTentativa(event, bd, ipDoPedido(event), LIMITE)
  if (excedeu) {
    throw createError({
      statusCode: 429,
      data: { motivo: 'Muitas tentativas. Espere alguns minutos e tente de novo.' },
    })
  }

  const ligou = await ligarModoAtendimento(event, corpo.senha)
  if (!ligou) {
    /*
      Uma resposta só para senha errada e para segredo não configurado.

      Distinguir as duas contaria a quem tenta que o modo **existe mas não está montado**
      neste ambiente — informação que só serve a quem está sondando. Quem opera o mutirão
      descobre pelo caminho certo: a senha que a associação tem.
    */
    throw createError({ statusCode: 401, data: { motivo: 'Senha do atendimento incorreta.' } })
  }

  return { ligado: true, duracaoSegundos: DURACAO_SEGUNDOS }
})
