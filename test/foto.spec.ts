/**
 * A revalidação da foto no servidor (REQ-14 de `cracha-do-associado`).
 *
 * O que se prova aqui é que o servidor **não confia no cliente**: `curl` não passa por
 * `canvas`, e quem posta em `/api/area/foto` pode ter contornado a tela inteira. A
 * dimensão é lida dos bytes, e um arquivo que mente sobre o que é não passa.
 */

import { describe, expect, it } from 'vitest'
import { ALTURA, LARGURA, TETO_BYTES, TIPOS_ORIGEM, dimensoesJpeg } from '../shared/foto'

/** Monta o cabeçalho de um JPEG com um SOF0 de dimensão escolhida. */
function jpegDe(largura: number, altura: number, marcador = 0xc0) {
  return Uint8Array.from([
    0xff,
    0xd8, // SOI
    0xff,
    0xe0,
    0x00,
    0x10, // APP0 de 16 bytes, que precisa ser pulado
    ...new Array(14).fill(0),
    0xff,
    marcador,
    0x00,
    0x11, // SOF, tamanho 17
    0x08, // precisão
    (altura >> 8) & 0xff,
    altura & 0xff,
    (largura >> 8) & 0xff,
    largura & 0xff,
    ...new Array(8).fill(0),
  ])
}

describe('dimensoesJpeg', () => {
  it('lê a dimensão pulando os segmentos que vêm antes do quadro', () => {
    expect(dimensoesJpeg(jpegDe(400, 500))).toEqual({ largura: 400, altura: 500 })
  })

  it('entende os outros marcadores de quadro, não só o SOF0', () => {
    for (const marcador of [0xc1, 0xc2, 0xc9]) {
      expect(dimensoesJpeg(jpegDe(400, 500, marcador))).toEqual({ largura: 400, altura: 500 })
    }
  })

  it('recusa arquivo que não começa em SOI', () => {
    // PNG legítimo: é imagem, mas não é o que a tabela aceita.
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
    expect(dimensoesJpeg(png)).toBeNull()
  })

  it('recusa arquivo vazio e cabeçalho truncado', () => {
    expect(dimensoesJpeg(new Uint8Array())).toBeNull()
    expect(dimensoesJpeg(Uint8Array.from([0xff, 0xd8]))).toBeNull()
  })

  it('recusa JPEG que chega ao dado comprimido sem declarar quadro', () => {
    // SOI seguido direto de SOS: nenhum SOF apareceu, logo não há dimensão para conferir.
    const semQuadro = Uint8Array.from([
      0xff,
      0xd8,
      0xff,
      0xda,
      0x00,
      0x0c,
      ...new Array(16).fill(0),
    ])
    expect(dimensoesJpeg(semQuadro)).toBeNull()
  })

  it('devolve a dimensão real quando ela não é a exigida', () => {
    // O importante: não é o parser que decide, é a rota. Aqui ele só precisa contar a
    // verdade, para a mensagem de erro poder dizer o que veio.
    expect(dimensoesJpeg(jpegDe(1200, 1600))).toEqual({ largura: 1200, altura: 1600 })
  })
})

describe('os limites são um só, para as duas portas de entrada', () => {
  it('o teto rígido é o mesmo que o CHECK da tabela fotos', () => {
    expect(TETO_BYTES).toBe(102_400)
  })

  it('a dimensão exigida é a mesma que o CHECK da tabela fotos', () => {
    expect([LARGURA, ALTURA]).toEqual([400, 500])
  })

  it('a origem aceita as três entradas do REQ-9 e nada além', () => {
    expect([...TIPOS_ORIGEM]).toEqual(['image/jpeg', 'image/png', 'image/webp'])
  })
})
