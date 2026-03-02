import Parser from 'rss-parser'
import * as cheerio from 'cheerio'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Source } from '@/types/database'

export type ScrapeResult = {
  scraped: number
  saved: number
  errors: string[]
}

type RawArticleInsert = {
  source_id: string
  title: string
  url: string
  content: string | null
  image_url: string | null
  published_at: string | null
}

const rssParser = new Parser()

async function scrapeRSS(rssUrl: string): Promise<RawArticleInsert[]> {
  const feed = await rssParser.parseURL(rssUrl)
  return feed.items.map((item) => ({
    source_id: '', // filled by caller
    title: item.title ?? '(sin título)',
    url: item.link ?? '',
    content: item.contentSnippet ?? item.content ?? null,
    image_url: item.enclosure?.url ?? null,
    published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
  }))
}

async function scrapeHTML(
  pageUrl: string,
  selector: string,
): Promise<RawArticleInsert[]> {
  const res = await fetch(pageUrl, {
    signal: AbortSignal.timeout(10_000),
    headers: { 'User-Agent': 'local-journal-bot/1.0' },
  })
  const html = await res.text()
  const $ = cheerio.load(html)
  const base = new URL(pageUrl)

  const articles: RawArticleInsert[] = []
  $(selector).each((_i, el) => {
    const a = $(el).is('a') ? $(el) : $(el).find('a').first()
    const href = a.attr('href')
    const title = a.text().trim() || $(el).text().trim()
    if (!href || !title) return
    const url = new URL(href, base).toString()
    articles.push({ source_id: '', title, url, content: null, image_url: null, published_at: null })
  })

  return articles
}

async function scrapeSource(
  source: Source,
): Promise<{ articles: RawArticleInsert[]; error?: string }> {
  try {
    let articles: RawArticleInsert[]
    if (source.rss_url) {
      articles = await scrapeRSS(source.rss_url)
    } else if (source.scrape_selector) {
      articles = await scrapeHTML(source.url, source.scrape_selector)
    } else {
      return { articles: [], error: `Source ${source.name}: no rss_url nor scrape_selector` }
    }

    // Attach source_id and filter articles with no url
    const valid = articles
      .filter((a) => a.url)
      .map((a) => ({ ...a, source_id: source.id }))

    return { articles: valid }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { articles: [], error: `Source ${source.name}: ${msg}` }
  }
}

export async function runScraper(supabase: SupabaseClient): Promise<ScrapeResult> {
  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)

  if (sourcesError) {
    return { scraped: 0, saved: 0, errors: [sourcesError.message] }
  }

  if (!sources || sources.length === 0) {
    return { scraped: 0, saved: 0, errors: [] }
  }

  const results = await Promise.allSettled(
    (sources as Source[]).map((s) => scrapeSource(s)),
  )

  const errors: string[] = []
  let scraped = 0
  let saved = 0

  for (const result of results) {
    if (result.status === 'rejected') {
      errors.push(String(result.reason))
      continue
    }

    const { articles, error } = result.value
    if (error) errors.push(error)
    if (articles.length === 0) continue

    scraped += articles.length

    const { error: upsertError } = await supabase
      .from('raw_articles')
      .upsert(articles, { onConflict: 'url', ignoreDuplicates: true })

    if (upsertError) {
      errors.push(`Upsert error: ${upsertError.message}`)
    } else {
      saved += articles.length
    }
  }

  return { scraped, saved, errors }
}
