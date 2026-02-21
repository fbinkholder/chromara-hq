import { NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

const TREND_URLS = [
  { name: 'WWD Beauty', url: 'https://wwd.com/beauty-industry-news/' },
  { name: 'Glossy Beauty', url: 'https://www.glossy.co/beauty' },
  { name: 'Beauty Matter', url: 'https://www.beautymatter.com/industry-news' },
]

const FIRECRAWL_SCRAPE = 'https://api.firecrawl.dev/v1/scrape'

export async function POST() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        message: 'FIRECRAWL_API_KEY not set. Add it to .env.local for Trends scrape.',
        count: 0,
      })
    }

    let db = supabase
    try {
      db = createAdminSupabase()
    } catch {
      // Fallback to session client if service role not configured
    }

    let saved = 0
    for (const { name, url } of TREND_URLS) {
      try {
        const res = await fetch(FIRECRAWL_SCRAPE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            url,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          console.warn(`Firecrawl trends failed for ${url}:`, data)
          continue
        }
        const markdown = data.data?.markdown || ''
        const title = data.data?.metadata?.title || `${name} - industry trends`
        const description = markdown.slice(0, 1000).replace(/\n+/g, ' ').trim()
        const { error: insertError } = await db.from('market_intelligence').insert({
          user_id: user.id,
          category: 'industry_trend',
          title: `${name}: ${title}`,
          description: description || null,
          source_url: url,
          data: { markdown_length: markdown.length },
          relevance_score: 7,
        })
        if (insertError) {
          console.error(`Trends insert failed for ${name}:`, insertError)
          continue
        }
        saved++
      } catch (err) {
        console.warn(`Trends scrape error for ${url}:`, err)
      }
    }

    return NextResponse.json({
      ok: true,
      message: saved > 0 ? `Saved ${saved} industry trend(s).` : 'No new trends saved (check URLs or Firecrawl).',
      count: saved,
    })
  } catch (e) {
    console.error('scrape/trends:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
