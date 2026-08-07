/*
  Monta os previews do design system para o Claude Design.

  Cada arquivo em componentes/ é um fragmento com o marcador `<!-- ESTILOS -->`.
  Este script troca o marcador pelos CSS de tokens e base embutidos, e envolve tudo num
  documento HTML completo. O resultado vai para build/ — autossuficiente, sem link
  externo, porque o painel do Claude Design não resolve caminho relativo do repositório.

  Uso: node docs/design-system/montar.mjs
*/

import { readFile, readdir, writeFile, mkdir, rm } from 'node:fs/promises'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = dirname(fileURLToPath(import.meta.url))
const origem = join(raiz, 'componentes')
const destino = join(raiz, 'build')

// O CSS mora em app/assets/css/ desde a limpeza de 2026-08-07 — é lá que o Nuxt espera
// folha global. Os previews leem de lá para nunca divergirem do que o site usa.
const css = join(raiz, '..', '..', 'app', 'assets', 'css')
const tokens = await readFile(join(css, 'tokens.css'), 'utf8')
const base = await readFile(join(css, 'base.css'), 'utf8')
const estilos = `<style>\n${tokens}\n${base}\n</style>`

const titulos = {
  cores: 'Cores',
  tipografia: 'Tipografia',
  acoes: 'Ações',
  campos: 'Campos',
  data: 'Data de nascimento',
  escolhas: 'Escolhas',
  estrutura: 'Estrutura',
  avisos: 'Avisos',
}

await rm(destino, { recursive: true, force: true })
await mkdir(destino, { recursive: true })

const arquivos = (await readdir(origem)).filter((f) => f.endsWith('.html'))

for (const arquivo of arquivos) {
  const nome = basename(arquivo, '.html')
  const fragmento = await readFile(join(origem, arquivo), 'utf8')

  if (!fragmento.includes('<!-- ESTILOS -->')) {
    throw new Error(`${arquivo} não tem o marcador <!-- ESTILOS -->`)
  }
  if (!fragmento.startsWith('<!-- @dsCard')) {
    throw new Error(`${arquivo} precisa começar com o marcador @dsCard`)
  }

  const [cartao, ...resto] = fragmento.split('\n')
  const corpo = resto.join('\n').replace('<!-- ESTILOS -->', estilos)
  const titulo = titulos[nome] ?? nome

  const documento = `${cartao}
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${titulo} — Design System APPD-SJC</title>
  </head>
  <body>
${corpo}
  </body>
</html>
`

  await writeFile(join(destino, arquivo), documento, 'utf8')
  console.log(`montado: build/${arquivo}`)
}

console.log(`\n${arquivos.length} previews em ${destino}`)
