import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * TEMPORÁRIO — tabela do spike da Fase 0, só para provar Drizzle + D1 + migrations.
 * Sai quando a change `cadastro-e-login` trouxer o schema de verdade (Fase 4).
 */
export const spikePing = sqliteTable('spike_ping', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mensagem: text('mensagem').notNull(),
  criadoEm: text('criado_em').notNull(),
})
