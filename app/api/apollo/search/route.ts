import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, companies, titles } = body

    // Check if Apollo API key exists
    if (!process.env.APOLLO_API_KEY) {
      return NextResponse.json(
        { error: 'Apollo API key not configured' },
        { status: 500 }
      )
    }

    // Call Apollo.io API
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': process.env.APOLLO_API_KEY
      },
      body: JSON.stringify({
        // Search parameters
        q_keywords: query || '',
        organization_names: companies || [],
        person_titles: titles || [],
        
        // Results configuration
        page: 1,
        per_page: 25,
        
        // Only return people with verified emails
        contact_email_status: ['verified']
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Apollo API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch contacts from Apollo' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform Apollo response to our format
    const contacts = data.people?.map((person: any) => ({
      contact_name: person.name,
      title: person.title,
      email: person.email,
      company: person.organization?.name || '',
      linkedin_url: person.linkedin_url,
      // Additional data
      raw_data: {
        city: person.city,
        state: person.state,
        country: person.country,
        photo_url: person.photo_url
      }
    })) || []

    return NextResponse.json({
      success: true,
      contacts,
      total: data.pagination?.total_entries || 0
    })

  } catch (error) {
    console.error('Apollo search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}