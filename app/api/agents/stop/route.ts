import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: running, error: fetchError } = await supabase
      .from('agent_activity')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'running')
    if (fetchError) throw fetchError
    const ids = (running || []).map((r) => r.id)
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, stopped: 0, message: 'No agents were running.' })
    }
    const { error: updateError } = await supabase
      .from('agent_activity')
      .update({
        status: 'stopped',
        completed_at: new Date().toISOString(),
        results_summary: { stopped_by_user: true },
      })
      .eq('user_id', user.id)
      .eq('status', 'running')
    if (updateError) throw updateError
    return NextResponse.json({ ok: true, stopped: ids.length })
  } catch (e) {
    console.error('agents/stop:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
