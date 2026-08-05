// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/test-utils/module'],

  compatibilityDate: '2026-08-05',
  devtools: { enabled: true },

  // pt-BR em tudo, inclusive no que o leitor de tela anuncia.
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
    },
  },

  typescript: {
    strict: true,
    // typecheck roda no script `npm run typecheck` e no CI, não a cada build.
    typeCheck: false,
  },

  nitro: {
    preset: 'cloudflare_module',
  },
})
