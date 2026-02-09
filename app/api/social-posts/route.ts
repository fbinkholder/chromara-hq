import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')

    let q = supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true, nullsFirst: false })
    if (platform) q = q.eq('platform', platform)
    if (status) q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (e) {
    console.error('social-posts GET:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { platform, content, media_url, scheduled_for, status = 'draft' } = body
    if (!platform || !content) {
      return NextResponse.json(
        { error: 'platform and content required' },
        { status: 400 }
      )
    }
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        user_id: user.id,
        platform,
        content,
        media_url: media_url || null,
        scheduled_for: scheduled_for || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error('social-posts POST:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }
    const allowed = ['platform', 'content', 'media_url', 'scheduled_for', 'status']
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const k of allowed) {
      if (updates[k] !== undefined) payload[k] = updates[k]
    }
    const { data, error } = await supabase
      .from('social_posts')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error('social-posts PATCH:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('social-posts DELETE:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
