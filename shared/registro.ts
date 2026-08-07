/**
 * Número de registro do associado: `APPD-<ano>-<6 caracteres sorteados>`.
 * Exemplo: `APPD-2026-K7M2QX`. Único e imutável, gerado ao concluir o cadastro.
 *
 * **Por que sorteado e não sequencial** (decisão do dono, 2026-08-06, ADR-007):
 *
 * A rota `/verificar/<numero>` é pública e mostra nome e situação. Com numeração
 * sequencial, qualquer pessoa pede `00001`, `00002`, `00003` e monta a lista inteira de
 * associados, com nomes. Numa associação de pessoas com deficiência, essa lista não pode
 * ser montável por quem quiser — e o limite de consultas por minuto atrasa, não impede.
 *
 * De quebra some o custo escondido do desenho anterior: para saber o próximo sequencial
 * era preciso contar as linhas do ano a cada cadastro. Sorteando, a emissão é uma
 * operação só, e a unicidade continua garantida pela restrição do banco.
 *
 * A spec deste número está na change `cadastro-e-login` — é lá que ele é gerado; o crachá
 * apenas o exibe.
 */

/**
 * Alfabeto sem `0`, `O`, `1`, `I` e `L`.
 *
 * Não é purismo: este número é ditado por telefone para a secretaria, e "zero ou ó" é
 * confusão garantida com quem está do outro lado anotando à mão.
 */
const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

/** Caracteres sorteados. 31^6 ≈ 887 milhões de combinações. */
const COMPRIMENTO = 6

export const PADRAO_NUMERO_REGISTRO = /^APPD-\d{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/

/**
 * Sorteia um número de registro para o ano dado.
 *
 * Usa `crypto.getRandomValues`, não `Math.random`: o número identifica uma pessoa numa
 * página pública, e sorteio previsível derrota o motivo de ele ser sorteado.
 *
 * A rejeição do resto (`>= limite`) evita o viés de módulo — sem ela, os primeiros
 * caracteres do alfabeto sairiam com mais frequência.
 */
export function gerarNumeroRegistro(ano: number): string {
  if (!Number.isInteger(ano) || ano < 2006) {
    throw new Error(`Ano inválido para número de registro: ${ano}`)
  }

  const limite = Math.floor(256 / ALFABETO.length) * ALFABETO.length
  let sufixo = ''
  const buffer = new Uint8Array(COMPRIMENTO * 2)

  while (sufixo.length < COMPRIMENTO) {
    crypto.getRandomValues(buffer)
    for (const byte of buffer) {
      if (byte >= limite) continue
      sufixo += ALFABETO[byte % ALFABETO.length]
      if (sufixo.length === COMPRIMENTO) break
    }
  }

  return `APPD-${ano}-${sufixo}`
}

export function numeroRegistroValido(numero: string): boolean {
  return PADRAO_NUMERO_REGISTRO.test(numero)
}
