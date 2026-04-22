import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

// Helper to generate sidebar for install directory
function getInstallSidebar() {
  const installDir = path.resolve(__dirname, '../docs/install')
  if (!fs.existsSync(installDir)) return []

  const categories = fs.readdirSync(installDir).filter(f => 
    fs.statSync(path.join(installDir, f)).isDirectory()
  )

  return categories.map(category => {
    const categoryDir = path.join(installDir, category)
    const files = fs.readdirSync(categoryDir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const name = f.replace('.md', '')
        return {
          text: name.charAt(0).toUpperCase() + name.slice(1),
          link: `/install/${category}/${name}`
        }
      })

    return {
      text: category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      items: files
    }
  })
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  
  title: "Thinkering Logs",
  description: "Detailled record of my different arch linux & lineage os installation",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Install Guides', link: '/install/' }
    ],

    sidebar: {
      '/blog/': [
        {
          text: 'Blog',
          items: [
            { text: 'Overview', link: '/blog/' },
          ]
        }
      ],
      '/install/': [
        {
          text: 'Installation Guides',
          items: [
            { text: 'Introduction', link: '/install/' }
          ]
        },
        ...getInstallSidebar()
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ctlinker/thinkering' }
    ]
  }
})
