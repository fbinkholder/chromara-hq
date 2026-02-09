import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Check if Apollo API key exists
    if (!process.env.APOLLO_API_KEY) {
      return NextResponse.json(
        { error: 'Apollo API key not configured. Add it in Vercel Environment Variables.' },
        { status: 500 }
      )
    }

    // Call Apollo.io API
    const response = await fetch('https://api.apollo.io/v1/people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': process.env.APOLLO_API_KEY
      },
      body: JSON.stringify({
        q_keywords: query,
        page: 1,
        per_page: 25,
        contact_email_status: ['verified']
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Apollo API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contacts from Apollo. Status: ' + response.status },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform Apollo response to match Contact Finder format
    const contacts = (data.people || []).map((person: any) => ({
      id: person.id || person.email, // Use ID or email as unique identifier
      name: person.name,
      title: person.title || 'No title available',
      company: person.organization?.name || 'Unknown company',
      email: person.email,
      linkedin_url: person.linkedin_url
    }))

    console.log(`Apollo search found ${contacts.length} contacts for: "${query}"`)

    return NextResponse.json({
      success: true,
      contacts,
      total: contacts.length
    })
  } catch (error: any) {
    console.error('Apollo search error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}