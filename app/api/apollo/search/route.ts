import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    if (!process.env.APOLLO_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Use people/search with proper parameters for Basic plan
    const response = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        api_key: process.env.APOLLO_API_KEY,  // API key in body instead of header
        q_keywords: query,
        page: 1,
        per_page: 10
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Apollo error:', data)
      return NextResponse.json(
        { error: data.error || 'Apollo search failed', details: data },
        { status: response.status }
      )
    }

    const contacts = (data.people || []).map((person: any) => ({
      id: person.id || person.email,
      name: person.name,
      title: person.title || 'No title',
      company: person.organization?.name || 'Unknown',
      email: person.email,
      linkedin_url: person.linkedin_url
    }))

    return NextResponse.json({
      success: true,
      contacts,
      total: contacts.length
    })

  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed: ' + error.message },
      { status: 500 }
    )
  }
}