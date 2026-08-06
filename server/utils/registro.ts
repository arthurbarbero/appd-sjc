/**
 * Emissor do `numero_registro` — `cadastro-e-login` REQ-2 a REQ-5b.
 *
 * Esta change é a **dona única** do número (ADR-013). `cracha-do-associado` apenas exibe.
 *
 * O número é sorteado (ADR-007), não sequencial: sequencial deixaria a lista de
 * associados montável a partir da página pública de verificação. Como é sorteado, a
 * emissão não precisa consultar nada — sorteia e grava. A retentativa existe para o caso
 * improvável de colisão, e quem a detecta é a restrição `UNIQUE` do banco, nunca um
 * `SELECT` antes (que reintroduziria a corrida entre dois cadastros simultâneos).
 */

import { gerarNumeroRegistro } from '~~/shared/utils/registro'

/** Com 887 milhões de combinações, chegar a 5 colisões seguidas é sinal de outro defeito. */
const MAXIMO_TENTATIVAS = 5

export class ColisaoPersistente extends Error {
  constructor(readonly tentativas: number) {
    super(`Não foi possível emitir um número de registro em ${tentativas} tentativas.`)
    this.name = 'ColisaoPersistente'
  }
}

/**
 * Sorteia e grava, com retentativa sob colisão.
 *
 * `gravar` recebe o número candidato e devolve `true` se gravou, `false` se o banco
 * recusou por número repetido. Qualquer outro erro ele deve deixar subir.
 */
export async function emitirNumeroRegistro(
  ano: number,
  gravar: (numero: string) => Promise<boolean>,
): Promise<string> {
  for (let tentativa = 0; tentativa < MAXIMO_TENTATIVAS; tentativa++) {
    const numero = gerarNumeroRegistro(ano)
    if (await gravar(numero)) return numero
  }
  throw new ColisaoPersistente(MAXIMO_TENTATIVAS)
}

/** Ano corrente em `America/Sao_Paulo` — o fuso da associação, não o do servidor. */
export function anoCorrente(agora = new Date()): number {
  return Number(
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
    }).format(agora),
  )
}
