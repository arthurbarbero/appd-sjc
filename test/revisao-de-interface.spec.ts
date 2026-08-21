/**
 * Cenários de aceite da change `revisao-de-interface` que dá para checar sem navegador.
 *
 * **Por que ler o código-fonte das telas, e não o HTML renderizado**: cada item aqui é
 * uma frase que eu escrevi, o dono leu na tela e mandou tirar. O jeito de ela voltar não
 * é um bug de renderização — é alguém (eu) digitar de novo. Um teste que lê os arquivos
 * pega isso no `npm test`, antes de virar build.
 *
 * O histórico justifica a desconfiança: a afirmação de "fila de vagas" foi corrigida em
 * `shared/conteudo.ts` e nas specs, e **sobreviveu nos templates** — que é onde o
 * visitante lê. Conferência visual já falhou uma vez nesta mesma frase.
 *
 * O que exige navegador (foco, contraste, rolagem em 360px, o ciclo de conta) está em
 * `npm run aceite`, que sobe o workerd de verdade.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ATENDIMENTOS } from '../shared/inscricao'

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

/** Só o que sai para a tela: comentário de código explica a remoção e não deve acusar. */
function textoVisivel(caminho: string): string {
  return readFileSync(caminho, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

const TELAS = arquivosDe(join(RAIZ, 'app'), '.vue')
const CONTEUDO = textoVisivel(join(RAIZ, 'shared', 'conteudo.ts'))

describe('Nenhuma tela afirma que existe fila de vagas (REQ-8)', () => {
  /*
    A APPD não opera fila nem matrícula (ADR-014): marcar um serviço registra interesse.
    "Fila do SUS" continua permitido e é outra coisa — é a fila do sistema público, que
    existe e é justamente o motivo de o empréstimo de equipamento existir.
  */
  const PROIBIDAS = [
    /vagas são chamadas/i,
    /conforme abrem/i,
    /entra em fila/i,
    /entra na fila(?! do SUS)/i,
    /na fila de vagas/i,
  ]

  it.each(TELAS.map((t) => [t.slice(RAIZ.length), t] as const))('%s', (_rotulo, caminho) => {
    const texto = textoVisivel(caminho)
    for (const padrao of PROIBIDAS) expect(texto).not.toMatch(padrao)
  })

  it('shared/conteudo.ts', () => {
    for (const padrao of PROIBIDAS) expect(CONTEUDO).not.toMatch(padrao)
  })
})

describe('Os blocos que o dono mandou tirar não voltam (REQ-9 a REQ-13)', () => {
  const REMOVIDOS: Array<[string, RegExp]> = [
    ['bloco "Três passos"', /Três passos/i],
    ['aviso "Como funciona" do hub de atendimento', /titulo="Como funciona"/],
    ['frase "Todos os atendimentos começam pelo mesmo cadastro"', /começam pelo mesmo cadastro/i],
    ['frase "Um cadastro só"', /Um cadastro só/i],
    ['título "O que já é público"', /O que já é público/i],
    ['confissão de tela não construída', /ainda não foi construída/i],
  ]

  it.each(REMOVIDOS)('%s', (_rotulo, padrao) => {
    const onde = TELAS.filter((t) => padrao.test(textoVisivel(t))).map((t) => t.slice(RAIZ.length))
    expect(onde).toEqual([])
  })
})

describe('Cartão clicável tem um link só (REQ-6)', () => {
  /*
    Cartão inteiro clicável não pode virar dois links para o mesmo lugar: o leitor de tela
    anunciaria o destino duas vezes e o Tab pararia duas vezes no mesmo cartão. O padrão é
    um `NuxtLink.gatilho` envolvendo o título, e o rodapé do cartão vira texto decorativo.
  */
  const COM_CARTAO = TELAS.filter((t) => textoVisivel(t).includes('cartao-clicavel'))

  it('há telas usando o padrão', () => {
    expect(COM_CARTAO.length).toBeGreaterThan(0)
  })

  it.each(COM_CARTAO.map((t) => [t.slice(RAIZ.length), t] as const))('%s', (_rotulo, caminho) => {
    const texto = textoVisivel(caminho)
    // Um `gatilho` por cartão clicável.
    const cartoes = texto.match(/cartao-clicavel/g)?.length ?? 0
    const gatilhos = texto.match(/class="gatilho"/g)?.length ?? 0
    expect(gatilhos).toBe(cartoes)
    // O rodapé do cartão deixou de ser link: repetiria o destino do título.
    expect(texto).not.toMatch(/rodape-cartao">\s*<NuxtLink/)
  })
})

describe('Os projetos são opções do formulário, não texto livre (REQ-19)', () => {
  const PROJETOS = [
    'Bocha Paralímpica',
    'Oficina Mão na Roda',
    'Artesão da Inclusão',
    'Informática Nota 10',
  ]

  it.each(PROJETOS)('%s é opção de atendimento', (projeto) => {
    expect(ATENDIMENTOS).toContain(projeto)
  })

  it('"Outro" continua existindo, para o que é realmente outro', () => {
    expect(ATENDIMENTOS).toContain('Outro')
  })

  it('nenhuma tela manda marcar "Outro" e digitar o nome do projeto', () => {
    const onde = TELAS.filter((t) =>
      /marque <strong>Outro<\/strong> e escreva/i.test(textoVisivel(t)),
    )
    expect(onde).toEqual([])
  })

  it('o formulário não redeclara as listas — importa do módulo de validação', () => {
    const formulario = readFileSync(join(RAIZ, 'app/pages/atendimento/inscricao.vue'), 'utf8')
    expect(formulario).toMatch(/import \{[^}]*ATENDIMENTOS[^}]*\} from '~~\/shared\/inscricao'/)
    expect(formulario).not.toMatch(/const ATENDIMENTOS = \[/)
    expect(formulario).not.toMatch(/const DEFICIENCIAS = \[/)
  })
})

describe('A tela de contato (REQ-18)', () => {
  const contato = textoVisivel(join(RAIZ, 'app/pages/contato.vue'))

  /*
    Os dois testes que estavam aqui foram **revogados** em 2026-08-21, e não corrigidos.

    Eles guardavam o REQ-18 de `site-institucional`: a tela avisava, antes de a pessoa
    escrever, que o formulário não envia, e o botão dizia "Conferir o que escrevi (ainda
    não envia)". O dono mandou tirar as duas coisas — "era uma coisa que eu falei pra você,
    não era pra escrever".

    Registrado aqui, e não apagado em silêncio, porque o requisito não deixou de fazer
    sentido: o formulário continua sem destinatário. O que mudou foi a decisão de quem
    manda, e o dia em que a APPD informar o e-mail o assunto se encerra sozinho.

    O que **continua** testado é a confirmação depois do clique, que é o que sobrou de
    verdadeiro na tela.
  */
  it('a confirmação depois do envio continua dizendo que não foi enviada', () => {
    expect(contato).toMatch(/não foi enviado/)
  })

  it('telefone é texto com botão de copiar, não botão de bloco (REQ-16)', () => {
    expect(contato).toMatch(/<AppdCopiar/)
    // O `tel:` sobrevive só como link de texto para celular, nunca com classe de botão.
    expect(contato).not.toMatch(/:href="`tel:[^"]*"\s+class="botao/)
  })
})

describe('O rodapé traz a logo da APPD (REQ-21)', () => {
  it('a imagem está no layout, com dimensão declarada', () => {
    const layout = readFileSync(join(RAIZ, 'app/layouts/default.vue'), 'utf8')
    expect(layout).toMatch(/class="logo-rodape"/)
    expect(layout).toMatch(/logo-rodape[\s\S]{0,200}height:/)
  })
})

describe('Quem já entrou não abre login nem cadastro (correção de 2026-08-07)', () => {
  /*
    Duas guardas, porque protegem coisas diferentes: a do servidor vale para link direto,
    recarregamento e navegador sem JavaScript; a do cliente vale para a navegação interna
    do Vue Router, que não passa pelo servidor. Um teste para cada, senão remover uma
    passa despercebido.
  */
  it('a guarda do servidor cobre /entrar e /atendimento/inscricao', () => {
    const guarda = readFileSync(join(RAIZ, 'server/middleware/area.ts'), 'utf8')
    expect(guarda).toMatch(/'\/entrar'/)
    expect(guarda).toMatch(/'\/atendimento\/inscricao'/)
    expect(guarda).toMatch(/sendRedirect\(event, '\/area', 302\)/)
  })

  it('a guarda do cliente cobre as mesmas rotas', () => {
    const guarda = readFileSync(join(RAIZ, 'app/middleware/so-deslogado.global.ts'), 'utf8')
    expect(guarda).toMatch(/'\/entrar'/)
    expect(guarda).toMatch(/'\/atendimento\/inscricao'/)
    expect(guarda).toMatch(/navigateTo\('\/area'\)/)
  })

  it('entrar e cadastrar releem a sessão antes de navegar', () => {
    for (const tela of ['app/pages/entrar.vue', 'app/pages/atendimento/inscricao.vue']) {
      const texto = readFileSync(join(RAIZ, tela), 'utf8')
      expect(texto, tela).toMatch(/await sessao\.fetch\(\)/)
    }
  })
})
