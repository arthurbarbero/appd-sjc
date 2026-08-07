import { describe, expect, it } from 'vitest'
import {
  gerarNumeroRegistro,
  numeroRegistroValido,
  PADRAO_NUMERO_REGISTRO,
} from '../shared/registro'

describe('gerarNumeroRegistro', () => {
  it('produz o formato APPD-<ano>-<6 caracteres>', () => {
    expect(gerarNumeroRegistro(2026)).toMatch(PADRAO_NUMERO_REGISTRO)
  })

  it('nunca usa caracteres que se confundem ao ditar por telefone', () => {
    // 0/O e 1/I/L são a confusão clássica de quem anota do outro lado da linha.
    const sufixos = Array.from({ length: 500 }, () => gerarNumeroRegistro(2026).slice(10))
    expect(sufixos.join('')).not.toMatch(/[0O1IL]/)
  })

  it('quase não repete em 5 mil sorteios', () => {
    /*
      Não prova unicidade — quem garante isso é o UNIQUE do banco. Prova que o sorteio não
      está preso num punhado de valores, que é a falha silenciosa deste tipo de código.

      **Por que não `toBe(5000)`**, que era a asserção original: o espaço tem 31⁶ ≈ 8,9×10⁸
      valores, e o paradoxo do aniversário dá ~0,014 colisão esperada em 5 mil sorteios —
      ou seja, esta asserção reprovava sozinha em cerca de 1,4% das execuções, sem nenhum
      defeito no código. Aconteceu em 2026-08-07. Teste que falha por acaso ensina a
      ignorar vermelho, que é pior do que não ter o teste.

      A folga de 10 é enorme para o acaso (~700 vezes a colisão esperada) e apertadíssima
      para o defeito que interessa: um gerador preso em poucos valores produz centenas ou
      milhares de repetições, não dez.
    */
    const gerados = new Set(Array.from({ length: 5000 }, () => gerarNumeroRegistro(2026)))
    expect(gerados.size).toBeGreaterThanOrEqual(4990)
  })

  it('espalha pelo alfabeto inteiro, sem viés de módulo', () => {
    // Sortear byte e tirar o resto sem rejeitar o excedente enviesa os primeiros
    // caracteres. Com 31 símbolos e 20 mil amostras, todos têm de aparecer.
    const usados = new Set(
      Array.from({ length: 20_000 }, () => gerarNumeroRegistro(2026).slice(10)).join(''),
    )
    expect(usados.size).toBe(31)
  })

  it('recusa ano anterior à fundação da APPD', () => {
    expect(() => gerarNumeroRegistro(2005)).toThrow(/Ano inválido/)
    expect(() => gerarNumeroRegistro(2026.5)).toThrow(/Ano inválido/)
  })
})

describe('numeroRegistroValido', () => {
  it('aceita o formato correto', () => {
    expect(numeroRegistroValido('APPD-2026-K7M2QX')).toBe(true)
  })

  it('recusa o formato sequencial antigo', () => {
    // Garante que dado gravado antes do ADR-007 não passe despercebido.
    expect(numeroRegistroValido('APPD-2026-00042')).toBe(false)
  })

  it('recusa prefixo errado, caixa baixa e comprimento errado', () => {
    expect(numeroRegistroValido('ATD-2026-K7M2QX')).toBe(false)
    expect(numeroRegistroValido('appd-2026-k7m2qx')).toBe(false)
    expect(numeroRegistroValido('APPD-2026-K7M2Q')).toBe(false)
    expect(numeroRegistroValido('APPD-2026-K7M2QXZ')).toBe(false)
  })

  it('recusa caractere ambíguo mesmo com o formato certo', () => {
    expect(numeroRegistroValido('APPD-2026-K7M2Q0')).toBe(false)
    expect(numeroRegistroValido('APPD-2026-K7M2QI')).toBe(false)
  })
})
