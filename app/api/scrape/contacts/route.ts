import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const FIRECRAWL_SCRAPE = 'https://api.firecrawl.dev/v1/scrape'

function extractPossibleContacts(markdown: string, domain: string): { name: string; title: string; email: string; linkedin?: string; confidence: number }[] {
  const contacts: { name: string; title: string; email: string; linkedin?: string; confidence: number }[] = []
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const emails = [...new Set(markdown.match(emailRegex) || [])].filter((e) => e.toLowerCase().endsWith(domain.replace(/^www\./, '')))
  for (const email of emails.slice(0, 10)) {
    const nameGuess = email.split('@')[0].replace(/[._0-9]+/g, ' ').trim() || 'Unknown'
    contacts.push({
      name: nameGuess,
      title: 'Contact',
      email,
      confidence: 0.5,
    })
  }
  const titleLines = markdown.match(/(?:^|\n)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[-–—]\s*(CEO|CTO|CFO|VP|Director|Manager|Head of|Founder|Chief[^.\n]+)/gm)
  if (titleLines) {
    for (const line of titleLines.slice(0, 5)) {
      const match = line.match(/^[\s\n]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[-–—]\s*(.+?)(?:\s*$|,)/)
      if (match) {
        const name = match[1].trim()
        const title = match[2].trim()
        if (!contacts.some((c) => c.name === name)) {
          contacts.push({
            name,
            title,
            email: '',
            confidence: 0.6,
          })
        }
      }
    }
  }
  return contacts.slice(0, 15)
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json().catch(() => ({}))
    const domainInput = (body.domain || body.company || '').toString().trim()
    if (!domainInput) {
      return NextResponse.json(
        { error: 'domain or company required' },
        { status: 400 }
      )
    }
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        company: domainInput,
        domain: domainInput,
        contacts: [],
        message: 'FIRECRAWL_API_KEY not set.',
      })
    }

    const domain = domainInput.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')
    const url = `https://${domain}/about` // try /about first; could also try /team, /contact
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
      const fallbackUrl = `https://${domain}`
      const fallback = await fetch(FIRECRAWL_SCRAPE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: fallbackUrl,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      })
      const fallbackData = await fallback.json()
      if (!fallback.ok || !fallbackData.success) {
        return NextResponse.json({
          ok: true,
          company: domainInput,
          domain,
          contacts: [],
          message: 'Could not scrape the URL. Try a full URL (e.g. https://company.com/team).',
        })
      }
      data.data = fallbackData.data
    }

    const markdown = data.data?.markdown || ''
    const contacts = extractPossibleContacts(markdown, domain)
    const companyName = data.data?.metadata?.title?.replace(/\s*\|\s*.*$/, '').trim() || domainInput

    await supabase.from('contact_intelligence').insert({
      user_id: user.id,
      company: companyName,
      domain,
      contacts,
      employee_count: null,
      industry: null,
    })

    return NextResponse.json({
      ok: true,
      company: companyName,
      domain,
      contacts,
      message: contacts.length > 0 ? `Found ${contacts.length} possible contact(s).` : 'No contacts extracted. Try a team/leadership page URL.',
    })
  } catch (e) {
    console.error('scrape/contacts:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
