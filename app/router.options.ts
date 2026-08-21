import type { RouterConfig } from '@nuxt/schema'

/**
 * Toda troca de rota começa no topo da página.
 *
 * Pedido do dono na revisão de 2026-08-20, dito duas vezes: "quando eu clicar aqui eu
 * quero que ele suba, logicamente". Sem isto, quem estava lendo o fim de uma tela e
 * clicava no menu da área abria a próxima já no meio — o conteúdo trocava e a posição
 * não, e o efeito é o de ter pulado um pedaço.
 *
 * Três exceções, e cada uma tem motivo:
 *
 * - **Âncora** (`#conteudo`, sumário da política): a pessoa pediu um ponto específico da
 *   página. Levar ao topo seria desobedecer ao próprio link que ela acionou.
 * - **Voltar e avançar do navegador**: `savedPosition` só existe em navegação de
 *   histórico, e ali a expectativa é reencontrar o lugar de onde se saiu.
 * - **`prefers-reduced-motion`**: a rolagem acontece, mas sem animação.
 *
 * `smooth` no caso comum porque a página muda de conteúdo junto: o movimento explica que
 * foi a mesma janela que se deslocou, em vez de a tela piscar em outro ponto.
 */
export default <RouterConfig>{
  scrollBehavior(para, de, posicaoSalva) {
    if (posicaoSalva) return posicaoSalva

    if (para.hash) {
      return { el: para.hash, top: 0, behavior: 'smooth' }
    }

    // Mesma rota, só a querystring mudou: não é uma tela nova, não mexe na rolagem.
    if (para.path === de.path) return

    const semMovimento =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    return { left: 0, top: 0, behavior: semMovimento ? 'auto' : 'smooth' }
  },
}
