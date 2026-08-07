/**
 * `GET /api/area/foto` — devolve a foto do crachá de quem está na sessão.
 *
 * T2.4 de `cracha-do-associado`. Rota **autenticada**: sem sessão são 401 e nenhum byte
 * de imagem (REQ-16).
 *
 * Não existe parâmetro de usuário, de propósito. Uma rota que aceitasse
 * `?usuario=<id>` precisaria decidir entre 403 e 404 para o cadastro alheio, e as duas
 * respostas confirmam que o cadastro existe (REQ-17). Sem parâmetro, não há o que
 * enumerar.
 */

export default defineEventHandler(async (event) => {
  const sessao = await sessaoAtual(event)
  if (!sessao) throw createError({ statusCode: 401 })

  const foto = await armazenamentoFoto(usarBanco(event)).ler(sessao.id)
  if (!foto) throw createError({ statusCode: 404 })

  setHeader(event, 'Content-Type', foto.tipo)
  // Foto de pessoa não fica em cache de intermediário. `private` porque a resposta varia
  // por sessão; `no-store` porque o navegador de um computador compartilhado é o cenário
  // comum do público deste site.
  setHeader(event, 'Cache-Control', 'private, no-store')
  return foto.conteudo
})
