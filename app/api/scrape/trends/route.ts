import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

// Placeholder: Google Trends / manual sources not wired yet.
export async function POST() {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // TODO: Google Trends API or WWD/Glossy/BeautyMatter scraping
    return NextResponse.json({
      ok: true,
      message: 'Trends scrape placeholder. Add data source to enable.',
      count: 0,
    })
  } catch (e) {
    console.error('scrape/trends:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
