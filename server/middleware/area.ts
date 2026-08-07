/**
 * Guarda das rotas que dependem de sessão — nos dois sentidos.
 *
 * `cadastro-e-login` REQ-13 e REQ-30.
 *
 * Middleware **único**: as rotas de `area-do-associado` e de `cracha-do-associado` usam
 * este, nenhuma implementa verificação própria (ADR-013). Duas guardas é uma guarda a
 * menos, porque uma delas vai ficar para trás.
 *
 * Verificação no servidor, não no cliente: esconder o link do menu não protege nada, e
 * uma guarda que só existe no Vue não vale para quem chega por link direto ou com o
 * JavaScript falhando.
 */

/**
 * Telas que **só fazem sentido para quem não entrou**.
 *
 * Abrir o cadastro com sessão aberta é pior do que redundante: o formulário cria conta
 * nova (ADR-012), então a pessoa terminaria com duas contas e dois números de registro
 * para a mesma vida. E `/entrar` com sessão aberta é a tela pedindo a senha de quem
 * acabou de provar quem é.
 */
const SO_DESLOGADO = ['/entrar', '/atendimento/inscricao']

export default defineEventHandler(async (event) => {
  const caminho = getRequestURL(event).pathname
  const protegida = caminho.startsWith('/area') || caminho.startsWith('/api/area')
  const soDeslogado = SO_DESLOGADO.includes(caminho)
  if (!protegida && !soDeslogado) return

  const sessao = await sessaoAtual(event)

  if (soDeslogado) {
    // Quem já entrou vai para a própria área. Sem sessão, segue para a tela normalmente.
    return sessao ? sendRedirect(event, '/area', 302) : undefined
  }

  if (sessao) return

  // API responde 401 sem revelar se o recurso existe; tela leva para /entrar dizendo
  // que a sessão terminou, em vez de página de erro ou tela em branco (REQ-12).
  if (caminho.startsWith('/api/')) {
    throw createError({ statusCode: 401, data: { mensagem: 'Sessão terminada.' } })
  }
  return sendRedirect(event, '/entrar?sessao=terminada', 302)
})
