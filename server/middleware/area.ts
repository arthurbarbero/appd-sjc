/**
 * Guarda de rota de `/area/*` — `cadastro-e-login` REQ-13 e REQ-30.
 *
 * Middleware **único**: as rotas de `area-do-associado` e de `cracha-do-associado` usam
 * este, nenhuma implementa verificação própria (ADR-013). Duas guardas é uma guarda a
 * menos, porque uma delas vai ficar para trás.
 *
 * Verificação no servidor, não no cliente: esconder o link do menu não protege nada.
 */
export default defineEventHandler(async (event) => {
  const caminho = getRequestURL(event).pathname
  const protegida = caminho.startsWith('/area') || caminho.startsWith('/api/area')
  if (!protegida) return

  if (await sessaoAtual(event)) return

  // API responde 401 sem revelar se o recurso existe; tela leva para /entrar dizendo
  // que a sessão terminou, em vez de página de erro ou tela em branco (REQ-12).
  if (caminho.startsWith('/api/')) {
    throw createError({ statusCode: 401, data: { mensagem: 'Sessão terminada.' } })
  }
  return sendRedirect(event, '/entrar?sessao=terminada', 302)
})
