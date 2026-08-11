/**
 * O catálogo de termos de consentimento — T4 de `consentimento-e-privacidade`.
 *
 * O hash existe para responder, anos depois, "que texto exatamente esta pessoa aceitou?".
 * Só funciona se três coisas forem verdade: o hash sai **do texto** (não é escrito à mão),
 * a versão publicada **nunca some** do catálogo, e o texto de uma versão publicada **nunca
 * muda**. Este arquivo guarda as três, e o terceiro guardião é bloqueante: alterar uma
 * letra de um termo já publicado deixa o CI vermelho.
 */

import { describe, expect, it } from 'vitest'
import {
  TERMO_ART11,
  TERMOS,
  conferirIntegridade,
  hashDoTermo,
  precisaNovoAceite,
  validarCatalogo,
  versaoPorHash,
  versaoPorTexto,
  versaoVigente,
  type VersaoTermo,
} from '../shared/termos'

/** Catálogo de mentira, para exercitar vigência e tipo de mudança sem publicar nada. */
function catalogo(...versoes: Partial<VersaoTermo>[]): VersaoTermo[] {
  return versoes.map((v, i) => ({
    termoId: 'termo-teste',
    versao: `v${i + 1}`,
    dataVigencia: '2026-01-01T00:00:00Z',
    tipoMudanca: 'material',
    hash: String(i + 1).repeat(64),
    texto: `texto da versão ${i + 1}`,
    ...v,
  }))
}

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

describe('texto de versão publicada é imutável (REQ-2)', () => {
  /*
    Este é **o** teste bloqueante da T4. Ele não confere um valor esperado escrito à mão:
    recalcula o hash de cada versão a partir do texto que está no arquivo e compara com o
    que a versão declara. Mexeu no texto de um termo já publicado, diverge, e o CI barra.

    A saída certa, quando o texto precisa mudar, é publicar `v2` — nunca editar `v1`.
  */
  it('o hash declarado bate com o hash do texto, em todas as versões', async () => {
    const divergencias = await conferirIntegridade()
    expect(
      divergencias,
      divergencias
        .map((d) => `${d.termoId}@${d.versao}: declara ${d.declarado}, o texto dá ${d.calculado}`)
        .join('; '),
    ).toEqual([])
  })

  it('a conferência acusa quando o texto de uma versão publicada é alterado', async () => {
    // Prova que o guardião detecta: teste de integridade que não fica vermelho quando o
    // texto muda é carimbo, não gate.
    const adulterado = catalogo({ hash: TERMO_ART11.hash, texto: `${TERMO_ART11.texto} ` })
    const divergencias = await conferirIntegridade(adulterado)
    expect(divergencias).toHaveLength(1)
    expect(divergencias[0]!.declarado).not.toBe(divergencias[0]!.calculado)
  })
})

describe('toda versão do catálogo declara os campos obrigatórios (REQ-1)', () => {
  it('as versões publicadas passam na validação', () => {
    expect(() => validarCatalogo()).not.toThrow()
    for (const t of TERMOS) {
      expect(t.termoId).toBeTruthy()
      expect(t.versao).toMatch(/^v\d+$/)
      expect(t.dataVigencia).toMatch(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}Z)?$/)
      expect(['material', 'editorial']).toContain(t.tipoMudanca)
      expect(t.hash).toMatch(/^[0-9a-f]{64}$/)
      expect(t.texto.length).toBeGreaterThan(200)
    }
  })

  const malformados: [string, Partial<VersaoTermo>][] = [
    ['sem termoId', { termoId: '' }],
    ['versão fora do formato vN', { versao: '1.0' }],
    ['data de vigência em formato brasileiro', { dataVigencia: '01/09/2026' }],
    ['data de vigência sem UTC', { dataVigencia: '2026-09-01T00:00:00-03:00' }],
    ['tipo de mudança inventado', { tipoMudanca: 'ortográfica' as never }],
    ['hash em maiúsculas', { hash: 'A'.repeat(64) }],
    ['hash curto', { hash: 'a'.repeat(63) }],
    ['texto vazio', { texto: '   ' }],
  ]

  it.each(malformados)('o carregamento falha com %s', (_nome, defeito) => {
    expect(() => validarCatalogo(catalogo(defeito))).toThrow()
  })

  it('o carregamento falha com o mesmo par termo+versão duas vezes', () => {
    expect(() => validarCatalogo(catalogo({ versao: 'v1' }, { versao: 'v1' }))).toThrow(/repetida/i)
  })

  it('o catálogo publicado não tem duas versões com o mesmo par termo+versão', () => {
    const chaves = TERMOS.map((t) => `${t.termoId}@${t.versao}`)
    expect(new Set(chaves).size).toBe(chaves.length)
  })
})

