import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // Domínio puro roda em node; testes de componente pedem `environment: 'nuxt'`
    // por arquivo (docblock `@vitest-environment nuxt`).
    environment: 'node',
    include: ['test/**/*.{test,spec}.ts'],
  },
})
