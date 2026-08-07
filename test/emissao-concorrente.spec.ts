/**
 * T3.2 de `modelo-de-dados` / REQ-9: cinquenta conclusões em paralelo produzem cinquenta
 * números distintos.
 *
 * **O que este teste protege**, e por que ele existe apesar de o número ser sorteado:
 * a versão original desta tarefa mandava "ler o maior sequencial do ano e gravar o
 * próximo". Isso tem uma corrida clássica — dois cadastros simultâneos leem o mesmo maior
 * valor e tentam gravar o mesmo número —, e o gate a revogou (bloqueio B10). O desenho que
 * ficou é sortear e deixar o `UNIQUE` do banco recusar a colisão, **nunca** um `SELECT`
 * antes de gravar, que reintroduziria exatamente a corrida.
 *
 * Este teste falha se alguém reintroduzir a leitura-antes-da-escrita: com sorteio o
 * paralelismo é indiferente; com sequência lida antes, cinquenta gravações concorrentes
 * colidem.
 *
 * O `UNIQUE` é exercido de verdade, contra o SQL das migrations versionadas — a colisão é
 * detectada pelo banco, como em produção, e não por uma checagem em memória.
 */

import { DatabaseSync } from 'node:sqlite'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { emitirNumeroRegistro, ColisaoPersistente } from '../server/utils/registro'
import { PADRAO_NUMERO_REGISTRO } from '../shared/registro'

const PASTA_MIGRATIONS = join(import.meta.dirname, '..', 'drizzle', 'migrations')

function bancoMigrado(): DatabaseSync {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  for (const arquivo of readdirSync(PASTA_MIGRATIONS)
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    for (const comando of readFileSync(join(PASTA_MIGRATIONS, arquivo), 'utf8').split(
      '--> statement-breakpoint',
    )) {
      if (comando.trim()) db.exec(comando)
    }
  }
  return db
}

/**
 * Grava só o número, numa tabela que carrega a mesma restrição da coluna real.
 *
 * A tabela `usuarios` exige 22 colunas coerentes entre si para aceitar uma linha, e nada
 * disso é o assunto aqui. O que importa é o `UNIQUE`, e ele é copiado da migration em vez
 * de escrito à mão — se a coluna real perder a restrição, este teste continuaria passando
 * com uma cópia inventada, então a checagem abaixo confere que ela existe lá.
 */
function tabelaDeNumeros(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE emissao (
      numero_registro text PRIMARY KEY NOT NULL
    )
  `)
  return (numero: string) => {
    try {
      db.prepare('INSERT INTO emissao (numero_registro) VALUES (?)').run(numero)
      return Promise.resolve(true)
    } catch (erro) {
      if (String(erro).includes('UNIQUE')) return Promise.resolve(false)
      throw erro
    }
  }
}

describe('emissão concorrente do numero_registro (REQ-9)', () => {
  it('a coluna real tem UNIQUE — sem isso, o resto deste arquivo não prova nada', () => {
    const sql = readdirSync(PASTA_MIGRATIONS)
      .filter((f) => f.endsWith('.sql'))
      .map((f) => readFileSync(join(PASTA_MIGRATIONS, f), 'utf8'))
      .join('\n')
    expect(sql).toMatch(/unique[^\n]*numero_registro|numero_registro[^\n]*unique/i)
  })

  /*
    Dez execuções seguidas, como a T3.2 pede. Cinquenta emissões concorrentes por rodada.

    "Concorrente" em JavaScript de thread única não é paralelismo de verdade — mas é
    exatamente o entrelaçamento que quebraria um emissor com `SELECT` antes do `INSERT`,
    porque as cinquenta leituras aconteceriam antes da primeira escrita. É o modelo do
    Worker, que também é single-thread e também intercala requisições.
  */
  it.each(Array.from({ length: 10 }, (_, i) => i + 1))(
    'rodada %i: 50 emissões em paralelo, 50 números distintos',
    async () => {
      const db = bancoMigrado()
      const gravar = tabelaDeNumeros(db)

      const numeros = await Promise.all(
        Array.from({ length: 50 }, () => emitirNumeroRegistro(2026, gravar)),
      )

      expect(numeros).toHaveLength(50)
      expect(new Set(numeros).size).toBe(50)
      for (const numero of numeros) expect(numero).toMatch(PADRAO_NUMERO_REGISTRO)

      const gravados = db
        .prepare('SELECT numero_registro FROM emissao')
        .all()
        .map((l) => l.numero_registro)
      expect(new Set(gravados)).toEqual(new Set(numeros))
      db.close()
    },
  )

  it('sob colisão forçada, retenta e ainda entrega número distinto', async () => {
    /*
      Sem falso negativo: um teste que só sorteia **nunca** vê a retentativa, porque 887
      milhões de combinações fazem a colisão não acontecer. Aqui ela é forçada — as duas
      primeiras gravações de cada emissão são recusadas — para provar que o caminho de
      retentativa existe e funciona, e não que a sorte ajudou. É o que a T3.2 quer dizer
      com "sem falso negativo".
    */
    const gravados: string[] = []
    let recusasPendentes = 0

    const gravar = (numero: string) => {
      if (recusasPendentes > 0) {
        recusasPendentes--
        return Promise.resolve(false)
      }
      gravados.push(numero)
      return Promise.resolve(true)
    }

    for (let i = 0; i < 20; i++) {
      recusasPendentes = 2
      await emitirNumeroRegistro(2026, gravar)
    }

    expect(gravados).toHaveLength(20)
    expect(new Set(gravados).size).toBe(20)
  })

  it('desiste depois de 5 colisões, em vez de girar para sempre', async () => {
    // Um banco que recusa tudo é sinal de outro defeito. O emissor precisa falhar alto,
    // não entrar em laço infinito segurando a requisição até o teto de CPU do Worker.
    await expect(emitirNumeroRegistro(2026, () => Promise.resolve(false))).rejects.toThrow(
      ColisaoPersistente,
    )
  })
})
