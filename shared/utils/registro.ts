/**
 * Número de registro do associado: `APPD-<ano>-<sequencial com 5 dígitos>`.
 * Único e imutável, gerado ao concluir o cadastro.
 *
 * A spec deste número está na change `cadastro-e-login`, não em `cracha-do-associado`:
 * o número é gerado ao concluir o cadastro, e o crachá apenas o exibe. Aqui está só a
 * formatação — e a unicidade precisa vir de restrição no banco, nunca de "ler o maior
 * e somar 1", que quebra com dois cadastros simultâneos.
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
