/** `POST /api/conta/sair` — apaga o cookie deste aparelho.
 *
 * O que ele NÃO faz, e a tela precisa dizer (REQ-14): derrubar a sessão de outro
 * aparelho. Cookie selado não é revogável — dívida aceita no ADR-002. Prometer o
 * contrário seria pior do que não ter o botão.
 */
export default defineEventHandler(async (event) => {
  await fecharSessao(event)
  return { saiu: true }
})
