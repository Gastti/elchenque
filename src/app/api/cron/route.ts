export const runtime = 'nodejs'

import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runScraper } from '@/lib/scraper'
import { runAIPipeline } from '@/lib/ai-pipeline'
import { runDigestPipeline } from '@/lib/digest-pipeline'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Determine the 12-hour window ending now (rounded to the hour)
  const to = new Date()
  to.setMinutes(0, 0, 0)
  const from = new Date(to.getTime() - 12 * 60 * 60 * 1000)

  // Label según el horario UTC (15hs UTC = mediodía AR, 3hs UTC = medianoche AR)
  const utcHour = to.getUTCHours()
  const label = utcHour >= 10 && utcHour <= 20 ? 'Resumen del mediodía' : 'Resumen de medianoche'

  // 1. Scrape fresh articles
  const scrapeResult = await runScraper(supabase)

  // 2. Generate individual posts from unprocessed articles
  const aiResult = await runAIPipeline(supabase)

  // 3. Generate digest for the 12-hour window
  const digestResult = await runDigestPipeline(supabase, { from, to }, label)

  return NextResponse.json({ scrape: scrapeResult, ai: aiResult, digest: digestResult })
}
