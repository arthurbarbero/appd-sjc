/**
 * Auditoria mecânica das changes — a Definition of Ready da skill `revisor-spec`, na
 * parte que uma máquina consegue conferir.
 *
 * **Por que este arquivo existe.** O parecer `PARECER-GATE-T5.md` foi autorrevisão: eu
 * auditei a spec que eu mesmo escrevi, e o próprio parecer registrou que isso não vale
 * como gate. O dono, ao ser informado da pendência, respondeu "se arrume".
 *
 * Arrumar de verdade não é ler de novo — quem escreveu não enxerga o buraco na segunda
 * leitura mais do que na primeira. É tirar o julgamento do caminho: as regras abaixo são
 * verificáveis sem opinião, e falham no `npm test` de quem quer que tenha escrito a spec.
 *
 * **O que isto NÃO substitui.** Julgamento de mérito: se o requisito é o certo, se o
 * escopo é o que a APPD precisa, se a decisão de produto está boa. Nada aqui opina sobre
 * isso, e nenhuma automação opinaria. Continua valendo o que o parecer disse: revisão de
 * mérito é do dono da área. O que a máquina cobre é a forma — e a forma era onde estavam
 * 25 dos bloqueios do primeiro gate.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const CHANGES = join(import.meta.dirname, '..', 'openspec', 'changes')
const NOMES = readdirSync(CHANGES).filter((n) => existsSync(join(CHANGES, n, 'spec.md')))

const spec = (nome: string) => readFileSync(join(CHANGES, nome, 'spec.md'), 'utf8')
const tasks = (nome: string) =>
  existsSync(join(CHANGES, nome, 'tasks.md'))
    ? readFileSync(join(CHANGES, nome, 'tasks.md'), 'utf8')
    : ''

/** Fora de bloco `gherkin`, `> citação` e comentário: é ali que mora o requisito. */
function corpoNormativo(texto: string): string {
  return texto
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^\s*>.*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

describe('as changes existem e estão completas', () => {
  it('há changes para auditar', () => {
    expect(NOMES.length).toBeGreaterThan(0)
  })

  it.each(NOMES)('%s tem proposal, spec e tasks', (nome) => {
    for (const arquivo of ['proposal.md', 'spec.md', 'tasks.md']) {
      expect(existsSync(join(CHANGES, nome, arquivo)), `${nome}/${arquivo}`).toBe(true)
    }
  })
})

describe('todo requisito tem critério de aceite (Definition of Ready, item 3)', () => {
  /*
    A regra do `revisor-spec`: requisito sem cenário Dado/Quando/Então não é Ready, porque
    não existe como dizer se ele passou. Aqui a checagem é de cobertura: cada REQ precisa
    ser citado por algum bloco de cenário da própria spec.

    Não confere o conteúdo do cenário — isso é julgamento. Confere que ele existe, que é
    onde o esquecimento acontece.
  */
  it.each(NOMES)('%s: nenhum requisito órfão', (nome) => {
    const texto = spec(nome)
    // As specs usam dois formatos de declaração: com marcador de lista (`- **REQ-1**`) e
    // sem (`**REQ-1** —`). Aceitar só um fazia a auditoria pular uma change inteira e
    // acusar "não declara requisito nenhum" — falha do gate, não da spec.
    const declarados = new Set(
      [...texto.matchAll(/^\s*(?:-\s+)?\*\*(REQ-[\w-]+)\*\*[\s:—-]/gm)].map((m) => m[1]),
    )
    expect(declarados.size, `${nome} não declara requisito nenhum`).toBeGreaterThan(0)

    /*
      Um cenário cobre um requisito de dois jeitos: citando-o na linha "Cobre REQ-x a
      REQ-y" do bloco, ou sendo citado pela própria linha do requisito ("**Aceite**: ...").
      Faixas ("REQ-2 a REQ-7") contam para todos os números do intervalo.
    */
    const cobertos = new Set<string>()
    for (const [, ini, fim] of texto.matchAll(/REQ-(\d+)\s*(?:a|até|-)\s*REQ-(\d+)/g)) {
      for (let i = Number(ini); i <= Number(fim); i++) cobertos.add(`REQ-${i}`)
    }
    for (const bloco of texto.match(/```gherkin[\s\S]*?```/g) ?? []) {
      for (const [, req] of bloco.matchAll(/(REQ-[\w-]+)/g)) cobertos.add(req)
    }
    for (const [, req] of texto.matchAll(/Cobre ([^\n]+)/g)) {
      for (const [, r] of req.matchAll(/(REQ-[\w-]+)/g)) cobertos.add(r)
    }
    /*
      Terceiro jeito, e o único que serve para contrato de dados: **tabela de
      rastreabilidade**, uma linha por requisito dizendo onde ele é verificado.

      Cenário Gherkin descreve comportamento; "a coluna `cpf` é TEXT NOT NULL UNIQUE de 11
      dígitos" não é comportamento, é forma. Escrever Dado/Quando/Então para cada coluna
      produziria dezenas de cenários que ninguém lê e que não dizem mais do que a linha da
      tabela — e é assim que o rito vira cerimônia. A linha precisa apontar para algo
      executável (teste, migration, restrição), e isso a leitura confere.
    */
    for (const [linha] of texto.matchAll(/^\|.*REQ-[\w-]+.*\|.*$/gm)) {
      for (const [, r] of linha.matchAll(/(REQ-[\w-]+)/g)) cobertos.add(r)
      for (const [, ini, fim] of linha.matchAll(/REQ-(\d+)\s*a\s*REQ-(\d+)/g)) {
        for (let i = Number(ini); i <= Number(fim); i++) cobertos.add(`REQ-${i}`)
      }
    }

    // Sufixos de letra (REQ-11a) herdam a cobertura do número base: eles detalham o mesmo
    // requisito e o cenário costuma citar só o número.
    const orfaos = [...declarados].filter((r) => {
      if (cobertos.has(r)) return false
      const base = r.match(/^REQ-(\d+)/)
      return !(base && cobertos.has(`REQ-${base[1]}`))
    })
    expect(orfaos, `${nome}: requisitos sem cenário de aceite`).toEqual([])
  })
})

describe('nenhum critério é subjetivo (Definition of Ready, item 1)', () => {
  /*
    Adjetivo solto é o bloqueio mais comum do gate: "rápido", "bom", "adequado" não têm
    como virar teste, e quem lê depois preenche o vazio com o que quiser.

    A lista abaixo só pega o que aparece **em linha de requisito** — nota, justificativa e
    texto de tela podem usar as palavras normalmente, e usam.
  */
  const VAGAS = [
    /\brápid[ao]\b/i,
    /\blent[ao]\b(?! de propósito)/i,
    /\badequad[ao]\b/i,
    /\bsuficiente(?:mente)?\b/i,
    /\brazoáve(?:l|is)\b/i,
    /\bbo[am]\b/i,
    /\bbastante\b/i,
    /\bfuncionar bem\b/i,
    /\bo mais breve possível\b/i,
  ]

  it.each(NOMES)('%s', (nome) => {
    const linhas = corpoNormativo(spec(nome))
      .split('\n')
      .filter((l) => /^\s*-\s+\*\*REQ-/.test(l))
    const suspeitas = linhas.filter((l) => VAGAS.some((v) => v.test(l)))
    expect(suspeitas, `${nome}: requisito com adjetivo sem medida`).toEqual([])
  })
})

describe('escopo e rastreabilidade (Definition of Ready, item 3)', () => {
  it.each(NOMES)('%s declara fora de escopo', (nome) => {
    const texto = `${spec(nome)}\n${tasks(nome)}`
    expect(texto, `${nome}: sem seção de fora de escopo`).toMatch(
      /fora d[eo] escopo|não faz parte/i,
    )
  })

  it.each(NOMES)('%s aponta dono nomeado', (nome) => {
    const texto = `${spec(nome)}\n${tasks(nome)}`
    expect(texto, `${nome}: sem dono`).toMatch(/Dono|Aprovador|dono do projeto/i)
  })

  /*
    ADR citado tem de existir — ou estar **reservado por escrito** no índice, com a change
    dona nomeada.

    A brecha é estreita de propósito. Decisão que ainda não foi tomada não vira ADR
    inventado: o ADR-006 (onde vive o texto das versões do termo de consentimento) é uma
    escolha real que o dono ainda não fez, e escrevê-lo para calar o teste seria pior do
    que a citação órfã. O que não se admite é citar um número que não está nem escrito nem
    reservado — foi assim que 008, 009, 010 e 011 passaram dois dias sendo referência para
    documento nenhum.
  */
  it.each(NOMES)('%s: todo ADR citado existe ou está reservado no índice', (nome) => {
    const texto = `${spec(nome)}\n${tasks(nome)}`
    const pasta = join(import.meta.dirname, '..', 'docs', 'adr')
    const existentes = readdirSync(pasta)
    const indice = readFileSync(join(pasta, 'README.md'), 'utf8')
    const citados = new Set([...texto.matchAll(/ADR-(\d{3})/g)].map((m) => m[1]))

    const soltos = [...citados].filter((n) => {
      if (existentes.some((a) => a.startsWith(`adr-${n}`))) return false
      return !new RegExp(`^\\|\\s*${n}\\s*\\|.*\\|`, 'm').test(indice)
    })
    expect(soltos, `${nome}: ADR citado sem arquivo e sem reserva no índice`).toEqual([])
  })

  it('todo ADR reservado e não escrito aparece como pendência declarada', () => {
    const pasta = join(import.meta.dirname, '..', 'docs', 'adr')
    const existentes = readdirSync(pasta)
    const indice = readFileSync(join(pasta, 'README.md'), 'utf8')
    const reservados = [...indice.matchAll(/^\|\s*(\d{3})\s*\|/gm)].map((m) => m[1])
    const naoEscritos = reservados.filter((n) => !existentes.some((a) => a.startsWith(`adr-${n}`)))
    // Não é falha: é a lista que precisa ficar curta e visível. Falha se crescer demais,
    // que é o sinal de decisão sendo empurrada com a barriga.
    expect(naoEscritos.length, `ADRs reservados e nunca escritos: ${naoEscritos}`).toBeLessThan(3)
  })
})

describe('nenhuma spec carrega segredo (Definition of Ready, item 3)', () => {
  /*
    O gitleaks já varre o repositório inteiro no CI. Isto é a rede de baixo, e existe
    porque spec é onde se escreve exemplo — e exemplo é onde credencial real entra
    disfarçada de ilustração.
  */
  const PADROES = [
    /\bcfat_[A-Za-z0-9]{20,}/,
    /\bsk-[A-Za-z0-9]{20,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\b[A-Za-z0-9._%+-]+@(?!exemplo\.invalido|appd\.org\.br|gmail\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b.*senha/i,
  ]

  it.each(NOMES)('%s', (nome) => {
    const texto = `${spec(nome)}\n${tasks(nome)}`
    for (const padrao of PADROES) expect(texto).not.toMatch(padrao)
  })
})

describe('o estado do rito não mente', () => {
  it('nenhuma change está em changes/ e archive/ ao mesmo tempo', () => {
    const arquivo = join(import.meta.dirname, '..', 'openspec', 'archive')
    if (!existsSync(arquivo)) return
    const arquivadas = readdirSync(arquivo)
    expect(arquivadas.filter((n) => NOMES.includes(n))).toEqual([])
  })

  it('change arquivada não tem task em aberto', () => {
    const arquivo = join(import.meta.dirname, '..', 'openspec', 'archive')
    if (!existsSync(arquivo)) return
    for (const nome of readdirSync(arquivo)) {
      const caminho = join(arquivo, nome, 'tasks.md')
      if (!existsSync(caminho)) continue
      const abertas = readFileSync(caminho, 'utf8').match(/^\s*-\s+\[ \]/gm) ?? []
      expect(abertas, `${nome} foi arquivada com task em aberto`).toEqual([])
    }
  })
})
