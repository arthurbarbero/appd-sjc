/**
 * O registro do consentimento — T5 e T6 de `consentimento-e-privacidade`.
 *
 * A tabela `consentimentos` existe para uma coisa só: provar, anos depois, que o
 * tratamento de um dado sensível teve base legal. Isso impõe três garantias que não são
 * verificáveis lendo a tela — e são elas que este arquivo guarda:
 *
 * - **minimização** (REQ-10): a linha registra versão, momento e origem. Não registra IP
 *   nem user-agent. Guardar o IP de quem procura uma associação de pessoas com deficiência
 *   seria produzir exatamente o registro que o resto do sistema evita;
 * - **append-only** (REQ-9): revogar e reaceitar criam linhas novas. Nenhum `UPDATE`,
 *   nenhum `DELETE` — histórico que se reescreve não é prova;
 * - **hash de verdade** (REQ-8): o que é gravado sai do catálogo, resolvido pelo hash que
 *   a tela exibiu. Nada de valor fixo no código.
 *
 * Parte é lida do banco migrado (o que vale é o que está no arquivo que vai para o D1) e
 * parte é lida do código-fonte das rotas — porque o jeito de essas garantias caírem não é
 * bug de renderização, é alguém acrescentar uma coluna ou um `UPDATE` sem perceber o que
 * está desfazendo.
 */

import { DatabaseSync } from 'node:sqlite'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { esquemaInscricao } from '../shared/inscricao'
import { TERMO_ART11, versaoPorHash } from '../shared/termos'

const RAIZ = join(import.meta.dirname, '..')
const API = join(RAIZ, 'server', 'api')
const ler = (...caminho: string[]) => readFileSync(join(...caminho), 'utf8')

function bancoMigrado(): DatabaseSync {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  const pasta = join(RAIZ, 'drizzle', 'migrations')
  for (const arquivo of readdirSync(pasta)
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    for (const comando of ler(pasta, arquivo).split('--> statement-breakpoint')) {
      if (comando.trim()) db.exec(comando)
    }
  }
  return db
}

describe('a linha do consentimento não guarda mais do que precisa (REQ-10, T5)', () => {
  const db = bancoMigrado()

  it('a tabela tem exatamente as colunas do contrato', () => {
    const colunas = (
      db.prepare("SELECT name FROM pragma_table_info('consentimentos')").all() as {
        name: string
      }[]
    )
      .map((c) => c.name)
      .sort()

    expect(colunas).toEqual([
      'evento',
      'hash',
      'id',
      'origem',
      'registrado_em',
      'termo_id',
      'usuario_id',
      'versao',
    ])
  })

  it('nenhuma coluna guarda endereço IP ou user-agent', () => {
    const colunas = (
      db.prepare("SELECT name FROM pragma_table_info('consentimentos')").all() as {
        name: string
      }[]
    ).map((c) => c.name)

    for (const proibida of colunas) {
      expect(proibida).not.toMatch(/\bip\b|endereco_ip|user_?agent|navegador/i)
    }
  })

  it('nenhuma rota manda IP ou user-agent para dentro da tabela', () => {
    // A rota de cadastro **usa** o IP, para o limite por tentativa — e o usa em HMAC, sem
    // gravá-lo. O que não pode é ele entrar no `values` do consentimento.
    for (const rota of [
      ler(API, 'conta', 'cadastro.post.ts'),
      ler(API, 'area', 'excluir.post.ts'),
    ]) {
      const valores = rota.match(/insert\(schema\.consentimentos\)\.values\(\{([\s\S]*?)\}\)/)?.[1]
      expect(valores, 'insert em consentimentos não encontrado na rota').toBeTruthy()
      expect(valores).not.toMatch(/ip|userAgent|user-agent|headers/i)
    }
  })

  it('a busca por titular tem índice, e ele cobre usuário, termo e momento', () => {
    const indice = db
      .prepare("SELECT name FROM pragma_index_list('consentimentos') WHERE origin = 'c'")
      .all() as { name: string }[]
    expect(indice.map((i) => i.name)).toContain('consentimentos_busca')

    const colunas = (
      db.prepare("SELECT name FROM pragma_index_info('consentimentos_busca')").all() as {
        name: string
      }[]
    ).map((c) => c.name)
    expect(colunas).toEqual(['usuario_id', 'termo_id', 'registrado_em'])
  })
})

