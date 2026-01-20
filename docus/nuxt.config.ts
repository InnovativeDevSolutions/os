export default defineNuxtConfig({
  extends: ['docus'],
  
  site: {
    url: 'https://innovativedevsolutions.github.io'
  },

  // GitHub Pages configuration
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/os/' : '/',
    buildAssetsDir: '/_nuxt/'
  },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },

  devtools: {
    enabled: true
  },

  compatibilityDate: '2026-01-19'
})