describe('qual versão vale em cada instante (REQ-3)', () => {
  const duas = catalogo(
    { versao: 'v1', dataVigencia: '2026-08-07T00:00:00Z' },
    { versao: 'v2', dataVigencia: '2026-09-01' },
  )

  it('quem abre o formulário depois da vigência recebe a versão nova', () => {
    expect(versaoVigente('termo-teste', '2026-09-02', duas).versao).toBe('v2')
  })

  it('versão com vigência futura ainda não é exigida', () => {
    expect(versaoVigente('termo-teste', '2026-08-20', duas).versao).toBe('v1')
  })

  it('no primeiro instante da vigência a versão nova já vale', () => {
    expect(versaoVigente('termo-teste', '2026-09-01T00:00:00Z', duas).versao).toBe('v2')
  })

  it('sem versão vigente, estoura em vez de devolver qualquer coisa', () => {
    // Devolver a mais antiga "para não quebrar" gravaria aceite de termo que não vigia.
    expect(() => versaoVigente('termo-teste', '2020-01-01', duas)).toThrow(/vigente/i)
  })

  it('o termo do Art. 11 tem versão vigente hoje', () => {
    expect(versaoVigente('deficiencia-art11').versao).toBe('v1')
  })
})

describe('publicar versão nova não invalida o que já foi aceito (REQ-4)', () => {
  it('a entrada da versão antiga continua idêntica no catálogo com a nova', () => {
    /*
      A parte de banco deste cenário — "nenhuma linha de consentimentos foi alterada nem
      apagada" — é garantida em `test/consentimento.spec.ts`, que prova que o código não
      tem UPDATE nem DELETE sobre a tabela. Aqui fica a outra metade: a versão antiga
      sobrevive ao catálogo crescer, com hash e texto intactos.
    */
    const antes = catalogo({ versao: 'v1', hash: 'a'.repeat(64), texto: 'o que ela leu' })
    const depois = [
      ...antes,
      ...catalogo({ versao: 'v2', dataVigencia: '2026-09-01', hash: 'b'.repeat(64) }),
    ]
    expect(depois.find((t) => t.versao === 'v1')).toEqual(antes[0])
    expect(versaoPorHash('a'.repeat(64), depois)?.texto).toBe('o que ela leu')
  })
})

describe('mudança material pede novo aceite; editorial não (REQ-11, REQ-12)', () => {
  const material = catalogo(
    { versao: 'v1', dataVigencia: '2026-08-07T00:00:00Z' },
    { versao: 'v2', dataVigencia: '2026-09-01', tipoMudanca: 'material' },
  )
  const editorial = catalogo(
    { versao: 'v1', dataVigencia: '2026-08-07T00:00:00Z' },
    { versao: 'v2', dataVigencia: '2026-09-01', tipoMudanca: 'editorial' },
  )

  it('quem aceitou v1 e virou v2 material precisa aceitar de novo', () => {
    expect(precisaNovoAceite('termo-teste', 'v1', '2026-09-02', material)).toBe(true)
  })

  it('quem aceitou v1 e virou v2 editorial não precisa', () => {
    expect(precisaNovoAceite('termo-teste', 'v1', '2026-09-02', editorial)).toBe(false)
  })

  it('enquanto a v2 material não entra em vigência, nada é pedido', () => {
    expect(precisaNovoAceite('termo-teste', 'v1', '2026-08-20', material)).toBe(false)
  })

  it('quem aceitou a versão vigente não precisa de nada', () => {
    expect(precisaNovoAceite('termo-teste', 'v2', '2026-09-02', material)).toBe(false)
  })

  it('quem nunca aceitou precisa aceitar', () => {
    expect(precisaNovoAceite('termo-teste', null, '2026-09-02', material)).toBe(true)
  })

  it('versão aceita que não existe no catálogo pede aceite novo', () => {
    // Não dá para afirmar que continua valendo o que ninguém consegue mais ler.
    expect(precisaNovoAceite('termo-teste', 'v9', '2026-09-02', material)).toBe(true)
  })

  it('uma material no meio de editoriais ainda pede aceite', () => {
    const misto = catalogo(
      { versao: 'v1', dataVigencia: '2026-08-07T00:00:00Z' },
      { versao: 'v2', dataVigencia: '2026-09-01', tipoMudanca: 'material' },
      { versao: 'v3', dataVigencia: '2026-10-01', tipoMudanca: 'editorial' },
    )
    expect(precisaNovoAceite('termo-teste', 'v1', '2026-10-02', misto)).toBe(true)
  })
})

describe('o catálogo guarda o que foi publicado', () => {
  it('a versão é encontrável pelo hash que foi exibido', () => {
    expect(versaoPorHash(TERMO_ART11.hash)?.versao).toBe('v1')
    expect(versaoPorHash('f'.repeat(64))).toBeNull()
  })

  it('o texto de uma versão é encontrável pelo próprio texto', () => {
    expect(versaoPorTexto(TERMO_ART11.texto)?.versao).toBe('v1')
    expect(versaoPorTexto('qualquer outra coisa')).toBeNull()
  })

  it('o resumo diz a finalidade e que dá para retirar', () => {
    // O que o texto precisa ter é o que a pessoa está autorizando e como desfazer. Se ela
    // lê ou não é escolha dela — o teste não policia vocabulário.
    // O texto é quebrado em linhas para caber na largura do arquivo; a frase não é.
    const corrido = TERMO_ART11.texto.replace(/\s+/g, ' ')
    expect(corrido).toMatch(/organizar o atendimento/i)
    expect(corrido).toMatch(/pode retirar esta autorização/i)
  })
})
