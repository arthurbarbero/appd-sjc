/**
 * A foto do crachá: um limite só, para os dois lugares que a recebem.
 *
 * O bloqueio B11 do gate não era "duas telas enviam foto" — era **dois limites
 * diferentes**: 5 MB aceitos no cadastro contra 102.400 bytes exigidos no crachá, o que
 * fazia uma tela gravar o que a outra recusava. Por isso os números moram aqui, num
 * módulo que o navegador e o Worker importam, e não em cada tela.
 *
 * Quem é dono destas regras é a change `cracha-do-associado` (REQ-8a a REQ-14);
 * `formulario-atendimento` chama (REQ-7e). Ver
 * [ADR-003](../docs/adr/adr-003-foto-do-cracha-como-blob-no-d1.md).
 */

/** Teto do arquivo que a pessoa escolhe, antes de qualquer processamento (REQ-9). */
export const MAXIMO_ORIGEM = 10 * 1024 * 1024

/** Tipos de origem aceitos. O que sobe é sempre JPEG, seja qual for a entrada. */
export const TIPOS_ORIGEM = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Dimensão exata do resultado (REQ-11). Não é "no máximo": é isto. */
export const LARGURA = 400
export const ALTURA = 500

/** Qualidade do JPEG. É proibido baixar disto para caber (REQ-12). */
export const QUALIDADE = 0.75

/** Teto rígido do que chega ao banco. Rejeita, nunca degrada em silêncio (REQ-12). */
export const TETO_BYTES = 102_400

/** Único tipo que o banco aceita — o `CHECK` da tabela `fotos` diz o mesmo. */
export const TIPO_ARMAZENADO = 'image/jpeg'

export interface FotoGravada {
  conteudo: Uint8Array
  tipo: string
  largura: number
  altura: number
}

/**
 * A porta única para a foto persistida.
 *
 * Existe para que trocar o meio de armazenamento não exija tocar em rota, componente nem
 * tela (REQ-15). Hoje a implementação é BLOB no D1, porque o R2 exige cartão de crédito e
 * o projeto roda a custo zero; se um dia isso mudar, muda só quem implementa esta
 * interface.
 */
export interface ArmazenamentoFoto {
  gravar(usuarioId: string, foto: FotoGravada): Promise<void>
  ler(usuarioId: string): Promise<FotoGravada | null>
  apagar(usuarioId: string): Promise<void>
}

/**
 * Lê largura e altura de um JPEG pelos marcadores SOF, sem decodificar a imagem.
 *
 * O servidor não confia no cliente (REQ-14): quem manda os bytes pode ter contornado a
 * tela inteira. Não existe biblioteca de imagem no workerd, e nem precisa — a dimensão
 * está no cabeçalho, a poucos bytes do início.
 *
 * Devolve `null` para qualquer coisa que não seja um JPEG bem formado. O chamador trata
 * `null` como recusa; nunca como "deixa passar".
 */
export function dimensoesJpeg(bytes: Uint8Array): { largura: number; altura: number } | null {
  // Todo JPEG começa em SOI (FF D8). Sem isso, não interessa o que o cliente disse.
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null

  let i = 2
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) return null

    const marcador = bytes[i + 1]!
    // Bytes de preenchimento entre segmentos são legais; pule sem contar como segmento.
    if (marcador === 0xff) {
      i += 1
      continue
    }
    // SOS: daqui em diante é dado comprimido, e a dimensão já teria aparecido antes.
    if (marcador === 0xda) return null

    const tamanho = (bytes[i + 2]! << 8) | bytes[i + 3]!
    if (tamanho < 2) return null

    // SOF0 a SOF15, exceto os quatro que não carregam quadro (C4, C8, CC e o próprio D8).
    const ehSof =
      marcador >= 0xc0 &&
      marcador <= 0xcf &&
      marcador !== 0xc4 &&
      marcador !== 0xc8 &&
      marcador !== 0xcc

    if (ehSof) {
      // Layout do SOF: tamanho (2) · precisão (1) · altura (2) · largura (2).
      const altura = (bytes[i + 5]! << 8) | bytes[i + 6]!
      const largura = (bytes[i + 7]! << 8) | bytes[i + 8]!
      return { largura, altura }
    }

    i += 2 + tamanho
  }
  return null
}
