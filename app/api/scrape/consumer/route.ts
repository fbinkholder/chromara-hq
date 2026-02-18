import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// Placeholder: Reddit/Twitter scraping + Claude sentiment not wired yet.
export async function POST() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // TODO: Reddit/Twitter APIs, Claude sentiment for #beautyproblems etc.
    return NextResponse.json({
      ok: true,
      message: 'Consumer insights placeholder. Add APIs to enable.',
      count: 0,
    })
  } catch (e) {
    console.error('scrape/consumer:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
