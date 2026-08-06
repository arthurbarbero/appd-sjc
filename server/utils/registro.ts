/**
 * Emissor do `numero_registro` — `cadastro-e-login` REQ-2 a REQ-5b.
 *
 * Esta change é a **dona única** do número (ADR-013). `cracha-do-associado` apenas exibe.
 *
 * A regra que parece detalhe e não é: a unicidade vem da restrição `UNIQUE` do banco, com
 * nova tentativa em caso de colisão. **Ler o maior sequencial e somar 1 é proibido** —
 * dois cadastros simultâneos leem o mesmo valor e gravam o mesmo número. A primeira versão
 * da spec do crachá mandava fazer exatamente isso, e foi o bloqueio B10 do gate.
 *
 * Consequência aceita: a retentativa **pula números**. Buraco na sequência é esperado, não
 * é defeito, e não prejudica ninguém (REQ-5a).
 */

import { formatarNumeroRegistro } from '~~/shared/utils/registro'

/** Quantas colisões seguidas antes de desistir (REQ-4). */
const MAXIMO_TENTATIVAS = 5

/** Maior sequencial de um ano — `99999`, pelo formato de 5 dígitos. */
const TETO_ANUAL = 99_999

export class SequencialEsgotado extends Error {
  constructor(readonly ano: number) {
    super(`O limite de ${TETO_ANUAL} cadastros no ano ${ano} foi atingido.`)
    this.name = 'SequencialEsgotado'
  }
}

export class ColisaoPersistente extends Error {
  constructor(readonly tentativas: number) {
    super(`Não foi possível emitir um número de registro em ${tentativas} tentativas.`)
    this.name = 'ColisaoPersistente'
  }
}

/**
 * Emite o número e grava, com retentativa sob colisão.
 *
 * `gravar` recebe o número candidato e devolve `true` se gravou. Ele **deve** deixar a
 * violação de `UNIQUE` acontecer no banco e devolver `false` — checar antes com um
 * `SELECT` reintroduz exatamente a corrida que este desenho evita.
 *
 * `contarDoAno` serve só para escolher o ponto de partida; ele pode estar desatualizado
 * sem prejuízo, porque quem garante a unicidade é o banco.
 */
export async function emitirNumeroRegistro(
  ano: number,
  contarDoAno: () => Promise<number>,
  gravar: (numero: string) => Promise<boolean>,
): Promise<string> {
  const jaEmitidos = await contarDoAno()

  for (let tentativa = 0; tentativa < MAXIMO_TENTATIVAS; tentativa++) {
    const sequencial = jaEmitidos + 1 + tentativa
    if (sequencial > TETO_ANUAL) throw new SequencialEsgotado(ano)

    const numero = formatarNumeroRegistro(ano, sequencial)
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
