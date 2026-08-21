/**
 * Modo atendimento — o teto de cadastros que cabe num mutirão.
 *
 * Pedido da APPD em 2026-08-21: "existe multidão também, então precisamos aumentar os
 * limites de ratelimit". A associação cadastra em fila, no balcão, muitas vezes de um
 * aparelho só — e do lado do servidor isso é indistinguível de um robô, que é exatamente o
 * que o limite existe para deter.
 *
 * ## Por que não simplesmente aumentar o número
 *
 * Porque o limite valeria menos 24 horas por dia para resolver quatro horas por mês. O
 * desenho separa **o público**, que continua com teto baixo, do **atendimento**, que
 * precisa de teto alto por algumas horas — e a separação não pode depender de reconhecer o
 * IP da associação, que muda a cada rede.
 *
 * ## O selo, e por que não é `nuxt-auth-utils`
 *
 * O cookie carrega `<expiraEm>.<hmac>`, com o mesmo HMAC que o limite de frequência já usa.
 * Não é sessão de pessoa: não identifica ninguém, não dá acesso a dado nenhum e não se
 * confunde com a sessão do associado — que mora em outro cookie e carrega o id de quem
 * entrou. Misturar os dois faria o atendente "ser" o associado que ele acabou de cadastrar.
 *
 * ## O que este modo **não** faz
 *
 * Não dispensa consentimento, não afrouxa validação, não abre dado de ninguém, não dá
 * acesso a tela nenhuma. Ele mexe num número, e só. Qualquer coisa a mais que apareça aqui
 * é sinal de que virou o painel administrativo pela porta dos fundos.
 */

import type { H3Event } from 'h3'

/** Nome do cookie. Prefixo `__Host-` é o mais restritivo: mesma origem, só HTTPS, path `/`. */
const COOKIE = '__Host-modo-atendimento'

/**
 * Seis horas — o tamanho de um dia de mutirão, com folga.
 *
 * Prazo curto de propósito: um selo esquecido não pode deixar a porta larga aberta para
 * sempre, e o custo de ligar de novo é digitar uma senha.
 */
export const DURACAO_SEGUNDOS = 6 * 60 * 60

/**
 * O teto no modo atendimento, contra os 12 do público, na mesma janela de 15 minutos.
 *
 * **Este número é provisório.** Ele precisa vir de quantas pessoas a APPD atende num
 * mutirão, e a pergunta está em `docs/pendencias-appd.md`, item 4c. 120 em 15 minutos são
 * oito por minuto sustentados — mais do que uma fila de balcão consegue, e ainda assim um
 * teto: não é "sem limite", que seria a resposta preguiçosa a este pedido.
 */
export const LIMITE_ATENDIMENTO = { escopo: 'inscricao', maximo: 120, janelaSegundos: 900 } as const

/** O teto de sempre, para quem chega pela internet. */
export const LIMITE_PUBLICO = { escopo: 'inscricao', maximo: 12, janelaSegundos: 900 } as const

function segredo(event: H3Event): string | null {
  const env = event.context.cloudflare?.env as { MODO_ATENDIMENTO_SENHA?: string } | undefined
  return env?.MODO_ATENDIMENTO_SENHA ?? process.env.MODO_ATENDIMENTO_SENHA ?? null
}

/**
 * Compara duas cadeias em tempo constante.
 *
 * Numa senha comparada com `===`, o tempo de resposta vaza quantos caracteres iniciais estão
 * certos, e uma senha curta cai por tentativa e erro medida. O limite de frequência abaixo
 * já torna isso impraticável; as duas defesas custam pouco e não dependem uma da outra.
 */
function iguaisEmTempoConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diferenca = 0
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diferenca === 0
}

/**
 * Liga o modo neste navegador, se a senha bater.
 *
 * **Falha fechada**: sem o segredo configurado, não liga. É a mesma regra do segredo do
 * limite de frequência — a aplicação nunca degrada a proteção por falta de chave.
 */
export async function ligarModoAtendimento(event: H3Event, senha: string): Promise<boolean> {
  const esperada = segredo(event)
  if (!esperada || !senha) return false
  if (!iguaisEmTempoConstante(senha, esperada)) return false

  const expiraEm = Date.now() + DURACAO_SEGUNDOS * 1000
  const selo = await chaveHmac(String(expiraEm), esperada)
  setCookie(event, COOKIE, `${expiraEm}.${selo}`, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: DURACAO_SEGUNDOS,
  })
  return true
}

export function desligarModoAtendimento(event: H3Event): void {
  deleteCookie(event, COOKIE, { path: '/', secure: true, sameSite: 'strict' })
}

/** Se este pedido veio de um navegador com o modo ligado e dentro do prazo. */
export async function emModoAtendimento(event: H3Event): Promise<boolean> {
  const bruto = getCookie(event, COOKIE)
  const esperada = segredo(event)
  if (!bruto || !esperada) return false

  const [expiraEm, selo] = bruto.split('.')
  if (!expiraEm || !selo) return false
  if (Number(expiraEm) <= Date.now()) return false

  /*
    O prazo está **dentro** do selo, e não só no `maxAge` do cookie.

    `maxAge` é instrução ao navegador, e navegador é do outro lado: quem quiser guardar o
    cookie além do prazo consegue. O que impede a prorrogação é o HMAC cobrir a data.
  */
  return iguaisEmTempoConstante(selo, await chaveHmac(expiraEm, esperada))
}
