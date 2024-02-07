import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "hanc blog",
  description: "hanc f2e tech blog",
  themeConfig: {
    // siteTitle: false,
    nav: [],
    sidebar: [],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
