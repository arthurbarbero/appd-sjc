/**
 * Testes de restrição do contrato de dados — `openspec/changes/modelo-de-dados` T3.1.
 *
 * O que estes testes provam: que as regras do contrato estão **no banco**, não só no Zod.
 * Uma rota nova que esqueça a validação ainda assim esbarra aqui. Por isso cada teste
 * insere direto por SQL, sem passar por camada nenhuma — é o pior caso.
 *
 * Por que `node:sqlite` e não o D1: o D1 **é** SQLite, e o que se testa aqui são `CHECK`,
 * `UNIQUE` e `FOREIGN KEY`, que são do motor. Rodar em memória deixa o teste rápido e sem
 * dependência nova — `node:sqlite` vem no Node 22. O mesmo SQL da migration versionada é
 * aplicado, então o que passa aqui é o que está no arquivo que vai para o D1.
 *
 * O contrário também vale, e é a parte que costuma faltar: cada teste **precisa falhar**
 * se a restrição correspondente sair do schema. Teste que não detecta remoção não prova
 * nada — é o que a T3.1 exige por escrito.
 */

import { DatabaseSync } from 'node:sqlite'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'

const PASTA_MIGRATIONS = join(import.meta.dirname, '..', 'drizzle', 'migrations')

/** Aplica todas as migrations versionadas, na ordem, num banco em memória. */
function bancoMigrado(): DatabaseSync {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')

  const arquivos = readdirSync(PASTA_MIGRATIONS)
    .filter((f) => f.endsWith('.sql'))
    .sort()
  expect(arquivos.length).toBeGreaterThan(0)

  for (const arquivo of arquivos) {
    const sql = readFileSync(join(PASTA_MIGRATIONS, arquivo), 'utf8')
    for (const comando of sql.split('--> statement-breakpoint')) {
      if (comando.trim()) db.exec(comando)
    }
  }
  return db
}

const AGORA = '2026-08-06T14:03:11Z'
/** CPF fictício com dígitos verificadores válidos, usado só em teste. */
const CPF = '39053344705'
const HASH64 = 'a'.repeat(64)

/** Insere um usuário ativo completo e devolve o id. */
function criaUsuario(db: DatabaseSync, sobrescreve: Record<string, string> = {}): string {
  const dados: Record<string, string> = {
    id: 'usuario-1',
    numero_registro: 'APPD-2026-K7M2QX',
    email: 'maria.ficticia@exemplo.test',
    cpf: CPF,
    senha_hash: 'hash-ficticio',
    senha_params: '{"N":16384,"r":8,"p":1,"sal":"ficticio"}',
    nome: 'Maria Fictícia da Silva',
    nascimento: '1978-03-12',
    telefone: '12900000001',
    telefone_whatsapp: 'Sim',
    cep: '12239530',
    endereco: 'Rua de Teste',
    numero: 's/n',
    bairro: 'Bairro Fictício',
    municipio: 'São José dos Campos',
    situacao: 'ativo',
    criado_em: AGORA,
    atualizado_em: AGORA,
    ...sobrescreve,
  }
  const colunas = Object.keys(dados)
  db.prepare(
    `INSERT INTO usuarios (${colunas.join(',')}) VALUES (${colunas.map(() => '?').join(',')})`,
  ).run(...Object.values(dados))
  return dados.id!
}

function criaInscricao(db: DatabaseSync, usuarioId: string, id = 'inscricao-1') {
  db.prepare(
    `INSERT INTO inscricoes_atendimento
       (id, usuario_id, deficiencias, atendimentos, dias, ciencia_contribuicao,
        status, criado_em, atualizado_em)
     VALUES (?, ?, ?, ?, ?, 'Ciente', 'Interesse registrado', ?, ?)`,
  ).run(id, usuarioId, '["Física"]', '["Fisioterapia"]', '["Segundas"]', AGORA, AGORA)
}

/**
 * Guardas sobre o **arquivo** da migration, não sobre o banco em memória.
 *
 * Existem porque os dois defeitos que derrubaram este schema não apareciam nos testes de
 * comportamento: o `node:sqlite` aceitava o que o D1 recusa, e um `?` no meio do SQL só
 * quebra na hora de aplicar. Teste de comportamento não protege de tudo.
 */
