/**
 * As travas do modo atendimento.
 *
 * Ele existe para um pedido pequeno — "precisamos aumentar os limites de ratelimit" — e mexe
 * na única defesa que o cadastro tem contra criação em massa. Um recurso assim envelhece de
 * um jeito previsível: alguém precisa de mais uma coisa no balcão, e a coisa entra aqui
 * porque "já tem o modo ligado". Foi assim que muito painel administrativo nasceu sem
 * ninguém decidir criar um.
 *
 * Os testes abaixo são sobre **o que o modo não pode fazer**, e valem mais que os de
 * comportamento: o comportamento certo o aceite verifica; a fronteira, só isto.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const ler = (...partes: string[]) => readFileSync(join(RAIZ, ...partes), 'utf8')

const UTIL = ler('server', 'utils', 'modo-atendimento.ts')

/**
 * O código sem comentários.
 *
 * Os testes de fronteira procuram palavras que o modo **não pode tocar** — e os comentários
 * deste projeto explicam justamente o que ele não faz, com essas mesmas palavras. Ler o
 * arquivo cru reprovaria a explicação junto com o defeito.
 */
const semComentario = (fonte: string) =>
  fonte
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
const ROTA = ler('server', 'api', 'atendimento', 'modo.post.ts')
const TELA = ler('app', 'pages', 'atendimento', 'modo.vue')
const CADASTRO = ler('server', 'api', 'conta', 'cadastro.post.ts')

describe('O modo mexe num número, e em nada mais', () => {
  it('não toca em consentimento, dado pessoal nem sessão de associado', () => {
    for (const proibido of [
      /consentimento/i,
      /usuarios/,
      /abrirSessao/,
      /setUserSession/,
      /deficiencia/i,
      /\bcid\b/i,
    ]) {
      expect(semComentario(UTIL), `o utilitário menciona ${proibido}`).not.toMatch(proibido)
    }
  })

  it('a rota não devolve dado de ninguém', () => {
    // A resposta é um booleano e um prazo. Se um dia devolver lista, ficha ou contagem, o
    // painel administrativo entrou por aqui — e ele tem change própria.
    const retornos = [...ROTA.matchAll(/return \{([^}]*)\}/g)].map((m) => m[1]!)
    expect(retornos.length).toBeGreaterThan(0)
    for (const r of retornos) {
      expect(r).not.toMatch(/nome|email|cpf|numeroRegistro|inscric/i)
    }
  })

  it('a tela não vira painel: nenhum link para área nem listagem', () => {
    const tela = semComentario(TELA)
    expect(tela).not.toMatch(/\/area/)
    expect(tela).not.toMatch(/v-for/)
  })
})

describe('Falha fechada, sempre', () => {
  it('sem o segredo configurado, o modo não liga', () => {
    expect(UTIL).toMatch(/if \(!esperada[^)]*\) return false/)
  })

  it('sem o segredo, o cookie também não é aceito', () => {
    // A metade que costuma faltar: quem esquece esta linha aceita qualquer cookie no
    // ambiente em que o segredo sumiu — que é justamente o ambiente mal configurado.
    const conferencia = UTIL.slice(UTIL.indexOf('export async function emModoAtendimento'))
    expect(conferencia).toMatch(/!esperada/)
  })

  it('a comparação da senha é em tempo constante', () => {
    expect(UTIL).toMatch(/function iguaisEmTempoConstante/)
    expect(UTIL).not.toMatch(/senha === esperada|esperada === senha/)
  })
})

describe('O selo carrega o próprio prazo', () => {
  it('o HMAC cobre a data de expiração', () => {
    /*
      `maxAge` é instrução ao navegador, e navegador é do outro lado: quem quiser guardar o
      cookie além do prazo consegue. O que impede a prorrogação é o HMAC cobrir a data.
    */
    expect(UTIL).toMatch(/chaveHmac\(String\(expiraEm\), esperada\)/)
    expect(UTIL).toMatch(/Number\(expiraEm\) <= Date\.now\(\)/)
  })

  it('o cookie é do servidor, do próprio host e só por HTTPS', () => {
    expect(UTIL).toMatch(/httpOnly: true/)
    expect(UTIL).toMatch(/secure: true/)
    expect(UTIL).toMatch(/sameSite: 'strict'/)
    expect(UTIL).toMatch(/__Host-/)
  })
})

describe('A senha é contada, e o teto do público não muda', () => {
  it('ligar o modo passa pelo limite de frequência', () => {
    // Rota que confere senha e não conta tentativa é rota de força bruta.
    expect(ROTA).toMatch(/registrarTentativa/)
    expect(ROTA).toMatch(/statusCode: 429/)
  })

  it('senha errada e segredo ausente dão a mesma resposta', () => {
    // Distinguir contaria a quem sonda que o modo existe mas não está montado aqui.
    const respostas = [...ROTA.matchAll(/statusCode: 401[\s\S]{0,120}/g)]
    expect(respostas.length).toBe(1)
  })

  it('o teto do público continua em 12 por 15 minutos', () => {
    expect(UTIL).toMatch(/LIMITE_PUBLICO = \{ escopo: 'inscricao', maximo: 12, janelaSegundos: 900/)
  })

  it('o cadastro escolhe o teto pelo modo, e não por IP conhecido', () => {
    // Reconhecer o IP da associação seria o desenho óbvio e errado: a rede muda, e um IP
    // numa lista é uma porta que ninguém lembra de fechar.
    expect(CADASTRO).toMatch(/emModoAtendimento\(event\)\) \? LIMITE_ATENDIMENTO : LIMITE_PUBLICO/)
    expect(CADASTRO).not.toMatch(/ipConhecido|listaDeIps|IPS_/)
  })
})
