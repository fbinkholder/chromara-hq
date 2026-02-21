import { NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

const FIRECRAWL_SEARCH = 'https://api.firecrawl.dev/v1/search'
const SEO_QUERIES = [
  'beauty tech innovation 2024',
  'personalized makeup AI',
  'clean beauty skincare trends',
]

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
        message: 'FIRECRAWL_API_KEY not set. Add it to .env.local for SEO scrape.',
        count: 0,
      })
    }

    let db = supabase
    try {
      db = createAdminSupabase()
    } catch {}

    // Log scrape start
    const { data: activity } = await db.from('agent_activity').insert({
      user_id: user.id,
      agent_name: 'Market Intel: SEO Keywords',
      status: 'running',
    }).select('id').single()
    activityId = activity?.id ?? null

    let saved = 0
    for (const query of SEO_QUERIES) {
      try {
        const res = await fetch(FIRECRAWL_SEARCH, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            query,
            limit: 3,
            scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          console.warn(`Firecrawl SEO search failed for "${query}":`, data)
          continue
        }
        const raw = data.data
        const results = Array.isArray(raw) ? raw : (data.data?.web || [])
        for (const r of results) {
          const title = r.title || r.metadata?.title || query
          const desc = r.markdown
            ? r.markdown.slice(0, 1000).replace(/\n+/g, ' ').trim()
            : (r.description || '').slice(0, 500)
          const url = r.url || r.metadata?.sourceURL || r.metadata?.url
          const { error: insertError } = await db.from('market_intelligence').insert({
            user_id: user.id,
            category: 'seo_keyword',
            title: `SEO: ${title}`,
            description: desc || null,
            source_url: url || null,
            data: { query, markdown_length: r.markdown?.length ?? 0 },
            relevance_score: 7,
          })
          if (!insertError) saved++
        }
      } catch (err) {
        console.warn(`SEO scrape error for "${query}":`, err)
      }
    }

    if (activityId) {
      await db.from('agent_activity').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results_summary: { count: saved, message: `Saved ${saved} SEO keyword(s).` },
      }).eq('id', activityId)
    }

    return NextResponse.json({
      ok: true,
      message: saved > 0 ? `Saved ${saved} SEO keyword(s).` : 'No new SEO keywords saved.',
      count: saved,
    })
  } catch (e) {
    console.error('scrape/seo:', e)
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
