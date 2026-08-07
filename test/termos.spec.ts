/**
 * O catálogo de termos de consentimento.
 *
 * O hash existe para responder, anos depois, "que texto exatamente esta pessoa aceitou?".
 * Só funciona se duas coisas forem verdade: o hash sai **do texto** (não é escrito à mão),
 * e a versão publicada **nunca some** do catálogo. Este arquivo guarda as duas.
 */

import { describe, expect, it } from 'vitest'
import { TERMO_ART11, TERMOS, hashDoTermo, versaoPorTexto } from '../shared/termos'

describe('o hash sai do texto', () => {
  it('é SHA-256 em hexadecimal, 64 caracteres', async () => {
    const hash = await hashDoTermo(TERMO_ART11.texto)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('não é o marcador de lugar que existia antes', async () => {
    // Até 2026-08-07 o cadastro gravava '0' repetido 64 vezes. Tinha o formato certo e
    // provava nada — o pior tipo de campo de prova, porque parece preenchido.
    const hash = await hashDoTermo(TERMO_ART11.texto)
    expect(hash).not.toBe('0'.repeat(64))
  })

  it('muda quando o texto muda em um caractere', async () => {
    const original = await hashDoTermo(TERMO_ART11.texto)
    const alterado = await hashDoTermo(`${TERMO_ART11.texto} `)
    expect(alterado).not.toBe(original)
  })

  it('é estável: o mesmo texto dá sempre o mesmo hash', async () => {
    const [a, b] = await Promise.all([
      hashDoTermo(TERMO_ART11.texto),
      hashDoTermo(TERMO_ART11.texto),
    ])
    expect(a).toBe(b)
  })
})

describe('o catálogo guarda o que foi publicado', () => {
  it('toda versão tem identificador, versão, vigência e texto', () => {
    for (const t of TERMOS) {
      expect(t.termoId).toBeTruthy()
      expect(t.versao).toMatch(/^v\d+$/)
      expect(t.vigenteDesde).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      expect(t.texto.length).toBeGreaterThan(200)
    }
  })

  it('não há duas versões com o mesmo par termo+versão', () => {
    const chaves = TERMOS.map((t) => `${t.termoId}@${t.versao}`)
    expect(new Set(chaves).size).toBe(chaves.length)
  })

  it('o texto de uma versão é encontrável pelo próprio texto', () => {
    expect(versaoPorTexto(TERMO_ART11.texto)?.versao).toBe('v1')
    expect(versaoPorTexto('qualquer outra coisa')).toBeNull()
  })

  it('o termo fala em português comum, sem remissão a artigo solto', () => {
    // O público deste site inclui quem tem dificuldade de leitura. Termo que exige abrir
    // a lei para entender é termo que ninguém leu de verdade — e consentimento que não
    // foi entendido não é consentimento.
    expect(TERMO_ART11.texto).toMatch(/dado de saúde/i)
    expect(TERMO_ART11.texto).toMatch(/pode retirar esta autorização/i)
    expect(TERMO_ART11.texto).not.toMatch(/outrossim|não obstante|far-se-á/i)
  })
})

describe('a rota de cadastro grava o hash de verdade', () => {
  it('não existe mais o marcador de lugar no código', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const rota = readFileSync(
      join(import.meta.dirname, '..', 'server', 'api', 'conta', 'cadastro.post.ts'),
      'utf8',
    )
    // Casa `'0'.repeat(64)` em qualquer espaçamento. O comentário histórico pode citar,
    // mas o código não pode ter.
    const codigo = rota.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(codigo).not.toMatch(/'0'\s*\.\s*repeat\(\s*64\s*\)/)
    expect(codigo).toMatch(/hashDoTermo\(/)
  })
})
