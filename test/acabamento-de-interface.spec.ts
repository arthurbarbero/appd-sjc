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

describe('Toda rota começa no topo (REQ-8)', () => {
  const ROTAS = readFileSync(join(RAIZ, 'app', 'router.options.ts'), 'utf8')

  it('existe scrollBehavior levando ao topo', () => {
    expect(ROTAS).toMatch(/scrollBehavior/)
    expect(ROTAS).toMatch(/top:\s*0/)
  })

  it('âncora e histórico continuam mandando', () => {
    expect(ROTAS).toMatch(/posicaoSalva/)
    expect(ROTAS).toMatch(/para\.hash/)
  })

  it('movimento reduzido desliga a animação da rolagem', () => {
    expect(ROTAS).toMatch(/prefers-reduced-motion/)
  })
})

describe('O menu estreito é painel, não sanfona (REQ-15 a REQ-17)', () => {
  const LAYOUT = readFileSync(join(RAIZ, 'app', 'layouts', 'default.vue'), 'utf8')

  it('o botão é ícone, e mantém nome acessível', () => {
    expect(semComentario(join(RAIZ, 'app', 'layouts', 'default.vue'))).not.toMatch(
      /class="[^"]*alternar[^"]*"[^>]*>\s*Menu\s*</,
    )
    expect(LAYOUT).toMatch(/:aria-label="menuAberto \? 'Fechar menu' : 'Abrir menu'"/)
    expect(LAYOUT).toMatch(/:aria-expanded="menuAberto"/)
  })

  it('o painel desliza da direita e se sobrepõe', () => {
    const estilo = apenasEstilo(LAYOUT)
    expect(estilo).toMatch(/position:\s*fixed/)
    expect(estilo).toMatch(/translateX\(100%\)/)
  })

  it('a página de trás não é empurrada nem rola', () => {
    expect(LAYOUT).toMatch(/document\.body\.style\.overflow/)
  })

  it('Esc fecha e devolve o foco ao botão', () => {
    expect(LAYOUT).toMatch(/evento\.key === 'Escape'/)
    expect(LAYOUT).toMatch(/botaoMenu\.value\?\.focus\(\)/)
  })

  it('o que está atrás fica inerte, e o painel fechado também', () => {
    expect(LAYOUT).toMatch(/:inert="estreito && menuAberto"/)
    expect(LAYOUT).toMatch(/:inert="estreito && !menuAberto"/)
  })

  it('há saída visível dentro do painel', () => {
    expect(LAYOUT).toMatch(/class="fechar"[^>]*aria-label="Fechar menu"/)
  })

  it('o nome da marca sai da tela sem sair da árvore de acessibilidade', () => {
    // `display: none` aqui deixou o link da marca sem nome — o axe acusou link-name.
    const estilo = apenasEstilo(LAYOUT)
    const regra = estilo.match(/\.marca \.nome \{[^}]*\}/)?.[0] ?? ''
    expect(regra).not.toMatch(/display:\s*none/)
    expect(regra).toMatch(/clip-path/)
  })
})

