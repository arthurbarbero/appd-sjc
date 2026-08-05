/*
  Gera o QR Code do PIX da APPD-SJC a partir da chave, em SVG.

  Por que gerar em vez de guardar a imagem pronta: o SVG fica nítido em qualquer
  tamanho e na impressão, e o payload fica versionado — dá para conferir no diff se
  alguém mudar a chave.

  A chave é o CNPJ da associação, que é público e confere com o CNPJ do rodapé. Isso
  importa: chave de PIX que não dá para verificar é vetor de golpe.

  Uso: node scripts/gerar-pix-qr.mjs
  Depois de rodar, CONFIRA escaneando com o aplicativo do banco antes de publicar.
*/

import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Campo do BR Code: identificador + tamanho com dois dígitos + valor. */
function campo(id, valor) {
  return id + String(valor.length).padStart(2, '0') + valor
}

/** CRC16/CCITT-FALSE, exigido pelo padrão do Banco Central. */
function crc16(texto) {
  let crc = 0xffff
  for (const byte of Buffer.from(texto, 'utf8')) {
    crc ^= byte << 8
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * Monta o payload estático do PIX (BR Code, EMV®QRCPS).
 * Nome e cidade têm limite do padrão: 25 e 15 caracteres, sem acento.
 */
export function montarPayloadPix({ chave, nome, cidade }) {
  const contaMerchant = campo('00', 'br.gov.bcb.pix') + campo('01', chave)

  const semCrc =
    campo('00', '01') + // formato do payload
    campo('01', '11') + // estático, pode ser usado mais de uma vez
    campo('26', contaMerchant) +
    campo('52', '0000') + // categoria do estabelecimento: não informada
    campo('53', '986') + // moeda: real
    campo('58', 'BR') +
    campo('59', nome.slice(0, 25)) +
    campo('60', cidade.slice(0, 15)) +
    campo('62', campo('05', '***')) + // sem identificador de transação
    '6304'

  return semCrc + crc16(semCrc)
}

const CHAVE = '08074883000196' // CNPJ 08.074.883/0001-96, o mesmo do rodapé
const payload = montarPayloadPix({
  chave: CHAVE,
  nome: 'APPD SJC',
  cidade: 'SAO JOSE CAMPOS',
})

const svg = await QRCode.toString(payload, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 1,
  color: { dark: '#14161a', light: '#ffffff' },
})

await writeFile(join(RAIZ, 'public/marca/pix-appd.svg'), svg, 'utf8')

console.log('payload:', payload)
console.log('\nSVG escrito em public/marca/pix-appd.svg')
console.log('CONFIRA escaneando com o app do banco antes de publicar.')
