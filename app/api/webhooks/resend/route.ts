import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const event = await request.json()
    
    console.log('Received Resend webhook event:', event.type)

    const supabase = createClient()

    // Handle different event types
    switch (event.type) {
      case 'email.sent':
        console.log('Email sent:', event.data.email_id)
        // Track email as successfully sent
        await supabase
          .from('sent_emails')
          .update({ status: 'sent', sent_at: event.data.created_at })
          .eq('resend_id', event.data.email_id)
        break

      case 'email.delivered':
        console.log('Email delivered:', event.data.email_id)
        // Track email as delivered
        await supabase
          .from('sent_emails')
          .update({ status: 'delivered', delivered_at: new Date().toISOString() })
          .eq('resend_id', event.data.email_id)
        break

      case 'email.opened':
        console.log('Email opened:', event.data.email_id)
        // Track email open
        await supabase
          .from('sent_emails')
          .update({ 
            opened: true, 
            opened_at: new Date().toISOString()
          })
          .eq('resend_id', event.data.email_id)

        // Log individual open event
        await supabase
          .from('email_events')
          .insert({
            resend_id: event.data.email_id,
            event_type: 'opened',
            event_data: event.data,
            occurred_at: new Date().toISOString(),
          })
        break

      case 'email.clicked':
        console.log('Link clicked:', event.data.email_id)
        // Track link click
        await supabase
          .from('sent_emails')
          .update({ 
            clicked: true, 
            clicked_at: new Date().toISOString()
          })
          .eq('resend_id', event.data.email_id)

        // Log click event
        await supabase
          .from('email_events')
          .insert({
            resend_id: event.data.email_id,
            event_type: 'clicked',
            event_data: event.data,
            occurred_at: new Date().toISOString(),
          })
        break

      case 'email.bounced':
        console.log('Email bounced:', event.data.email_id)
        // Mark email as bounced
        await supabase
          .from('sent_emails')
          .update({ 
            status: 'bounced', 
            bounced_at: new Date().toISOString(),
            bounce_reason: event.data.reason 
          })
          .eq('resend_id', event.data.email_id)

        // Mark contact as invalid email
        const { data: emailRecord } = await supabase
          .from('sent_emails')
          .select('recipient_email, contact_id')
          .eq('resend_id', event.data.email_id)
          .single()

        if (emailRecord?.contact_id) {
          await supabase
            .from('outreach_contacts')
            .update({ 
              email_valid: false,
              bounce_reason: event.data.reason 
            })
            .eq('id', emailRecord.contact_id)
        }
        break

      case 'email.complained':
        console.log('Spam complaint:', event.data.email_id)
        // Mark as spam complaint
        await supabase
          .from('sent_emails')
          .update({ 
            status: 'complained', 
            complained_at: new Date().toISOString() 
          })
          .eq('resend_id', event.data.email_id)

        // Mark contact as unsubscribed
        const { data: complaintRecord } = await supabase
          .from('sent_emails')
          .select('recipient_email, contact_id')
          .eq('resend_id', event.data.email_id)
          .single()

        if (complaintRecord?.contact_id) {
          await supabase
            .from('outreach_contacts')
            .update({ 
              unsubscribed: true,
              unsubscribed_at: new Date().toISOString() 
            })
            .eq('id', complaintRecord.contact_id)
        }
        break

      default:
        console.log('Unknown event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}
