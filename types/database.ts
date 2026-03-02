// Tipos generados del schema de Supabase

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  created_at: string
}

export type Source = {
  id: string
  name: string
  url: string
  rss_url: string | null
  scrape_selector: string | null
  is_active: boolean
  created_at: string
}

export type RawArticle = {
  id: string
  source_id: string | null
  title: string
  url: string
  content: string | null
  published_at: string | null
  fetched_at: string
  processed: boolean
}

export type PostStatus = 'draft' | 'published' | 'archived'

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string // markdown
  category_id: string | null
  tags: string[]
  status: PostStatus
  ai_generated: boolean
  cover_image_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // joins opcionales
  category?: Category
}

export type PostSource = {
  post_id: string
  raw_article_id: string
}

export type AIRunLog = {
  id: string
  ran_at: string
  articles_fetched: number
  posts_generated: number
  status: 'success' | 'partial' | 'failed'
  error_message: string | null
}