describe('o registro é append-only na aplicação (REQ-9, T5)', () => {
  /*
    A tabela não tem trava de banco contra `UPDATE` — SQLite não oferece uma barata, e
    inventar gatilho aqui esconderia a regra num lugar onde ninguém procura. A garantia é
    esta varredura: o código não tem como reescrever histórico porque não existe uma linha
    de código que o faça, e acrescentar uma reprova o build.

    Vale para a exclusão de conta também: ela apaga foto e inscrição, anonimiza o usuário e
    **acrescenta** uma linha de revogação. As anteriores ficam.
  */
  function arquivosDe(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? arquivosDe(join(dir, e.name)) : [join(dir, e.name)],
    )
  }

  const doServidor = arquivosDe(join(RAIZ, 'server')).filter((f) => f.endsWith('.ts'))

  it('nenhum arquivo do servidor atualiza ou apaga linhas de consentimento', () => {
    const infratores = doServidor.filter((caminho) =>
      /(update|delete)\(\s*schema\.consentimentos\s*\)/.test(ler(caminho)),
    )
    expect(infratores.map((c) => c.slice(RAIZ.length + 1))).toEqual([])
  })

  it('nenhum SQL solto mexe na tabela fora de INSERT', () => {
    const infratores = doServidor.filter((caminho) =>
      /(UPDATE|DELETE\s+FROM)\s+consentimentos/i.test(ler(caminho)),
    )
    expect(infratores.map((c) => c.slice(RAIZ.length + 1))).toEqual([])
  })

  it('a exclusão de conta acrescenta a revogação em vez de apagar o histórico', () => {
    const rota = ler(API, 'area', 'excluir.post.ts')
    expect(rota).toMatch(/insert\(schema\.consentimentos\)/)
    expect(rota).toMatch(/evento: 'revogacao'/)
    expect(rota).not.toMatch(/delete\(schema\.consentimentos\)/)
  })
})

