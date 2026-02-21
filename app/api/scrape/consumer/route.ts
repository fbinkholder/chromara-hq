import { NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

const CONSUMER_URLS = [
  { name: 'Reddit r/beauty', url: 'https://old.reddit.com/r/beauty/' },
  { name: 'Reddit r/SkincareAddiction', url: 'https://old.reddit.com/r/SkincareAddiction/' },
  { name: 'Reddit r/MakeupAddiction', url: 'https://old.reddit.com/r/MakeupAddiction/' },
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
        message: 'FIRECRAWL_API_KEY not set. Add it to .env.local for Consumer scrape.',
        count: 0,
      })
    }

    let db = supabase
    try {
      db = createAdminSupabase()
    } catch {}

    const { data: activity } = await db.from('agent_activity').insert({
      user_id: user.id,
      agent_name: 'Market Intel: Consumer Insights',
      status: 'running',
    }).select('id').single()
    activityId = activity?.id ?? null

    let saved = 0
    for (const { name, url } of CONSUMER_URLS) {
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
          console.warn(`Firecrawl consumer failed for ${url}:`, data)
          continue
        }
        const markdown = data.data?.markdown || ''
        const title = data.data?.metadata?.title || `${name} - consumer discussions`
        const description = markdown.slice(0, 1000).replace(/\n+/g, ' ').trim()
        const { error: insertError } = await db.from('market_intelligence').insert({
          user_id: user.id,
          category: 'consumer_insight',
          title: `${name}: ${title}`,
          description: description || null,
          source_url: url,
          data: { markdown_length: markdown.length },
          relevance_score: 7,
        })
        if (insertError) {
          console.error(`Consumer insert failed for ${name}:`, insertError)
          continue
        }
        saved++
      } catch (err) {
        console.warn(`Consumer scrape error for ${url}:`, err)
      }
    }

    if (activityId) {
      await db.from('agent_activity').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results_summary: { count: saved, message: `Saved ${saved} consumer insight(s).` },
      }).eq('id', activityId)
    }

    return NextResponse.json({
      ok: true,
      message: saved > 0 ? `Saved ${saved} consumer insight(s).` : 'No new consumer insights saved.',
      count: saved,
    })
  } catch (e) {
    console.error('scrape/consumer:', e)
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
