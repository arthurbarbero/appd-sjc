// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(
  // O Prettier manda na formatação; o ESLint fica só com as regras de código.
  prettier,
  {
    ignores: ['.nuxt', '.output', '.wrangler', 'dist', 'node_modules', 'drizzle/**'],
  },
)
