/**
 * O conteúdo da Política de Privacidade — T8 de `consentimento-e-privacidade`.
 *
 * Aqui se testa **o texto**, não o layout: o que a página afirma, o que ela não pode
 * afirmar, e a ordem em que as coisas aparecem. O layout renderizado — altura de
 * parágrafo, foco do sumário, sumário aberto no celular — é medido no `npm run aceite`,
 * com a página de pé, porque "cinco linhas" só existe depois de renderizar.
 *
 * O que estes testes impedem de voltar:
 *
 * - **prazo de retenção publicado** (REQ-23). Não é `[A CONFIRMAR]`: o ADR-017 decidiu que
 *   não há retenção. Um número de dias aqui é invenção, e invenção em política de
 *   privacidade é o tipo de erro que a associação assina sem saber;
 * - **juridiquês antes da explicação** (REQ-21). O bloco "No termo da lei" vem depois, e
 *   nunca abre uma seção;
 * - **a promessa errada sobre a foto**. Até o ADR-015 a frase certa era "a foto nunca é
 *   pública"; hoje ela aparece na verificação e o que não existe é endereço próprio.
 */

import { describe, expect, it } from 'vitest'
import { POLITICA_PRIVACIDADE } from '../shared/conteudo'

const paragrafos = POLITICA_PRIVACIDADE.flatMap((s) =>
  s.blocos.flatMap((b) => {
    if (b.tipo === 'p') return [b.texto]
    if (b.tipo === 'lista') return [...b.itens]
    if (b.tipo === 'sub') return [...b.itens]
    if (b.tipo === 'cartoes') return b.itens.map((c) => c.texto)
    if (b.tipo === 'lei') return [b.texto]
    return []
  }),
)

const textoCorrido = paragrafos.join(' ')

describe('a estrutura da política (REQ-21, REQ-26)', () => {
  it('cada seção tem id e título, e nenhum id se repete', () => {
    const ids = POLITICA_PRIVACIDADE.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of POLITICA_PRIVACIDADE) {
      expect(s.id).toMatch(/^[a-z-]+$/)
      expect(s.titulo.length).toBeGreaterThan(8)
    }
  })

  it('nenhuma seção começa pelo dispositivo legal', () => {
    for (const s of POLITICA_PRIVACIDADE) {
      expect(s.blocos[0]?.tipo, `a seção "${s.titulo}" abre com o juridiquês`).not.toBe('lei')
    }
  })

  it('todo bloco de lei vem depois de uma explicação em linguagem simples', () => {
    for (const s of POLITICA_PRIVACIDADE) {
      s.blocos.forEach((bloco, i) => {
        if (bloco.tipo !== 'lei') return
        const antes = s.blocos.slice(0, i).map((b) => b.tipo)
        expect(antes, `a seção "${s.titulo}" tem lei sem explicação antes`).toContain('p')
      })
    }
  })

  it('só o dado sensível tem destaque próprio', () => {
    const comDestaque = POLITICA_PRIVACIDADE.filter((s) => s.destaque).map((s) => s.id)
    expect(comDestaque).toEqual(['dado-sensivel'])
  })

  it('nenhum título usa numeração de cláusula', () => {
    // "4.2.1" é a estética de contrato que a tela existe para não ter (REQ-22).
    for (const s of POLITICA_PRIVACIDADE) {
      expect(s.titulo).not.toMatch(/^\d+(\.\d+)+/)
    }
  })
})

describe('o que a política não pode publicar (REQ-23)', () => {
  it('nenhum prazo de retenção em dias, meses ou anos', () => {
    const achados = paragrafos.filter((t) => /\b\d+\s*(dias?|meses|m[êe]s|anos?)\b/i.test(t))
    expect(achados, `prazo publicado: ${achados.join(' | ')}`).toEqual([])
  })

  it('nenhum nome ou contato de encarregado inventado', () => {
    // A pendência aparece como marcação, não como pessoa. PB-2 é da associação.
    const pendencias = POLITICA_PRIVACIDADE.flatMap((s) =>
      s.blocos.filter((b) => b.tipo === 'confirmar').map((b) => b.rotulo),
    )
    expect(pendencias).toContain('Encarregado de dados')
    expect(textoCorrido).not.toMatch(/encarregad[oa]\s+(é|:)\s*\w+/i)
  })

  it('a palavra "fila" não aparece: a APPD não opera fila (ADR-014)', () => {
    expect(textoCorrido.toLowerCase()).not.toMatch(/\bfila\b/)
  })

  it('nenhum parágrafo é longo demais para caber em cinco linhas', () => {
    /*
      **200 caracteres, medido — não chutado.** O primeiro palpite foi 320, e o gate de
      aceite reprovou seis parágrafos que passavam aqui: a 360px, com corpo de 17px, cinco
      linhas comportam mais ou menos 175 caracteres, não 320. O teto ficou em 200 porque
      acima disso o parágrafo depende da sorte da quebra de palavra.

      A medida honesta continua sendo a do `npm run aceite`, que conta linha renderizada.
      Esta aqui pega o texto comprido **antes** de virar tela, que é quando dá menos
      trabalho consertar.
    */
    const compridos = paragrafos.filter((t) => t.length > 200).map((t) => `${t.slice(0, 50)}…`)
    expect(compridos, `parágrafo comprido demais: ${compridos.join(' | ')}`).toEqual([])
  })
})

describe('as garantias que a política declara (REQ-24)', () => {
  it('diz que o tipo de deficiência não aparece no crachá sem o opt-in', () => {
    expect(textoCorrido).toMatch(/não aparece no crachá impresso/i)
  })

  it('diz o que muda quando o opt-in é marcado, em vez de só o que ele bloqueia', () => {
    // Desde o ADR-019 o consentimento governa os dois destinos. Uma política que só
    // dissesse "não mostramos" estaria descrevendo um sistema que não é este.
    const cartoes = POLITICA_PRIVACIDADE.find((s) => s.id === 'dado-sensivel')?.blocos.find(
      (b) => b.tipo === 'cartoes',
    )
    expect(cartoes && cartoes.tipo === 'cartoes' && cartoes.itens.length).toBe(2)
    expect(textoCorrido).toMatch(/página pública de verificação/i)
  })

  it('diz a verdade estreita sobre a foto: aparece, mas sem endereço próprio', () => {
    expect(textoCorrido).toMatch(/foto aparece na página pública de verificação/i)
    expect(textoCorrido).toMatch(/não tem é endereço próprio/i)
    // A frase antiga, que virou mentira com o ADR-015.
    expect(textoCorrido).not.toMatch(/a foto nunca é publicada/i)
  })

  it('cita o Art. 11 no bloco de lei da seção do dado sensível', () => {
    const lei = POLITICA_PRIVACIDADE.find((s) => s.id === 'dado-sensivel')?.blocos.find(
      (b) => b.tipo === 'lei',
    )
    expect(lei && lei.tipo === 'lei' && lei.texto).toMatch(/Art\. 11/)
  })

  it('diz que o registro do aceite não guarda IP nem aparelho (REQ-10)', () => {
    // A página promete o que o código faz. Se um dia a coluna voltar, a promessa vira
    // mentira — e `test/consentimento.spec.ts` é quem impede a coluna de voltar.
    expect(textoCorrido).toMatch(/não guarda o seu endereço de internet/i)
  })
})