describe('A área do associado tem menu à esquerda (REQ-18, REQ-19)', () => {
  const TELAS_DA_AREA = ['index.vue', 'cracha.vue', 'dados.vue', 'excluir.vue', 'inscricoes.vue']

  it('a moldura de duas colunas existe no design system', () => {
    expect(BASE_CSS).toMatch(/\.area-moldura\s*\{[^}]*grid-template-columns/)
    expect(BASE_CSS).toMatch(/\.area-moldura > nav\s*\{[^}]*grid-column:\s*1/)
  })

  it.each(TELAS_DA_AREA)('%s usa a moldura', (nome) => {
    const fonte = readFileSync(join(RAIZ, 'app', 'pages', 'area', nome), 'utf8')
    expect(fonte).toMatch(/area-moldura/)
  })

  it.each(TELAS_DA_AREA)('%s não declara a própria coluna', (nome) => {
    /*
      O escopo da página carrega depois do base e vencia a grade — o menu ficava na
      esquerda e o conteúdo embaixo, em vez de ao lado.

      A classe do container é lida do template, e não adivinhada por uma lista: em
      `index.vue` existe um bloco interno chamado `.excluir`, homônimo do container de
      outra tela, e a busca por nome pegava o bloco errado.
    */
    const fonte = readFileSync(join(RAIZ, 'app', 'pages', 'area', nome), 'utf8')
    const classes = fonte.match(/<div class="([^"]*area-moldura[^"]*)"/)?.[1] ?? ''
    const container = classes.split(/\s+/).find((c) => c && c !== 'area-moldura')
    expect(container).toBeTruthy()
    const regra = apenasEstilo(fonte).match(new RegExp('\\.' + container + '\\s*\\{[^}]*\\}'))?.[0]
    if (!regra) return
    expect(regra).not.toMatch(/display:\s*flex/)
  })

  it('a seção atual é marcada por meio não-cromático', () => {
    const NAV = readFileSync(join(RAIZ, 'app', 'components', 'AreaNavegacao.vue'), 'utf8')
    expect(NAV).toMatch(/aria-current/)
    expect(apenasEstilo(NAV)).toMatch(/a\[aria-current='page'\]::after/)
  })
})

describe('O recorte da foto aceita pinça, sem perder os outros caminhos (REQ-29)', () => {
  const FOTO = readFileSync(join(RAIZ, 'app', 'components', 'AppdFoto.vue'), 'utf8')

  it('dois ponteiros mudam a escala', () => {
    expect(FOTO).toMatch(/ponteiros\.size >= 2/)
    expect(FOTO).toMatch(/distanciaEntreDedos/)
  })

  it('o teto e o piso do zoom ficam num lugar só', () => {
    expect(FOTO).toMatch(/function definirEscala/)
    const aproximar = FOTO.match(/function aproximar\([\s\S]*?\n\}/)?.[0] ?? ''
    expect(aproximar).toMatch(/definirEscala/)
  })

  it('botões e teclado continuam existindo — o gesto é um caminho a mais', () => {
    expect(FOTO).toMatch(/@click="aproximar\(-?0\.1\)"/)
    expect(FOTO).toMatch(/function teclado/)
  })
})

describe('Dá para trocar E ajustar a foto que já existe (M5, 2026-08-21)', () => {
  const CRACHA = readFileSync(join(RAIZ, 'app', 'pages', 'area', 'cracha.vue'), 'utf8')
  const FOTO = readFileSync(join(RAIZ, 'app', 'components', 'AppdFoto.vue'), 'utf8')

  it('quem já tem foto encontra os dois caminhos', () => {
    // Antes disto o envio só era montado para quem NÃO tinha foto: errar a foto uma vez
    // condenava a pessoa àquela foto.
    expect(CRACHA).toMatch(/Ajustar o enquadramento/)
    expect(CRACHA).toMatch(/Trocar a minha foto/)
  })

  it('ajustar abre o recorte com a foto guardada, sem seletor de arquivo', () => {
    expect(FOTO).toMatch(/function editarAtual/)
    expect(FOTO).toMatch(/defineExpose/)
    expect(CRACHA).toMatch(/editarAtual/)
  })

  it('a foto guardada vira object URL, e não src direto para a rota', () => {
    // `urlOrigem` é o que o quadro desenha e o que `limpar()` revoga; apontar o src para
    // a rota deixava a imagem fora desse ciclo e o recorte abria vazio.
    const fn = FOTO.match(/async function editarAtual\(\)[\s\S]*?\n\}/)?.[0] ?? ''
    expect(fn).toMatch(/createObjectURL/)
    expect(fn).not.toMatch(/crossOrigin/)
  })

  it('a tela diz o que ajustar não faz', () => {
    expect(FOTO).toMatch(/não volta/)
  })
})

