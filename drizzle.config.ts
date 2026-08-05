import { defineConfig } from 'drizzle-kit'

// Gera SQL versionado em drizzle/migrations; quem aplica é o
// `wrangler d1 migrations apply` (local ou remoto). Sem push direto no banco.
export default defineConfig({
  schema: './server/database/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
})
