// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-auth-utils', '@nuxt/eslint', '@nuxt/test-utils/module'],

  compatibilityDate: '2026-08-05',
  devtools: { enabled: true },

  // pt-BR em tudo, inclusive no que o leitor de tela anuncia.
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      link: [{ rel: 'icon', type: 'image/png', href: '/marca/logo-appd.png' }],
    },
  },

  /*
    A fonte é auto-hospedada pelo pacote do Fontsource — nenhum CDN, nenhum pedido a
    servidor de terceiro, nenhum IP de visitante entregue ao Google. Num site que trata
    dado de saúde, buscar fonte externa é vazamento sem consentimento.

    tokens.css e base.css vêm de design-system/, que é a fonte da verdade. Não são
    copiados para cá: duplicata vira divergência.
  */
  css: [
    '@fontsource-variable/atkinson-hyperlegible-next',
    '~~/design-system/tokens.css',
    '~~/design-system/base.css',
  ],

  typescript: {
    strict: true,
    // typecheck roda no script `npm run typecheck` e no CI, não a cada build.
    typeCheck: false,
  },

  nitro: {
    preset: 'cloudflare_module',
  },
})
