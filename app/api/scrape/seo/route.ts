import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// Placeholder: no Brave/SerpAPI key yet. Returns empty + optional mock row.
export async function POST() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // TODO: Brave Search API or SerpAPI - search "beauty tech innovation", "personalized makeup", "AI beauty"
    const keywords: { title: string; description: string; relevance_score: number }[] = []
    for (const row of keywords) {
      await supabase.from('market_intelligence').insert({
        user_id: user.id,
        category: 'seo_keyword',
        title: row.title,
        description: row.description,
        relevance_score: row.relevance_score,
      })
    }
    return NextResponse.json({
      ok: true,
      message: 'SEO scrape placeholder. Add Brave/SerpAPI key to enable.',
      count: 0,
    })
  } catch (e) {
    console.error('scrape/seo:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
