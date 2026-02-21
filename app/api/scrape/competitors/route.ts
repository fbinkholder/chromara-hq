import { NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

const COMPETITOR_URLS = [
  { name: "L'Oréal", url: 'https://www.loreal.com/en/usa/news' },
  { name: 'Estée Lauder', url: 'https://www.esteelauder.com/about-us' },
  { name: 'Shiseido', url: 'https://www.shiseido.com/us/en/about' },
]

const FIRECRAWL_SCRAPE = 'https://api.firecrawl.dev/v1/scrape'

export async function POST() {
  let activityId: string | null = null
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

    let db = supabase
    try {
      db = createAdminSupabase()
    } catch {}

    const { data: activity } = await db.from('agent_activity').insert({
      user_id: user.id,
      agent_name: 'Market Intel: Competitors',
      status: 'running',
    }).select('id').single()
    activityId = activity?.id ?? null

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
        const { error: insertError } = await db.from('market_intelligence').insert({
          user_id: user.id,
          category: 'competitor_insight',
          title: `${name}: ${title}`,
          description: description || null,
          source_url: url,
          data: { markdown_length: markdown.length },
          relevance_score: 7,
        })
        if (insertError) {
          console.error(`Insert failed for ${name}:`, insertError)
          continue
        }
        saved++
      } catch (err) {
        console.warn(`Scrape error for ${url}:`, err)
      }
    }

    if (activityId) {
      await db.from('agent_activity').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results_summary: { count: saved, message: `Saved ${saved} competitor insight(s).` },
      }).eq('id', activityId)
    }

    return NextResponse.json({
      ok: true,
      message: saved > 0 ? `Saved ${saved} competitor insight(s).` : 'No new insights saved.',
      count: saved,
    })
  } catch (e) {
    console.error('scrape/competitors:', e)
    if (activityId) {
      try {
        const db = createAdminSupabase()
        await db.from('agent_activity').update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: String(e),
        }).eq('id', activityId)
      } catch (_) {}
    }
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
