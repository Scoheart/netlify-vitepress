import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Scoheart's Notes",
  description: "Scoheart's Development Notes",
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    }
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ]
  },
  themeConfig: {
    // Show more heading levels in the right outline
    outline: [2, 5],
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '408', link: '/408/' },
      { text: 'AI', link: '/ai/' },
      { text: 'Frontend', link: '/frontend/' },
      { text: 'Backend', link: '/backend/' },
      { text: 'Desktop', link: '/desktop/' },
      { text: 'Mobile', link: '/mobile/' },
      { text: 'Embedded', link: '/embedded/' },
      { text: 'Daily', link: '/daily/' }
    ],

    sidebar: {
      '/frontend/': [
        {
          text: 'Frontend',
          items: [
            { text: 'Overview', link: '/frontend/' },
            {
              text: 'HTML',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/frontend/01-HTML/' },
                { text: 'DOM', link: '/frontend/01-HTML/DOM/' }
              ]
            },
            {
              text: 'CSS',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/frontend/02-CSS/' },
                { text: 'CSS Coding Style', link: '/frontend/02-CSS/CSS-Coding-Style/' },
                { text: 'CSS Framework', link: '/frontend/02-CSS/CSS-Framework/' },
                { text: 'CSS Modularization', link: '/frontend/02-CSS/CSS-Modularization/' },
                { text: 'Postprocessor', link: '/frontend/02-CSS/postprocessor/' },
                { text: 'Preprocessor', link: '/frontend/02-CSS/preprocessor/' }
              ]
            },
            {
              text: 'JavaScript',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/frontend/03-JavaScript/' },
                { text: 'ECMAScript', link: '/frontend/03-JavaScript/01-ECMAScript/' },
                { text: 'JavaScript Engine', link: '/frontend/03-JavaScript/02-JavaScript-Engine/' },
                { text: 'JavaScript Runtime', link: '/frontend/03-JavaScript/03-JavaScript-Runtime/' },
                { text: 'Module System', link: '/frontend/03-JavaScript/04-JavaScript-Module-System/' },
                { text: 'JavaScript Flavours', link: '/frontend/03-JavaScript/05-JavaScript-Flavours/' },
                { text: 'Package Manager', link: '/frontend/03-JavaScript/06-JavaScript-Package-Manager/' },
                { text: 'Build Toolchain', link: '/frontend/03-JavaScript/07-Build-Toolchain/' },
                { text: 'Frontend Framework', link: '/frontend/03-JavaScript/08-Frontend-Framework/' },
                { text: 'Router', link: '/frontend/03-JavaScript/09-Router/' },
                { text: 'State Management', link: '/frontend/03-JavaScript/10-State-Management/' },
                { text: 'Meta Framework', link: '/frontend/03-JavaScript/11-Meta-Framework/' },
                { text: 'Test Tool', link: '/frontend/03-JavaScript/12-Test-Tool/' },
                { text: 'Backend Framework', link: '/frontend/03-JavaScript/13-Backend-Framework/' },
                { text: 'Mobile Framework', link: '/frontend/03-JavaScript/14-Mobile-Framework/' },
                { text: 'Desktop Framework', link: '/frontend/03-JavaScript/15-Desktop-Framework/' }
              ]
            }
          ]
        }
      ],
      '/backend/': [
        {
          text: 'Backend',
          items: [
            { text: 'Overview', link: '/backend/' }
          ]
        }
      ],
      '/ai/': [
        {
          text: 'AI',
          items: [
            { text: 'Overview', link: '/ai/' },
            { text: 'MCP', link: '/ai/mcp' }
          ]
        }
      ],
      '/408/': [
        {
          text: '408',
          items: [
            { text: 'Overview', link: '/408/' }
          ]
        }
      ],
      '/desktop/': [
        {
          text: 'Desktop',
          items: [
            { text: 'Overview', link: '/desktop/' }
          ]
        }
      ],
      '/mobile/': [
        {
          text: 'Mobile',
          items: [
            { text: 'Overview', link: '/mobile/' }
          ]
        }
      ],
      '/embedded/': [
        {
          text: 'Embedded',
          items: [
            { text: 'Overview', link: '/embedded/' }
          ]
        }
      ],
      '/daily/': [
        {
          text: 'Daily Insights',
          items: [
            { text: 'Overview', link: '/daily/' },
            {
              text: '2026',
              collapsed: false,
              items: [
                {
                  text: 'January',
                  collapsed: false,
                  items: [
                    { text: '9th', link: '/daily/2026/January/9th' },
                    { text: '4th', link: '/daily/2026/January/4th' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/scoheart' },
      { icon: 'twitter', link: 'https://x.com/ScoheartT' },
      { icon: 'discord', link: 'https://discord.gg/YOUR_DISCORD' },
      { icon: 'facebook', link: 'https://facebook.com/YOUR_FACEBOOK' },
      { icon: 'instagram', link: 'https://instagram.com/YOUR_INSTAGRAM' },
      { icon: 'youtube', link: 'https://www.youtube.com/@Scoheart' },
      { icon: 'linkedin', link: 'https://linkedin.com/in/YOUR_LINKEDIN' },
      { icon: 'slack', link: 'https://YOUR_SLACK.slack.com' },
      { icon: 'mastodon', link: 'https://mastodon.social/@YOUR_MASTODON' }
    ]
  }
})
