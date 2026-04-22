import { createContentLoader } from 'vitepress'

interface Post {
  title: string
  url: string
  year: number
  tags: string[]
}

declare const data: Post[]
export { data }

export default createContentLoader('blog/*.md', {
  transform(raw): Post[] {
    return raw
      .filter(({ url }) => url !== '/blog/')
      .map(({ frontmatter, url }) => ({
        title: frontmatter.title || 'Untitled',
        url,
        year: frontmatter.year || new Date().getFullYear(),
        tags: frontmatter.tag ? frontmatter.tag.split(';').map((t: string) => t.trim()) : []
      }))
      .sort((a, b) => b.year - a.year)
  }
})
