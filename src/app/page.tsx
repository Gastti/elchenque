export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Post, Category } from '@/types/database'
import SiteHeader from '@/app/_components/site-header'

const F = {
  headline: 'var(--font-playfair), Georgia, serif',
  ui:       'var(--font-franklin), Helvetica Neue, sans-serif',
} as const

// ── Category grouping ────────────────────────────────────────────────────────

type PostWithCategory = Post & { category?: Category | null }
type CategoryGroup = { label: string; posts: PostWithCategory[] }

function groupByCategory(posts: PostWithCategory[]): CategoryGroup[] {
  const map = new Map<string, PostWithCategory[]>()

  for (const post of posts) {
    const key = post.category?.name ?? 'Sin categoría'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(post)
  }

  return [...map.entries()]
    .sort(([labelA, postsA], [labelB, postsB]) => {
      const slugA = postsA[0]?.category?.slug ?? null
      const slugB = postsB[0]?.category?.slug ?? null
      if (slugA === 'resumen-del-dia') return -1
      if (slugB === 'resumen-del-dia') return 1
      return labelA.localeCompare(labelB, 'es')
    })
    .map(([label, posts]) => ({ label, posts }))
}

// ── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: PostWithCategory }) {
  const date = new Date(post.published_at ?? post.created_at).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  })

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="flex flex-col gap-4 bg-[#f5f5f5] hover:bg-[#ebebeb] transition-colors duration-150 p-6 group"
    >
      <p className="text-[11px]" style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}>
        {date}
      </p>
      <h3
        className="font-bold leading-snug group-hover:opacity-60 transition-opacity"
        style={{ fontFamily: F.headline, fontSize: '1.25rem' }}
      >
        {post.title}
      </h3>
      {post.excerpt && (
        <p
          className="text-sm leading-relaxed flex-1 line-clamp-5"
          style={{ fontFamily: F.ui, color: 'var(--color-ink)' }}
        >
          {post.excerpt}
        </p>
      )}
      <p
        className="text-[11px] font-semibold group-hover:opacity-50 transition-opacity"
        style={{ fontFamily: F.ui }}
      >
        Leer más ›
      </p>
    </Link>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, tags, published_at, created_at, category:categories(id, name, slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const posts = (data ?? []) as unknown as PostWithCategory[]
  const categories = groupByCategory(posts)

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-6 pb-16 mt-6">

        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm" style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}>
              Sin publicaciones por el momento.
            </p>
          </div>
        ) : (
          categories.map(({ label, posts: catPosts }) => (
            <section key={label} className="mb-16">
              {/* Category header */}
              <div className="flex items-center gap-5 mb-8">
                <h2
                  className="text-2xl font-semibold lowercase shrink-0"
                  style={{ fontFamily: F.headline }}
                >
                  {label}
                </h2>
                <div className="h-px flex-1 bg-[var(--color-ink)] mt-1.5" />
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {catPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-[var(--color-rule)] flex flex-col sm:flex-row justify-between items-center gap-2">
          <p
            className="text-[9px] tracking-[0.3em] uppercase"
            style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
          >
            © {new Date().getFullYear()} Gastón Gutierrez · El Chenque
          </p>
          <p
            className="text-[9px] tracking-[0.2em] uppercase"
            style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
          >
            Artículos creados con IA, publicados sin ánimo de lucro.
          </p>
        </footer>
      </main>
    </div>
  )
}
