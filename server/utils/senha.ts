/**
 * Etapa 2 da derivação — a que roda **no servidor** (`cadastro-e-login` REQ-6).
 *
 * O trabalho caro já aconteceu no navegador. Aqui só se re-embaralha o que chegou, com
 * um sal próprio, e isso custa menos de 1 ms — cabe folgado nos 10 ms do plano gratuito.
 *
 * O re-embaralhamento não é enfeite: sem ele, o valor guardado seria idêntico ao que
 * trafega, e um vazamento do banco entregaria a credencial de entrada pronta. Com ele, o
 * que está no banco não serve para entrar em lugar nenhum.
 */

import { randomBytes, timingSafeEqual, createHash } from 'node:crypto'
import { PARAMETROS_CLIENTE } from '~~/shared/senha'

/** O que fica gravado na linha do usuário. */
export interface SenhaGravada {
  /** `senha_hash`: hexadecimal de 64 caracteres. */
  hash: string
  /** `senha_params`: JSON com os parâmetros do cliente e o sal do servidor. */
  params: string
}

interface ParamsGravados {
  versao: number
  N: number
  r: number
  p: number
  salServidor: string
}

function embaralha(chaveHex: string, salServidorHex: string): string {
  return createHash('sha256')
    .update(Buffer.from(chaveHex, 'hex'))
    .update(Buffer.from(salServidorHex, 'hex'))
    .digest('hex')
}

/**
 * Recebe a chave derivada pelo navegador e devolve o que gravar.
 *
 * Os parâmetros do cliente vão junto porque, no dia em que mudarem, é preciso saber com
 * qual deles cada senha foi feita — senão a troca invalida a senha de quem já se
 * cadastrou.
 */
export function prepararSenha(chaveHex: string): SenhaGravada {
  const salServidor = randomBytes(16).toString('hex')
  const params: ParamsGravados = {
    versao: PARAMETROS_CLIENTE.versao,
    N: PARAMETROS_CLIENTE.N,
    r: PARAMETROS_CLIENTE.r,
    p: PARAMETROS_CLIENTE.p,
    salServidor,
  }
  return { hash: embaralha(chaveHex, salServidor), params: JSON.stringify(params) }
}

/**
 * Confere a chave recebida contra o que está gravado, em tempo constante.
 *
 * `timingSafeEqual` em vez de `===` porque a comparação byte a byte do JavaScript para no
 * primeiro caractere diferente, e a diferença de tempo entre "errou no primeiro" e
 * "errou no último" é mensurável pela rede. Não é paranoia: é o mesmo motivo do REQ-27.
 */
export function conferirSenha(chaveHex: string, gravado: SenhaGravada): boolean {
  let params: ParamsGravados
  try {
    params = JSON.parse(gravado.params) as ParamsGravados
  } catch {
    return false
  }
  if (!params?.salServidor) return false

  const calculado = Buffer.from(embaralha(chaveHex, params.salServidor), 'hex')
  const esperado = Buffer.from(gravado.hash, 'hex')
  if (calculado.length !== esperado.length) return false
  return timingSafeEqual(calculado, esperado)
}

/**
 * Trabalho equivalente ao de conferir uma senha, para quando o e-mail não existe.
 *
 * Sem isto, responder na hora entrega a resposta pelo relógio: e-mail inexistente volta
 * em 1 ms, e-mail existente em 3 ms. O REQ-27 proíbe essa diferença observável, e o REQ-25
 * ficaria inútil — de nada adianta a mensagem ser igual se o tempo denuncia.
 */
export function gastarTempoEquivalente(chaveHex: string): void {
  const falso = prepararSenha(chaveHex)
  conferirSenha(chaveHex, falso)
}