describe('Segunda revisão no computador, com áudio (2026-08-21)', () => {
  const LAYOUT = readFileSync(join(RAIZ, 'app', 'layouts', 'default.vue'), 'utf8')
  const ENTRAR = readFileSync(join(RAIZ, 'app', 'pages', 'entrar.vue'), 'utf8')
  const CRACHA = readFileSync(join(RAIZ, 'app', 'pages', 'area', 'cracha.vue'), 'utf8')
  const INSCRICOES = readFileSync(join(RAIZ, 'app', 'pages', 'area', 'inscricoes.vue'), 'utf8')

  it('J1: o campo não tem teto próprio — quem decide a largura é a coluna', () => {
    const regra = BASE_CSS.match(/\.campo \{[^}]*\}/)?.[0] ?? ''
    expect(regra).not.toMatch(/max-width:\s*\d/)
  })

  it('J2: o olho fica dentro do campo, e o campo ocupa a largura toda', () => {
    const estilo = apenasEstilo(ENTRAR)
    expect(estilo).toMatch(/\.olho \{[^}]*position:\s*absolute/)
    expect(estilo).toMatch(/\.com-olho input \{[^}]*width:\s*100%/)
    // padding reservado, senão a senha corre por baixo do ícone
    expect(estilo).toMatch(/\.com-olho input \{[^}]*padding-right/)
  })

  it('J3: salvar em /area/inscricoes volta ao topo, como em /area/dados', () => {
    const salvar = INSCRICOES.match(/salvo\.value = true[\s\S]{0,600}/)?.[0] ?? ''
    expect(salvar).toMatch(/window\.scrollTo/)
    expect(salvar).toMatch(/resumo\.value\?\.focus\(\)/)
  })

  it('J4: um botão só para mudar a foto, e não dois', () => {
    expect(CRACHA).toMatch(/Mudar a minha foto/)
    // sem comentário: a explicação da mudança cita o rótulo antigo, e não é tela
    expect(semComentario(join(RAIZ, 'app', 'pages', 'area', 'cracha.vue'))).not.toMatch(
      /Ajustar o enquadramento/,
    )
    // e trocar de arquivo passou a viver dentro do recorte
    const FOTO = readFileSync(join(RAIZ, 'app', 'components', 'AppdFoto.vue'), 'utf8')
    expect(FOTO).toMatch(/Escolher outra imagem/)
  })

  it('J4: os botões de baixar têm ícone e mantêm o rótulo', () => {
    // Ícone sozinho foi recusado: o público inclui quem não decifra pictograma.
    expect(CRACHA).toMatch(/compacto/)
    expect(CRACHA).toMatch(/<svg[\s\S]*?aria-hidden="true"/)
    expect(CRACHA).toMatch(/Imagem/)
    expect(CRACHA).toMatch(/PDF/)
    expect(CRACHA).toMatch(/Imprimir/)
  })

  it('J5: o ponto de quebra do menu está em em, não em pixel', () => {
    /*
      Em media query, `em` mede a fonte escolhida no navegador. Com o valor em pixel, quem
      aumentava a fonte via a barra quebrar em duas linhas numa faixa logo acima de 860px,
      antes de o hambúrguer entrar — reproduzido com fonte base a 150%.
    */
    expect(LAYOUT).toMatch(/PONTO_DE_QUEBRA = '\(max-width: 53\.75em\)'/)
    expect(apenasEstilo(LAYOUT)).not.toMatch(/max-width:\s*860px|width <= 860px/)
    expect(apenasEstilo(LAYOUT)).toMatch(/53\.75em/)
  })

  it('J5: a barra larga não quebra em duas linhas', () => {
    expect(apenasEstilo(LAYOUT)).toMatch(/\.cabecalho nav ul \{[^}]*flex-wrap:\s*nowrap/)
  })
})
