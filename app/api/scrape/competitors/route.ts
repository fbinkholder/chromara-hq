import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const COMPETITOR_URLS = [
  { name: "L'Oréal", url: 'https://www.loreal.com/en/usa/news' },
  { name: 'Estée Lauder', url: 'https://www.esteelauder.com/about-us' },
  { name: 'Shiseido', url: 'https://www.shiseido.com/us/en/about' },
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
        message: 'FIRECRAWL_API_KEY not set.',
        count: 0,
      })
    }

    let saved = 0
    for (const { name, url } of COMPETITOR_URLS) {
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
          console.warn(`Firecrawl failed for ${url}:`, data)
          continue
        }
        const markdown = data.data?.markdown || ''
        const title = data.data?.metadata?.title || `${name} - scraped`
        const description = markdown.slice(0, 1000).replace(/\n+/g, ' ').trim()
        await supabase.from('market_intelligence').insert({
          user_id: user.id,
          category: 'competitor_insight',
          title: `${name}: ${title}`,
          description: description || null,
          source_url: url,
          data: { markdown_length: markdown.length },
          relevance_score: 7,
        })
        saved++
      } catch (err) {
        console.warn(`Scrape error for ${url}:`, err)
      }
    }

    return NextResponse.json({
      ok: true,
      message: saved > 0 ? `Saved ${saved} competitor insight(s).` : 'No new insights saved.',
      count: saved,
    })
  } catch (e) {
    console.error('scrape/competitors:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