describe('o que é gravado sai do catálogo, não do teclado (REQ-8, T6)', () => {
  const cadastro = ler(API, 'conta', 'cadastro.post.ts')
  const exclusao = ler(API, 'area', 'excluir.post.ts')

  it('o cadastro resolve a versão pelo hash que a tela exibiu', () => {
    expect(cadastro).toMatch(/versaoPorHash\(\s*d\.termoHash\s*\)/)
    expect(cadastro).toMatch(/versao: termo\.versao/)
    expect(cadastro).toMatch(/hash: termo\.hash/)
  })

  it('nenhuma rota grava versão fixa nem hash de marcador de lugar', () => {
    for (const [nome, rota] of [
      ['cadastro', cadastro],
      ['exclusão', exclusao],
    ] as const) {
      const codigo = rota.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
      const valores = codigo.match(
        /insert\(schema\.consentimentos\)\.values\(\{([\s\S]*?)\}\)/,
      )?.[1]
      expect(valores, `insert não encontrado na rota de ${nome}`).toBeTruthy()
      expect(valores, `${nome} grava hash literal`).not.toMatch(/hash:\s*['"]/)
      expect(valores, `${nome} grava hash de marcador de lugar`).not.toMatch(
        /'0'\s*\.\s*repeat\(\s*64\s*\)/,
      )
      expect(valores, `${nome} grava versão fixa`).not.toMatch(/versao:\s*['"]v\d/)
    }
  })

  it('a revogação da exclusão aponta para o termo que a pessoa aceitou', () => {
    // Sem consulta ao último aceite, a linha de revogação diria "v1" para sempre — e no dia
    // em que existir v2, estaria mentindo sobre o que a pessoa está retirando.
    expect(exclusao).toMatch(/consentimentos\.findFirst|query\.consentimentos/)
    expect(exclusao).toMatch(/versaoVigente\(/)
  })

  it('o hash que a tela envia é o da versão vigente resolvida no catálogo', () => {
    const tela = ler(RAIZ, 'app', 'pages', 'atendimento', 'inscricao.vue')
    expect(tela).toMatch(/versaoVigente\('deficiencia-art11'\)/)
    expect(tela).toMatch(/termoHash: termoExibido\.hash/)
  })

  it('o hash do termo publicado é reconhecido, e um hash inventado não', () => {
    expect(versaoPorHash(TERMO_ART11.hash)?.termoId).toBe('deficiencia-art11')
    expect(versaoPorHash('c'.repeat(64))).toBeNull()
  })
})

describe('sem consentimento o servidor recusa (REQ-7, T6)', () => {
  /*
    O 422 de verdade, com a rota rodando, está no `npm run aceite` — aqui fica a regra que
    o produz, que é o schema compartilhado. Vale testar nos dois lugares: este é rápido e
    aponta o campo exato; o outro prova que o servidor realmente responde 422 a quem chama
    a API direto, sem passar por tela nenhuma.
  */
  const valido = {
    nome: 'Maria Fictícia da Silva',
    nascimento: '12/03/1978',
    telefone: '12900000001',
    telefoneWhatsapp: 'Sim',
    cep: '12200000',
    endereco: 'Rua Fictícia',
    numero: '100',
    bairro: 'Centro',
    municipio: 'São José dos Campos',
    deficiencias: ['Física'],
    atendimentos: ['Fisioterapia'],
    dias: ['Segundas'],
    cienciaContribuicao: 'Ciente',
    email: 'maria.ficticia@exemplo.invalido',
    cpf: '39053344705',
    senha: 'senha-ficticia-de-teste',
    consentimentoSaude: true,
    termoHash: TERMO_ART11.hash,
    chaveIdempotencia: '00000000-0000-4000-8000-000000000000',
  }

  it('o envio completo, com consentimento e hash, é aceito', () => {
    expect(esquemaInscricao.safeParse(valido).success).toBe(true)
  })

  it('sem o campo de consentimento, recusa apontando o campo', () => {
    const { consentimentoSaude: _fora, ...sem } = valido
    const r = esquemaInscricao.safeParse(sem)
    expect(r.success).toBe(false)
    expect(r.error?.issues.map((i) => i.path[0])).toContain('consentimentoSaude')
  })

  it('consentimento marcado como falso é recusa, não omissão', () => {
    const r = esquemaInscricao.safeParse({ ...valido, consentimentoSaude: false })
    expect(r.success).toBe(false)
    expect(r.error?.issues.map((i) => i.path[0])).toContain('consentimentoSaude')
  })

  it('aceitar termos gerais não vale como consentimento do Art. 11', () => {
    // `.strict()`: o campo estranho é recusado, e o consentimento específico continua
    // faltando. Aceite genérico não compra o do Art. 11 (Art. 8º, §4º).
    const { consentimentoSaude: _fora, ...sem } = valido
    const r = esquemaInscricao.safeParse({ ...sem, aceiteTermosGerais: true })
    expect(r.success).toBe(false)
    const campos = r.error?.issues.map((i) => i.path[0])
    expect(campos).toContain('consentimentoSaude')
  })

  it('sem o hash do termo, recusa: não dá para provar o que foi lido', () => {
    const { termoHash: _fora, ...sem } = valido
    const r = esquemaInscricao.safeParse(sem)
    expect(r.success).toBe(false)
    expect(r.error?.issues.map((i) => i.path[0])).toContain('termoHash')
  })

  it('hash fora do formato é recusado antes de chegar ao catálogo', () => {
    const r = esquemaInscricao.safeParse({ ...valido, termoHash: 'nao-e-hash' })
    expect(r.success).toBe(false)
    expect(r.error?.issues.map((i) => i.path[0])).toContain('termoHash')
  })
})
