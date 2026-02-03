import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'OdeTest Documentation',
  description: 'Comprehensive documentation for the OdeTest TypeScript application',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ],
        },
        {
          text: 'Core Concepts',
          collapsed: false,
          items: [
            { text: 'Calculator', link: '/guide/calculator' },
            { text: 'Math Utilities', link: '/guide/math-utils' },
            { text: 'Configuration', link: '/guide/configuration' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'Advanced Features', link: '/examples/advanced-features' },
            { text: 'Error Handling', link: '/examples/error-handling' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/your-username/odetest' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 OdeTest Contributors',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/your-username/odetest/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium',
      },
    },
  },

  markdown: {
    theme: 'github-dark',
    lineNumbers: true,
  },
})