describe('A migration é aplicável no D1', () => {
  const sql = readdirSync(PASTA_MIGRATIONS)
    .filter((f) => f.endsWith('.sql'))
    .map((f) => readFileSync(join(PASTA_MIGRATIONS, f), 'utf8'))
    .join('\n')

  it('não contém placeholder de parâmetro', () => {
    // Interpolar string JS num `sql` do Drizzle vira bind param e emite `GLOB ?`.
    expect(sql).not.toMatch(/GLOB\s*\?/)
    expect(sql).not.toMatch(/LIKE\s*\?/)
  })

  it('nenhum padrão GLOB passa de 10 classes de caractere', () => {
    // Limite medido no D1 local em 2026-08-06: na 11ª classe ele responde
    // `LIKE or GLOB pattern too complex` e a inserção falha.
    const padroes = sql.match(/GLOB\s+'[^']*'/g) ?? []
    expect(padroes.length).toBeGreaterThan(0)
    for (const padrao of padroes) {
      const classes = (padrao.match(/\[/g) ?? []).length
      expect(classes, `padrão com ${classes} classes: ${padrao}`).toBeLessThanOrEqual(10)
    }
  })
})

describe('Integridade do modelo de dados', () => {
  let db: DatabaseSync

  beforeEach(() => {
    db = bancoMigrado()
  })

  it('a migration cria as cinco tabelas e nenhuma outra', () => {
    const tabelas = db
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf%'
         ORDER BY name`,
      )
      .all()
      .map((linha) => linha.name)

    expect(tabelas).toEqual([
      'consentimentos',
      'fotos',
      'inscricoes_atendimento',
      'tentativas',
      'usuarios',
    ])
    // Explícito porque a ausência é o requisito (REQ-33 e REQ-34), não um detalhe:
    expect(tabelas).not.toContain('sessoes')
    expect(tabelas).not.toContain('log_acesso')
  })

  it('e-mail duplicado é recusado pelo banco, não pelo código', () => {
    criaUsuario(db)
    expect(() =>
      criaUsuario(db, { id: 'usuario-2', numero_registro: 'APPD-2026-P4NRT9', cpf: '52998224725' }),
    ).toThrow(/UNIQUE/i)
  })

  it('CPF duplicado é recusado pelo banco', () => {
    criaUsuario(db)
    expect(() =>
      criaUsuario(db, {
        id: 'usuario-2',
        numero_registro: 'APPD-2026-P4NRT9',
        email: 'outra@exemplo.test',
      }),
    ).toThrow(/UNIQUE/i)
  })

  it('e-mail com maiúscula é recusado: normalização é regra do banco', () => {
    expect(() => criaUsuario(db, { email: 'Maria@Exemplo.test' })).toThrow(/CHECK/i)
  })

  it('CPF com máscara é recusado: a coluna guarda só dígitos', () => {
    expect(() => criaUsuario(db, { cpf: '390.533.447-05' })).toThrow(/CHECK/i)
  })

  it('número de registro fora do formato é recusado', () => {
    expect(() => criaUsuario(db, { numero_registro: 'ATD-2026-K7M2QX' })).toThrow(/CHECK/i)
    expect(() => criaUsuario(db, { numero_registro: 'APPD-2026-K7M2Q' })).toThrow(/CHECK/i)
  })

  it('uma pessoa não tem duas inscrições', () => {
    const usuarioId = criaUsuario(db)
    criaInscricao(db, usuarioId)
    expect(() => criaInscricao(db, usuarioId, 'inscricao-2')).toThrow(/UNIQUE/i)
  })

  it('status fora do vocabulário é recusado', () => {
    const usuarioId = criaUsuario(db)
    expect(() =>
      db
        .prepare(
          `INSERT INTO inscricoes_atendimento
             (id, usuario_id, deficiencias, atendimentos, dias, ciencia_contribuicao,
              status, criado_em, atualizado_em)
           VALUES ('i', ?, '["Física"]', '["Fisioterapia"]', '["Segundas"]', 'Ciente',
                   'Na fila', ?, ?)`,
        )
        .run(usuarioId, AGORA, AGORA),
    ).toThrow(/CHECK/i)
  })

  it('múltipla escolha vazia ou não-array é recusada', () => {
    const usuarioId = criaUsuario(db)
    const insere = (deficiencias: string) =>
      db
        .prepare(
          `INSERT INTO inscricoes_atendimento
             (id, usuario_id, deficiencias, atendimentos, dias, ciencia_contribuicao,
              criado_em, atualizado_em)
           VALUES ('i', ?, ?, '["Fisioterapia"]', '["Segundas"]', 'Ciente', ?, ?)`,
        )
        .run(usuarioId, deficiencias, AGORA, AGORA)

    expect(() => insere('[]')).toThrow(/CHECK/i)
    expect(() => insere('Física')).toThrow(/CHECK/i)
    expect(() => insere('{"tipo":"Física"}')).toThrow(/CHECK/i)
  })

  it('foto acima do teto é recusada pelo banco', () => {
    const usuarioId = criaUsuario(db)
    const insereFoto = (bytes: number) =>
      db
        .prepare(
          `INSERT INTO fotos (id, usuario_id, conteudo, tipo, largura, altura,
                              criado_em, atualizado_em)
           VALUES ('f', ?, ?, 'image/jpeg', 400, 500, ?, ?)`,
        )
        .run(usuarioId, new Uint8Array(bytes), AGORA, AGORA)

    expect(() => insereFoto(102_401)).toThrow(/CHECK/i)
    expect(() => insereFoto(102_400)).not.toThrow()
  })

  it('foto fora das dimensões do crachá é recusada', () => {
    const usuarioId = criaUsuario(db)
    expect(() =>
      db
        .prepare(
          `INSERT INTO fotos (id, usuario_id, conteudo, tipo, largura, altura,
                              criado_em, atualizado_em)
           VALUES ('f', ?, ?, 'image/jpeg', 800, 1000, ?, ?)`,
        )
        .run(usuarioId, new Uint8Array(1024), AGORA, AGORA),
    ).toThrow(/CHECK/i)
  })

  it('situação só aceita os dois valores previstos', () => {
    const usuarioId = criaUsuario(db)
    expect(() =>
      db.prepare('UPDATE usuarios SET situacao = ? WHERE id = ?').run('pendente', usuarioId),
    ).toThrow(/CHECK/i)
  })

  it('conta ativa não pode ficar sem nome', () => {
    const usuarioId = criaUsuario(db)
    expect(() => db.prepare('UPDATE usuarios SET nome = NULL WHERE id = ?').run(usuarioId)).toThrow(
      /CHECK/i,
    )
  })

  it('a exclusão apaga o dado sensível e preserva o número', () => {
    const usuarioId = criaUsuario(db)
    criaInscricao(db, usuarioId)
    db.prepare(
      `INSERT INTO fotos (id, usuario_id, conteudo, tipo, largura, altura, criado_em, atualizado_em)
       VALUES ('f', ?, ?, 'image/jpeg', 400, 500, ?, ?)`,
    ).run(usuarioId, new Uint8Array(1024), AGORA, AGORA)
    for (const [id, evento] of [
      ['c1', 'aceite'],
      ['c2', 'aceite'],
    ]) {
      db.prepare(
        `INSERT INTO consentimentos (id, usuario_id, termo_id, versao, hash, evento,
                                     registrado_em, origem)
         VALUES (?, ?, 'deficiencia-art11', 'v1', ?, ?, ?, '/atendimento/inscricao')`,
      ).run(id!, usuarioId, HASH64, evento!, AGORA)
    }

    // O contrato do REQ-28, executado como a rota executaria.
    db.exec('BEGIN')
    db.prepare('DELETE FROM fotos WHERE usuario_id = ?').run(usuarioId)
    db.prepare('DELETE FROM inscricoes_atendimento WHERE usuario_id = ?').run(usuarioId)
    db.prepare(
      `UPDATE usuarios SET
         nome = NULL, email = NULL, cpf = NULL, senha_hash = NULL, senha_params = NULL,
         nascimento = NULL, telefone = NULL, telefone_whatsapp = NULL, cep = NULL,
         endereco = NULL,
         numero = NULL, complemento = NULL, bairro = NULL, municipio = NULL,
         cuidador_nome = NULL, cuidador_contato = NULL, chave_idempotencia = NULL,
         situacao = 'inativo', atualizado_em = ?
       WHERE id = ?`,
    ).run(AGORA, usuarioId)
    db.prepare(
      `INSERT INTO consentimentos (id, usuario_id, termo_id, versao, hash, evento,
                                   registrado_em, origem)
       VALUES ('c3', ?, 'deficiencia-art11', 'v1', ?, 'revogacao', ?, '/area/excluir')`,
    ).run(usuarioId, HASH64, AGORA)
    db.exec('COMMIT')

    const conta = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(usuarioId)!
    expect(conta.nome).toBeNull()
    expect(conta.email).toBeNull()
    expect(conta.cpf).toBeNull()
    expect(conta.situacao).toBe('inativo')
    // O que sobrevive, e é o ponto: o número nunca some nem é reutilizado.
    expect(conta.numero_registro).toBe('APPD-2026-K7M2QX')

    expect(db.prepare('SELECT count(*) c FROM inscricoes_atendimento').get()!.c).toBe(0)
    expect(db.prepare('SELECT count(*) c FROM fotos').get()!.c).toBe(0)
    // Os aceites sobrevivem: são a prova de que o tratamento teve base legal (REQ-25).
    expect(
      db.prepare("SELECT count(*) c FROM consentimentos WHERE evento = 'aceite'").get()!.c,
    ).toBe(2)
    expect(
      db.prepare("SELECT count(*) c FROM consentimentos WHERE evento = 'revogacao'").get()!.c,
    ).toBe(1)
  })

  it('apagar a conta leva junto inscrição e foto, mas não o consentimento', () => {
    const usuarioId = criaUsuario(db)
    criaInscricao(db, usuarioId)
    db.prepare(
      `INSERT INTO consentimentos (id, usuario_id, termo_id, versao, hash, evento,
                                   registrado_em, origem)
       VALUES ('c1', ?, 'deficiencia-art11', 'v1', ?, 'aceite', ?, '/atendimento/inscricao')`,
    ).run(usuarioId, HASH64, AGORA)

    // A FK de consentimentos não tem CASCADE de propósito: o DELETE tem de ser recusado.
    expect(() => db.prepare('DELETE FROM usuarios WHERE id = ?').run(usuarioId)).toThrow(
      /FOREIGN KEY/i,
    )
  })

  it('nenhuma tabela guarda IP nem e-mail de tentativa em texto claro', () => {
    const insere = (chave: string, escopo: string) =>
      db
        .prepare('INSERT INTO tentativas (chave_hash, escopo, criado_em) VALUES (?, ?, ?)')
        .run(chave, escopo, AGORA)

    expect(() => insere('203.0.113.7', 'inscricao')).toThrow(/CHECK/i)
    expect(() => insere('alguem@exemplo.test', 'login')).toThrow(/CHECK/i)
    expect(() => insere(HASH64, 'qualquer-coisa')).toThrow(/CHECK/i)

    for (const escopo of ['inscricao', 'verificacao', 'login']) {
      expect(() => insere(HASH64, escopo)).not.toThrow()
    }
  })

  it('toda data gravada está em UTC com sufixo Z', () => {
    expect(() => criaUsuario(db, { criado_em: '2026-08-06 14:03:11' })).toThrow(/CHECK/i)
    expect(() => criaUsuario(db, { criado_em: '2026-08-06T11:03:11-03:00' })).toThrow(/CHECK/i)
    expect(() => criaUsuario(db, { nascimento: '12/03/1978' })).toThrow(/CHECK/i)
  })

  it('nenhuma coluna de nenhuma tabela guarda senha em texto claro', () => {
    const tabelas = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
      .all()
      .map((linha) => String(linha.name))

    const proibidas = new Set(['senha', 'password', 'senha_clara', 'senha_texto'])
    for (const tabela of tabelas) {
      const colunas = db
        .prepare(`SELECT name FROM pragma_table_info('${tabela}')`)
        .all()
        .map((linha) => String(linha.name))
      for (const coluna of colunas) {
        expect(proibidas.has(coluna), `${tabela}.${coluna} não pode existir`).toBe(false)
      }
    }
  })

  it('o consentimento exige hash de 64 hexadecimais e evento do vocabulário', () => {
    const usuarioId = criaUsuario(db)
    const insere = (hash: string, evento: string) =>
      db
        .prepare(
          `INSERT INTO consentimentos (id, usuario_id, termo_id, versao, hash, evento,
                                       registrado_em, origem)
           VALUES ('c', ?, 'deficiencia-art11', 'v1', ?, ?, ?, '/x')`,
        )
        .run(usuarioId, hash, evento, AGORA)

    expect(() => insere('abc', 'aceite')).toThrow(/CHECK/i)
    expect(() => insere(HASH64, 'consentiu')).toThrow(/CHECK/i)
    expect(() => insere(HASH64, 'aceite')).not.toThrow()
  })
})

/**
 * O que estes testes **não** provam, e por quê — para ninguém ler "18 verdes" como
 * "contrato inteiro coberto":
 *
 * - **Imutabilidade do `numero_registro`** (REQ-8): o banco garante formato e unicidade,
 *   mas "nenhuma rota altera" é regra da camada de dados, que ainda não existe. Fica na
 *   T3 de `cadastro-e-login`.
 * - **Cadastros simultâneos não colidem** (REQ-9): depende do emissor com retentativa,
 *   também de `cadastro-e-login`. O `UNIQUE` daqui é o que torna a retentativa possível;
 *   provar que ela funciona é outro teste.
 */
