import { describe, expect, it } from 'vitest'
import { formatarNumeroRegistro } from '../shared/utils/registro'

describe('formatarNumeroRegistro', () => {
  it('preenche o sequencial com 5 dígitos', () => {
    expect(formatarNumeroRegistro(2026, 7)).toBe('APPD-2026-00007')
  })

  it('mantém o sequencial cheio sem truncar', () => {
    expect(formatarNumeroRegistro(2026, 99999)).toBe('APPD-2026-99999')
  })

  it('recusa sequencial fora da faixa', () => {
    expect(() => formatarNumeroRegistro(2026, 0)).toThrow(/faixa/)
    expect(() => formatarNumeroRegistro(2026, 100000)).toThrow(/faixa/)
  })

  it('recusa ano anterior à fundação da APPD', () => {
    expect(() => formatarNumeroRegistro(2005, 1)).toThrow(/Ano inválido/)
  })
})
