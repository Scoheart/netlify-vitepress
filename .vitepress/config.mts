import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Scoheart's Notes",
  description: "Scoheart's Front-End Development Notes",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'HTML', link: '/front-end/01-HTML/' },
      { text: 'CSS', link: '/front-end/02-CSS/' },
      { text: 'JavaScript', link: '/front-end/03-JavaScript/' }
    ],

    sidebar: {
      '/front-end/01-HTML/': [
        {
          text: 'HTML',
          items: [
            { text: 'Overview', link: '/front-end/01-HTML/' },
            {
              text: 'DOM',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/01-HTML/DOM/' }
              ]
            }
          ]
        }
      ],
      '/front-end/02-CSS/': [
        {
          text: 'CSS',
          items: [
            { text: 'Overview', link: '/front-end/02-CSS/' },
            {
              text: 'CSS Coding Style',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/02-CSS/CSS-Coding-Style/' }
              ]
            },
            {
              text: 'CSS Framework',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/02-CSS/CSS-Framework/' }
              ]
            },
            {
              text: 'CSS Modularization',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/02-CSS/CSS-Modularization/' }
              ]
            },
            {
              text: 'Postprocessor',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/02-CSS/postprocessor/' }
              ]
            },
            {
              text: 'Preprocessor',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/02-CSS/preprocessor/' }
              ]
            }
          ]
        }
      ],
      '/front-end/03-JavaScript/': [
        {
          text: 'JavaScript',
          items: [
            { text: 'Overview', link: '/front-end/03-JavaScript/' },
            {
              text: 'ECMAScript',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/01-ECMAScript/' }
              ]
            },
            {
              text: 'JavaScript Engine',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/02-JavaScript-Engine/' }
              ]
            },
            {
              text: 'JavaScript Runtime',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/03-JavaScript-Runtime/' }
              ]
            },
            {
              text: 'Module System',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/04-JavaScript-Module-System/' }
              ]
            },
            {
              text: 'JavaScript Flavours',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/05-JavaScript-Flavours/' }
              ]
            },
            {
              text: 'Package Manager',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/06-JavaScript-Package-Manager/' }
              ]
            },
            {
              text: 'Build Toolchain',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/07-Build-Toolchain/' }
              ]
            },
            {
              text: 'Frontend Framework',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/08-Frontend-Framework/' }
              ]
            },
            {
              text: 'Router',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/09-Router/' }
              ]
            },
            {
              text: 'State Management',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/10-State-Management/' }
              ]
            },
            {
              text: 'Meta Framework',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/11-Meta-Framework/' }
              ]
            },
            {
              text: 'Test Tool',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/12-Test-Tool/' }
              ]
            },
            {
              text: 'Backend Framework',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/13-Backend-Framework/' }
              ]
            },
            {
              text: 'Mobile Framework',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/14-Mobile-Framework/' }
              ]
            },
            {
              text: 'Desktop Framework',
              collapsed: true,
              items: [
                { text: 'Overview', link: '/front-end/03-JavaScript/15-Desktop-Framework/' }
              ]
            }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/scoheart' }
    ]
  }
})
