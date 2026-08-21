/**
 * O arquivo baixado desenha o mesmo cartão que a tela mostra.
 *
 * ## Por que este arquivo existe
 *
 * O crachá é implementado **duas vezes**: em HTML/CSS no `AppdCracha.vue`, para a tela e
 * para a folha de impressão, e à mão em `canvas` no `cracha-arquivo.ts`, para o PNG e o
 * PDF. A duplicação não é descuido — a exportação precisa acontecer sem requisição de
 * rede, e converter HTML em imagem custaria buscar fonte e folha de estilo em tempo de
 * execução, quebrando o requisito de forma invisível.
 *
 * O preço da duplicação apareceu em 2026-08-21. O cartão da tela virou paisagem, ganhou
 * CRAS, credencial, emissão e CID; o `cracha-arquivo.ts` não mudou. Por dois dias quem
 * clicava em "Imagem" ou "PDF" recebeu o cartão em pé da versão anterior, sem nenhum dos
 * campos novos — e ninguém percebeu, porque **o arquivo abre sem erro**. Ele estava certo;
 * só era de outro cartão.
 *
 * Um teste que abrisse o PNG e olhasse não pegaria isso: o PNG estava perfeito. O que pega
 * é comparar as **duas implementações entre si**, que é o que está aqui.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const ler = (...partes: string[]) => readFileSync(join(RAIZ, ...partes), 'utf8')

const COMPONENTE = ler('app', 'components', 'AppdCracha.vue')
const ARQUIVO = ler('app', 'utils', 'cracha-arquivo.ts')
const TELA = ler('app', 'pages', 'area', 'cracha.vue')

/** Os rótulos que o componente desenha, na ordem em que aparecem. */
function rotulosDoComponente(): string[] {
  /*
    `lastIndexOf`, e não `indexOf`: a frente e o verso são dois `<template v-if>` dentro do
    template raiz, então o primeiro `</template>` fecha a frente. Com `indexOf`, este teste
    lia meio componente e dava por bom um verso que podia estar vazio.
  */
  const template = COMPONENTE.slice(
    COMPONENTE.indexOf('<template>'),
    COMPONENTE.lastIndexOf('</template>'),
  ).replace(/<!--[\s\S]*?-->/g, '')
  return [...template.matchAll(/<span class="rotulo[^"]*">([^<{]+)<\/span>/g)].map((m) =>
    m[1]!.trim(),
  )
}

/** Os rótulos que o canvas desenha, lidos das chamadas de `campo(...)`. */
function rotulosDoArquivo(): string[] {
  const codigo = ARQUIVO.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  // O rótulo é o primeiro literal de string de cada chamada de `campo(`.
  return [...codigo.matchAll(/\n\s*campo\(\s*[\s\S]*?'([^']+)'/g)].map((m) => m[1]!)
}

describe('Tela e arquivo desenham o mesmo cartão', () => {
  it('os dois medem 85,6 × 54 mm', () => {
    expect(COMPONENTE).toMatch(/width:\s*85\.6mm/)
    expect(COMPONENTE).toMatch(/height:\s*54mm/)
    expect(ARQUIVO).toMatch(/LARGURA_MM = 85\.6/)
    expect(ARQUIVO).toMatch(/ALTURA_MM = 54/)
  })

  it('os rótulos impressos são exatamente os mesmos, sem sobra de um lado', () => {
    /*
      A comparação é de **conjuntos**, e não de ordem: as duas implementações podem
      distribuir as caixas de forma diferente sem que nada esteja errado. O que não pode é
      um rótulo existir num lado e faltar no outro — foi assim que CID, CRAS, credencial e
      emissão sumiram do arquivo baixado.
    */
    const naTela = new Set(rotulosDoComponente())
    const noArquivo = new Set(rotulosDoArquivo())
    expect(naTela.size).toBeGreaterThan(5)
    expect([...naTela].filter((r) => !noArquivo.has(r))).toEqual([])
    expect([...noArquivo].filter((r) => !naTela.has(r))).toEqual([])
  })

  it('todo campo que a tela recebe chega ao arquivo', () => {
    // As props do componente, menos as que só existem na tela.
    const props = COMPONENTE.slice(COMPONENTE.indexOf('defineProps<{'), COMPONENTE.indexOf('}>()'))
    const nomes = [...props.matchAll(/^\s{2}(\w+)\??:/gm)]
      .map((m) => m[1]!)
      .filter((n) => n !== 'lado')

    const contrato = ARQUIVO.slice(
      ARQUIVO.indexOf('export interface DadosCracha'),
      ARQUIVO.indexOf('export type Lado'),
    )
    const faltando = nomes.filter((n) => !new RegExp(`^\\s{2}${n}\\??:`, 'm').test(contrato))
    expect(faltando).toEqual([])
  })

  it('a tela monta os dados do arquivo a partir da mesma resposta que passa ao componente', () => {
    // `dadosCracha` e as props de `<AppdCracha>` saem os dois de `data`. Se um deles
    // passar a sair de outro lugar, é aqui que a divergência volta.
    const inicio = TELA.indexOf('const dadosCracha')
    const monta = TELA.slice(inicio, TELA.indexOf('}))', inicio))
    for (const campo of ['cid', 'cras', 'credencialTransporte', 'emissao', 'nascimento', 'cpf']) {
      expect(monta, `dadosCracha não leva ${campo}`).toMatch(
        new RegExp(`${campo}: data\\.value\\?\\.${campo}`),
      )
    }
  })
})

describe('A exportação continua sem rede', () => {
  it('o grafismo vem embutido, não buscado', () => {
    /*
      Um `new Image()` apontando para `/marca/logo-appd.png` é uma requisição — de mesma
      origem, cacheada, invisível na tela, e ainda assim uma requisição. O REQ-4 de
      `cracha-impresso` quebraria sem nada parecer errado.
    */
    expect(ler('app', 'utils', 'cracha-marca.ts')).toMatch(/\?inline'/)
    expect(ARQUIVO).not.toMatch(/src\s*=\s*['"]\/marca/)
    expect(ARQUIVO).not.toMatch(/fetch\(/)
  })

  it('nada no desenho aponta para host externo', () => {
    expect(ARQUIVO).not.toMatch(/https?:\/\/(?!localhost)/)
  })
})

describe('A tira sai colada, nos dois lugares', () => {
  it('o PNG junta os dois lados sem vão', () => {
    // O dono: "a pessoa vai imprimir e ela vai dobrar aqui, então não pode ter esse
    // espaço". Havia 40px entre os dois canvas.
    expect(ARQUIVO).toMatch(/junto\.width = frente\.width \* 2\b/)
    expect(ARQUIVO).toMatch(/drawImage\(verso, frente\.width, 0\)/)
  })

  it('a folha A4 não tem vão entre frente e verso', () => {
    const folha = ler('app', 'pages', 'area', 'cracha-impressao.vue')
    const regra = folha.match(/\.tira \{[^}]*\}/)?.[0] ?? ''
    expect(regra).toMatch(/gap:\s*0/)
  })

  it('a tira cabe na folha: dois cartões de 85,6 mm mais a margem dentro de 210 mm', () => {
    const folha = ler('app', 'pages', 'area', 'cracha-impressao.vue')
    const margem = Number(folha.match(/padding:\s*(\d+(?:\.\d+)?)mm/)?.[1] ?? '0')
    expect(85.6 * 2 + margem * 2).toBeLessThanOrEqual(210)
  })
})
