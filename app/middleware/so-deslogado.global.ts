/**
 * Par no cliente da guarda de `server/middleware/area.ts`.
 *
 * O middleware do servidor só roda em carregamento de página inteira. Quem já está no
 * site e clica num link vai por dentro do Vue Router, sem passar pelo servidor — e
 * chegaria ao cadastro com sessão aberta, criando uma segunda conta para a mesma pessoa.
 *
 * As duas guardas existem porque protegem coisas diferentes: a do servidor vale para link
 * direto, recarregamento e navegador sem JavaScript; esta vale para a navegação interna.
 * Quem manda é a do servidor — se as duas discordarem, a resposta HTTP é a verdade.
 *
 * A lista está repetida de propósito, e é curta: importar o módulo do servidor no bundle
 * do cliente arrastaria as ferramentas de sessão do Nitro para dentro do navegador.
 */
const SO_DESLOGADO = ['/entrar', '/atendimento/inscricao']

export default defineNuxtRouteMiddleware((para) => {
  if (!SO_DESLOGADO.includes(para.path)) return

  const { loggedIn } = useUserSession()
  if (loggedIn.value) return navigateTo('/area')
})
