/*
  Comprime as imagens de public/imagens para WebP.

  Por que isso importa aqui mais que na média: o público do site acessa muito pelo
  celular, com plano de dados limitado. Servir 8 MB de foto no tamanho original do Wix
  é cobrar da pessoa o preço da nossa preguiça.

  O que o script faz: reduz para no máximo 1400px de largura, converte para WebP com
  qualidade 78 e apaga o arquivo original. A logo fica de fora — segue em PNG, porque
  serve de favicon e precisa da compatibilidade.

  Uso: node scripts/comprimir-imagens.mjs
  É idempotente: rodar de novo não degrada o que já está convertido.
*/

import { readdir, stat, unlink } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const PASTA = join(RAIZ, 'public/imagens')

const LARGURA_MAXIMA = 1400
const QUALIDADE = 78

const arquivos = (await readdir(PASTA)).filter((f) =>
  ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase()),
)

if (arquivos.length === 0) {
  console.log('Nada a converter: todas as imagens já estão em WebP.')
  process.exit(0)
}

let antes = 0
let depois = 0

for (const arquivo of arquivos) {
  const origem = join(PASTA, arquivo)
  const destino = join(PASTA, arquivo.replace(/\.(jpe?g|png)$/i, '.webp'))

  const tamanhoOriginal = (await stat(origem)).size
  antes += tamanhoOriginal

  await sharp(origem)
    .rotate() // respeita a orientação gravada pela câmera
    .resize({ width: LARGURA_MAXIMA, withoutEnlargement: true })
    .webp({ quality: QUALIDADE })
    .toFile(destino)

  const tamanhoNovo = (await stat(destino)).size
  depois += tamanhoNovo

  await unlink(origem)

  const reducao = Math.round((1 - tamanhoNovo / tamanhoOriginal) * 100)
  console.log(
    `${arquivo.padEnd(40)} ${(tamanhoOriginal / 1024).toFixed(0).padStart(5)} KB → ${(tamanhoNovo / 1024).toFixed(0).padStart(5)} KB  (-${reducao}%)`,
  )
}

console.log(
  `\nTotal: ${(antes / 1024 / 1024).toFixed(1)} MB → ${(depois / 1024 / 1024).toFixed(1)} MB ` +
    `(-${Math.round((1 - depois / antes) * 100)}%)`,
)
console.log('Lembre de atualizar as referências em shared/conteudo.ts para .webp.')
