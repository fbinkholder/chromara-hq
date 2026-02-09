import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Helper function to send an email
export async function sendEmail({
  to,
  subject,
  body,
  replyTo = 'faith@contact.chromarabeauty.com',
}: {
  to: string
  subject: string
  body: string
  replyTo?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Faith @ Chromara <faith@contact.chromarabeauty.com>', // Update this with your verified domain
      to: [to],
      subject: subject,
      text: body,
      reply_to: replyTo,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}