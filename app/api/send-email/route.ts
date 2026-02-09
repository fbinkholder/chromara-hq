import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { createClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, body: emailBody, contactId } = body

    // Validate required fields
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      )
    }

    // Validate email format (inline)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    

    // Authenticate user (optional - add your auth logic here)
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Send email using Resend
    const result = await sendEmail({
      to,
      subject,
      body: emailBody,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    // Update contact in database if contactId provided
    if (contactId) {
      await supabase
        .from('outreach_contacts')
        .update({
          status: 'contacted',
          last_contact_date: new Date().toISOString(),
        })
        .eq('id', contactId)
        .eq('user_id', user.id) // Ensure user owns this contact
    }

    // Log the sent email (optional)
    await supabase.from('sent_emails').insert({
      user_id: user.id,
      recipient_email: to,
      subject,
      body: emailBody,
      resend_id: result.data?.id,
      contact_id: contactId,
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
