/**
 * Número de registro do associado: `APPD-<ano>-<sequencial com 5 dígitos>`.
 * Único e imutável, gerado ao concluir o cadastro.
 *
 * A spec de verdade nasce na change `cracha-do-associado` (Fase 3). Aqui está só
 * a formatação, que é o teste de fumaça da fundação do projeto.
 */
export function formatarNumeroRegistro(ano: number, sequencial: number): string {
  if (!Number.isInteger(ano) || ano < 2006) {
    throw new Error(`Ano inválido para número de registro: ${ano}`)
  }
  if (!Number.isInteger(sequencial) || sequencial < 1 || sequencial > 99999) {
    throw new Error(`Sequencial fora da faixa 1..99999: ${sequencial}`)
  }
  return `APPD-${ano}-${String(sequencial).padStart(5, '0')}`
}
