/**
 * Cenários da change `acabamento-de-interface` que dá para checar sem navegador.
 *
 * Segue o argumento de `revisao-de-interface.spec.ts`: o que o dono mandou tirar volta
 * porque alguém digita de novo, não porque o navegador renderiza errado. Ler o
 * código-fonte pega isso no `npm test`.
 *
 * O que exige navegador — largura renderizada, foco, rolagem — fica no `npm run aceite`.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

function arquivosDe(pasta: string, extensao: string): string[] {
  const achados: string[] = []
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) achados.push(...arquivosDe(caminho, extensao))
    else if (nome.endsWith(extensao)) achados.push(caminho)
  }
  return achados
}

function semComentario(caminho: string): string {
  return readFileSync(caminho, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

/*
  Só o bloco de estilo interessa, e dentro dele só as declarações.

  Duas coisas casam com `max-width:` sem serem largura de conteúdo: a condição de uma
  media query (`@media (max-width: 860px)`) e uma string no script — o layout guarda o
  ponto de quebra em `const PONTO_DE_QUEBRA = '(max-width: 860px)'` para saber, no
  JavaScript, quando o menu é painel. Ambas são podadas aqui.
*/
function apenasEstilo(fonte: string): string {
  const blocos = [...fonte.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? '')
  const css = blocos.length > 0 ? blocos.join('\n') : fonte
  return css.replace(/@media[^{]*\{/g, '{')
}

const TELAS = arquivosDe(join(RAIZ, 'app'), '.vue')
const BASE_CSS = readFileSync(join(RAIZ, 'app', 'assets', 'css', 'base.css'), 'utf8')
const TOKENS_CSS = readFileSync(join(RAIZ, 'app', 'assets', 'css', 'tokens.css'), 'utf8')

describe('A medida de leitura não volta ao seletor de elemento (REQ-1)', () => {
  it('nenhuma regra limita a largura de p por ser p', () => {
    // Pega `p {` como seletor de elemento — `.campo p`, `.prosa > p` e afins continuam livres.
    const blocos = BASE_CSS.split('}')
    const culpados = blocos.filter((bloco) => {
      const seletor = bloco.split('{')[0]?.trim() ?? ''
      if (!/^p$/m.test(seletor)) return false
      return /max-width/.test(bloco)
    })
    expect(culpados).toEqual([])
  })

  it('a medida existe como token e é usada pela classe de prosa', () => {
    expect(TOKENS_CSS).toMatch(/--medida:/)
    expect(BASE_CSS).toMatch(/\.prosa\s*\{[^}]*max-width:\s*var\(--medida\)/)
  })
})

describe('As larguras de conteúdo saem de token (REQ-3)', () => {
  const TOKENS_DE_BLOCO = ['--bloco', '--bloco-medio', '--bloco-estreito', '--medida']

  /*
    As três exceções são dimensão de mídia, não largura de conteúdo: o retrato em /sobre,
    a folha da impressão do crachá e a moldura do recorte da foto. Ficam nomeadas para
    que uma quarta não entre sem discussão.
  */
  const EXCECOES = new Map([
    ['sobre.vue', ['220px']],
    ['cracha-impressao.vue', ['1080px']],
    ['AppdFoto.vue', ['360px']],
  ])

  it.each(TELAS)('%s não inventa largura própria', (caminho) => {
    const nome = caminho.split(/[\\/]/).pop() ?? ''
    const permitidos = EXCECOES.get(nome) ?? []
    const crus = [...apenasEstilo(semComentario(caminho)).matchAll(/max-width:\s*([^;]+);/g)]
      .map((m) => m[1]!.trim())
      .filter((valor) => valor !== '100%' && valor !== 'none' && valor !== 'fit-content')
      .filter((valor) => !TOKENS_DE_BLOCO.some((token) => valor.includes(token)))
      .filter((valor) => !permitidos.includes(valor))
    expect(crus).toEqual([])
  })
})

describe('A foto do crachá aparece na área, e não a palavra "Foto" (REQ-7)', () => {
  const AREA = semComentario(join(RAIZ, 'app', 'pages', 'area', 'index.vue'))

  it('o cartão serve a imagem da rota autenticada', () => {
    // `:src` com constante, e não `src` literal: com o caminho cru o Vite tenta resolver
    // a rota como asset e o build de produção falha, enquanto o dev passa.
    expect(AREA).toMatch(/<img[^>]*:src="ROTA_FOTO"/)
    expect(AREA).toMatch(/ROTA_FOTO = '\/api\/area\/foto'/)
  })

  it('nenhum bloco desenha a palavra "Foto" no lugar da imagem', () => {
    expect(AREA).not.toMatch(/class="foto"[^>]*>\s*Foto\s*</)
  })
})

describe('Erro de campo não traz ícone decorativo (REQ-11)', () => {
  it.each(TELAS)('%s não cola o ✕ na mensagem do campo', (caminho) => {
    const fonte = semComentario(caminho)
    // o ✕ colado na interpolação do erro é o padrão que saiu; o do bloco de aviso fica
    expect(fonte).not.toMatch(/<span class="icone" aria-hidden="true">✕<\/span>\{\{/)
  })

  it('a mensagem do campo continua no piso de 15px, não abaixo', () => {
    const regra = BASE_CSS.match(/\.campo \.erro \{[^}]*\}/)?.[0] ?? ''
    expect(regra).toMatch(/font-size:\s*var\(--texto-rotulo\)/)
    expect(TOKENS_CSS).toMatch(/--texto-rotulo:\s*0\.9375rem/)
  })
})

describe('Desistir do recorte devolve a foto que havia (REQ-10)', () => {
  const FOTO = readFileSync(join(RAIZ, 'app', 'components', 'AppdFoto.vue'), 'utf8')

  it('o componente guarda a foto pronta antes de abrir outro recorte', () => {
    expect(FOTO).toMatch(/fotoGuardada/)
    expect(FOTO).toMatch(/function guardarAtual/)
  })

  it('cancelar restaura em vez de esvaziar quando havia foto', () => {
    const cancelar = FOTO.match(/function cancelar\(\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(cancelar).toMatch(/fotoGuardada\.value/)
    expect(cancelar).toMatch(/etapa\.value = 'pronto'/)
  })

  it('a prévia guardada é revogada quando deixa de ser alcançável', () => {
    expect(FOTO).toMatch(/function descartarGuardada\(\)[\s\S]*?revokeObjectURL\(previaGuardada/)
  })
})
