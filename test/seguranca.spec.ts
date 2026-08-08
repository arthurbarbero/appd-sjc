/**
 * Varredura de segurança item a item — T-13 de `cadastro-e-login`.
 *
 * É a lista que se percorre uma vez antes de considerar a conta pronta, e que passa a
 * rodar sempre. Cada checagem responde a uma pergunta que, se ficar sem resposta, vira
 * incidente: onde a senha aparece, quem escreve o número de registro, o que vai para log.
 *
 * Lê o código-fonte, como `vazamento.spec.ts` — o que se prova aqui é que **não existe
 * caminho** que produza o defeito, e não que uma execução específica passou.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const RAIZ = join(import.meta.dirname, '..')

function arquivos(dir: string, ext = /\.(ts|vue|mjs)$/): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? arquivos(join(dir, e.name), ext)
      : ext.test(e.name)
        ? [join(dir, e.name)]
        : [],
  )
}

const ler = (c: string) => readFileSync(c, 'utf8')
const DO_SERVIDOR = arquivos(join(RAIZ, 'server'))
const DO_CLIENTE = arquivos(join(RAIZ, 'app'))

describe('senha, hash e sal não vazam (REQ-10)', () => {
  it('nada no servidor imprime em log', () => {
    /*
      Não é só sobre senha: `console.log` num Worker vai para o painel da Cloudflare, e o
      que estiver por perto vai junto. A regra é não ter nenhum — quando precisar, o
      caminho é log estruturado com campo escolhido a dedo, não despejo de objeto.
    */
    const comLog = DO_SERVIDOR.filter((c) => /console\.(log|debug|info|warn|error)\(/.test(ler(c)))
    expect(comLog.map((c) => c.slice(RAIZ.length + 1))).toEqual([])
  })

  it('nenhuma rota devolve hash de senha na resposta', () => {
    for (const caminho of DO_SERVIDOR) {
      const texto = ler(caminho)
      // `senhaHash` pode ser lido para comparar; o que não pode é sair no `return`.
      const retornos = [...texto.matchAll(/return\s*\{[\s\S]{0,600}?\n\s*\}/g)].map((m) => m[0])
      for (const retorno of retornos) {
        expect(retorno, `${caminho} devolve hash`).not.toMatch(/senhaHash|senhaSal|chaveDerivada/)
      }
    }
  })

  it('a senha em claro nunca chega ao servidor', () => {
    // ADR-005: o navegador deriva e envia a chave. Se alguma rota lesse `corpo.senha`,
    // a decisão teria sido desfeita sem ninguém notar.
    const cadastro = ler(join(RAIZ, 'server', 'api', 'conta', 'cadastro.post.ts'))
    const entrar = ler(join(RAIZ, 'server', 'api', 'conta', 'entrar.post.ts'))
    for (const rota of [cadastro, entrar]) {
      expect(rota).not.toMatch(/corpo\??\.senha\b|body\.senha\b/)
    }
  })
})

describe('segredos não moram no repositório (REQ-15)', () => {
  it('nenhum valor de segredo aparece no código', () => {
    const suspeitos = [...DO_SERVIDOR, ...DO_CLIENTE].filter((c) =>
      /(NUXT_SESSION_PASSWORD|LIMITE_SEGREDO)\s*[=:]\s*['"][^'"]+['"]/.test(ler(c)),
    )
    expect(suspeitos).toEqual([])
  })

  it('o modelo de variáveis existe e vem sem valor', () => {
    const exemplo = ler(join(RAIZ, '.dev.vars.example'))
    for (const chave of ['NUXT_SESSION_PASSWORD', 'LIMITE_SEGREDO']) {
      expect(exemplo, `${chave} ausente do modelo`).toMatch(new RegExp(`^${chave}=\\s*$`, 'm'))
    }
  })

  it('o arquivo real de variáveis não está versionado', () => {
    const ignore = ler(join(RAIZ, '.gitignore'))
    expect(ignore).toMatch(/^\.dev\.vars$/m)
  })
})

describe('o número de registro é imutável (REQ-3)', () => {
  it('só a criação da conta escreve o número', () => {
    /*
      O número é a chave pública do associado e vai impresso no crachá. Se qualquer rota
      pudesse reescrevê-lo, um crachá em circulação passaria a apontar para outra pessoa —
      e é exatamente por isso que a exclusão preserva o número em vez de liberá-lo.
    */
    const escrevem = DO_SERVIDOR.filter((caminho) => {
      const t = ler(caminho)
      return /\.set\(\{[\s\S]{0,400}?numeroRegistro/.test(t)
    })
    expect(escrevem.map((c) => c.slice(RAIZ.length + 1))).toEqual([])
  })
})

describe('o limite de tentativas está ligado onde precisa (REQ-26)', () => {
  it.each([
    ['conta/cadastro.post.ts', 'inscricao'],
    ['verificar/[numero].get.ts', 'verificacao'],
  ])('%s conta tentativas no escopo %s', (rota, escopo) => {
    const texto = ler(join(RAIZ, 'server', 'api', ...rota.split('/')))
    expect(texto).toMatch(/registrarTentativa\(/)
    expect(texto).toMatch(new RegExp(`escopo: '${escopo}'`))
  })

  it('o cadastro declara os números do próprio limite', () => {
    /*
      O corte em si é medido em execução, no gate, pela rota de verificação — cuja janela é
      de 60 segundos e expira antes de alguém rodar o gate de novo. A do cadastro é de
      quinze minutos: esgotá-la no teste bloquearia a execução seguinte, e gate que só
      funciona a cada quinze minutos é gate pela metade.

      Então o que se prova aqui é a **configuração**: que a rota tem contador próprio, com
      escopo, teto e janela declarados. Trocar qualquer um sem querer reprova.
    */
    const rota = ler(join(RAIZ, 'server', 'api', 'conta', 'cadastro.post.ts'))
    expect(rota).toMatch(/escopo:\s*'inscricao'/)
    expect(rota).toMatch(/maximo:\s*\d+/)
    expect(rota).toMatch(/janelaSegundos:\s*\d+/)
    // E o teto de corpo, que é a outra metade da guarda.
    expect(rota).toMatch(/MAXIMO_CORPO/)
    expect(rota).toMatch(/statusCode:\s*413/)
  })

  it('o contador nunca guarda o identificador em claro', () => {
    const limite = ler(join(RAIZ, 'server', 'utils', 'limite.ts'))
    // A chave gravada tem de ser o resultado do HMAC, e não o valor recebido.
    expect(limite).toMatch(/chaveHash:\s*chave/)
    expect(limite).not.toMatch(/chaveHash:\s*identificador/)
  })
})
