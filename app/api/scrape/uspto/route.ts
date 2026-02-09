import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const PATENTSVIEW_URL = 'https://search.patentsview.org/api/v1/patent/'

const WATCHLIST = ["L'Oreal", "L'Oréal", 'Estee Lauder', 'Estée Lauder', 'Shiseido', 'Coty', 'Unilever', 'Beiersdorf']

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const apiKey = process.env.USPTO_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        message: 'USPTO_API_KEY not set.',
        count: 0,
      })
    }

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const dateStr = sixMonthsAgo.toISOString().slice(0, 10)

    let totalSaved = 0
    const seen = new Set<string>()

    for (const company of WATCHLIST) {
      try {
        const q = {
          _and: [
            { 'assignees.assignee_organization': { _contains: company } },
            { _gte: { patent_date: dateStr } },
          ],
        }
        const f = ['patent_number', 'patent_title', 'patent_date', 'assignees']
        const s = [{ patent_date: 'desc' }]
        const o = { size: 25 }
        const res = await fetch(PATENTSVIEW_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
          },
          body: JSON.stringify({ q, f, s, o }),
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          console.warn(`PatentsView error for ${company}:`, data)
          continue
        }
        const patents = data.patents || []
        for (const p of patents) {
          const id = p.patent_number || p.patent_id
          if (!id || seen.has(id)) continue
          seen.add(id)
          const assignees = p.assignees || []
          const org = assignees[0]?.assignee_organization || company
          await supabase.from('patent_filings').insert({
            user_id: user.id,
            company: org,
            patent_number: id,
            title: p.patent_title || 'Untitled',
            filing_date: p.patent_date || null,
            status: null,
            category: 'patent',
            description: null,
            source_url: `https://patents.google.com/patent/${id}`,
          })
          totalSaved++
        }
      } catch (err) {
        console.warn(`USPTO error for ${company}:`, err)
      }
    }

    return NextResponse.json({
      ok: true,
      message: totalSaved > 0 ? `Saved ${totalSaved} patent(s).` : 'No new patents in the last 6 months for watchlist companies.',
      count: totalSaved,
    })
  } catch (e) {
    console.error('scrape/uspto:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
