export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createClient } from '@/lib/supabase/server'
import type { Post } from '@/types/database'
import SiteHeader from '@/app/_components/site-header'
import SiteFooter from '@/app/_components/site-footer'

const F = {
  headline: 'var(--font-playfair), Georgia, serif',
  serif:    'var(--font-garamond), Georgia, serif',
  ui:       'var(--font-franklin), Helvetica Neue, sans-serif',
} as const

function formatDate(post: Pick<Post, 'published_at' | 'created_at'>) {
  return new Date(post.published_at ?? post.created_at).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) notFound()
  const post = data as Post

  // ── Related posts ───────────────────────────────────────────────────────────
  // 1. Same category (excluding current)
  let related: Post[] = []
  if (post.category_id) {
    const { data: sameCat } = await supabase
      .from('posts')
      .select('id, title, slug, published_at, created_at')
      .eq('status', 'published')
      .eq('category_id', post.category_id)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(5)
    related = (sameCat ?? []) as Post[]
  }

  // 2. Fill with latest if fewer than 5
  if (related.length < 5) {
    const { data: latest } = await supabase
      .from('posts')
      .select('id, title, slug, published_at, created_at')
      .eq('status', 'published')
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(10)
    const existingIds = new Set([...related.map((p) => p.id)])
    const fill = ((latest ?? []) as Post[]).filter((p) => !existingIds.has(p.id))
    related = [...related, ...fill].slice(0, 5)
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <SiteHeader />

      {/* Mismo ancho que el footer */}
      <div className="max-w-5xl mx-auto px-6 pb-10">

        {/* Grid: artículo + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-0 lg:gap-16 items-start">

          {/* ── Artículo ───────────────────────────────────────────────────── */}
          <div>
            {/* Back nav */}
            <nav className="flex items-center gap-3 mb-8">
              <Link
                href="/"
                className="text-[9px] tracking-[0.35em] uppercase hover:opacity-50 transition-opacity shrink-0"
                style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
              >
                ← Portada
              </Link>
              <div className="h-px flex-1 bg-[var(--color-rule)]" />
            </nav>

            {/* Article header */}
            <div className="mb-10 pb-8 border-b border-[var(--color-rule)]">
              {post.tags?.length > 0 && (
                <div className="flex gap-2 mb-5 flex-wrap">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] tracking-[0.2em] uppercase border border-[var(--color-rule)] px-2 py-0.5"
                      style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1
                className="font-bold leading-tight mb-5"
                style={{ fontFamily: F.headline, fontSize: 'clamp(2rem, 5vw, 3rem)' }}
              >
                {post.title}
              </h1>

              {post.excerpt && (
                <p
                  className="italic leading-relaxed mb-5 border-l-[3px] border-[var(--color-ink)] pl-4"
                  style={{ fontFamily: F.serif, fontSize: '1.15rem', color: 'var(--color-ink-muted)' }}
                >
                  {post.excerpt}
                </p>
              )}

              <p
                className="text-[10px] tracking-[0.28em] uppercase"
                style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
              >
                {formatDate(post)} · Generado con IA
              </p>
            </div>

            {/* Cover image */}
            {post.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full object-cover mb-10 border border-[var(--color-rule)]"
                style={{ maxHeight: '22rem' }}
              />
            )}

            {/* Article body */}
            <article className="article-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </article>

            {/* Back link */}
            <div className="mt-14 pt-7 border-t border-[var(--color-rule)]">
              <Link
                href="/"
                className="text-[10px] tracking-[0.3em] uppercase hover:opacity-50 transition-opacity"
                style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>

          {/* ── Sidebar: noticias relacionadas ─────────────────────────────── */}
          {related.length > 0 && (
            <aside
              className="
                mt-10 pt-8 border-t border-[var(--color-rule)]
                lg:mt-0 lg:pt-0 lg:border-t-0 lg:sticky lg:top-8
              "
            >
              {/* Heading */}
              <div className="mb-4">
                <p
                  className="text-[9px] tracking-[0.3em] uppercase mb-2"
                  style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
                >
                  Más noticias
                </p>
                <div className="h-px bg-[var(--color-ink)]" />
              </div>

              {/* List */}
              <ul>
                {related.map((p, i) => (
                  <li
                    key={p.id}
                    className={i > 0 ? 'border-t border-[var(--color-rule)]' : ''}
                  >
                    <Link
                      href={`/posts/${p.slug}`}
                      className="group flex flex-col gap-1.5 py-4"
                    >
                      <span
                        className="text-[9px] tracking-[0.15em] uppercase"
                        style={{ fontFamily: F.ui, color: 'var(--color-ink-muted)' }}
                      >
                        {formatDate(p)}
                      </span>
                      <span
                        className="text-sm leading-snug group-hover:opacity-50 transition-opacity"
                        style={{ fontFamily: F.headline }}
                      >
                        {p.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}

        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
