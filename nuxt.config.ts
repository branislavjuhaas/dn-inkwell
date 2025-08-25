// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@prisma/nuxt", "nuxt-auth-utils"],
  // Enable scalar for API documentation in nitro
  nitro: {
    experimental: {
      openAPI: true,
    },
    openAPI: {
      route: "/api/_docs/openapi.json",
      production: "prerender",
      meta: {
        title: "DN Inkwell API",
        description: "API documentation for DN Inkwell",
        version: "1.25.0.1",
      },
      ui: {
        scalar: {
          route: "/api",
        },
        swagger: false,
      },
    },
  },
  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.prisma/client/index-browser.js",
      },
    },
  },
});
