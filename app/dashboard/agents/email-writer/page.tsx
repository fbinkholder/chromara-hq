'use client'

import { useState, useEffect } from 'react'

const EMAIL_WRITER_CONTACT_KEY = 'chromara-email-writer-contact'

type EmailVariant = 'strategic' | 'founder' | 'research'

const EMAIL_TEMPLATES = {
  strategic: {
    name: 'Strategic Partnership',
    description: 'Professional, data-driven approach for enterprise contacts',
    tone: 'professional, specific, data-backed',
  },
  founder: {
    name: 'Founder Story',
    description: 'Personal narrative about building Chromara',
    tone: 'authentic, warm, passionate',
  },
  research: {
    name: 'Research Insights',
    description: 'Lead with consumer pain points and data',
    tone: 'insightful, problem-focused, consultative',
  },
}

export default function EmailWriterPage() {
  const [variant, setVariant] = useState<EmailVariant>('strategic')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactTitle, setContactTitle] = useState('')
  const [customNotes, setCustomNotes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [subject, setSubject] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = sessionStorage.getItem(EMAIL_WRITER_CONTACT_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.companyName) setCompanyName(data.companyName)
      if (data.contactName) setContactName(data.contactName)
      if (data.contactTitle) setContactTitle(data.contactTitle || '')
      if (data.customNotes) setCustomNotes(data.customNotes || '')
      sessionStorage.removeItem(EMAIL_WRITER_CONTACT_KEY)
    } catch (_) {}
  }, [])

  const generateEmail = async () => {
    if (!companyName || !contactName) {
      alert('Please provide at least company name and contact name')
      return
    }

    setGenerating(true)
    setGeneratedEmail('')
    setSubject('')

    try {
      // Build the prompt for Claude
      const prompt = `You are writing a personalized outreach email for Chromara, a beauty-tech startup.

Product: NovaMirror - AI-powered foundation dispenser with facial scanning technology that creates custom foundation from 4.5 million possible shades in real-time.

Recipient Info:
- Name: ${contactName}
- Title: ${contactTitle || 'Decision maker'}
- Company: ${companyName}
${customNotes ? `- Additional context: ${customNotes}` : ''}

Email Variant: ${EMAIL_TEMPLATES[variant].name}
Tone: ${EMAIL_TEMPLATES[variant].tone}

${variant === 'strategic' ? `
Focus on:
- Chromara's B2B2C infrastructure partner model (like Keurig for beauty)
- Precision micro-dosing technology
- Solving shade-matching problems (affects significant portion of consumers)
- Reducing inventory waste from unsold products
- 4.5 million possible shades vs traditional 40-50 SKUs
` : ''}

${variant === 'founder' ? `
Focus on:
- Personal story of Faith (founder/CEO) building revolutionary tech
- Passion for solving real beauty industry problems
- Human warmth combined with cutting-edge technology
- Vision for the future of personalized beauty
` : ''}

${variant === 'research' ? `
Focus on:
- Consumer pain points: foundation shade-matching difficulties
- Industry problem: massive inventory waste
- Data on market opportunity
- How Chromara solves these problems with precision technology
` : ''}

Write a compelling email that:
1. Is 150-200 words max
2. Has a specific, compelling subject line
3. Includes 1-2 concrete data points or specific claims
4. Ends with a clear, low-friction call to action
5. Feels authentic and professional, not salesy
6. Addresses ${contactName} by name

Format your response as:
SUBJECT: [subject line]

EMAIL:
[email body]`

      // Simulate Claude API call
      // In production, this would call the actual Claude API
      await new Promise(resolve => setTimeout(resolve, 2000))

      const demoSubject = `${companyName} x Chromara: The Future of Foundation`
      const demoEmail = `Hi ${contactName},

I'm Faith, founder of Chromara. We've developed NovaMirror—an AI-powered foundation dispenser that creates custom foundation from 4.5 million possible shades using facial scanning and precision micro-dosing.

${variant === 'strategic' ? `
For ${companyName}, this could mean:
• Moving from 40-50 SKUs to unlimited personalization
• Eliminating waste from unsold inventory
• Solving shade-matching issues that affect a significant portion of your customers

We operate as an infrastructure partner (think Keurig for beauty)—you provide the base formula, we handle the personalized manufacturing and delivery.
` : variant === 'founder' ? `
After seeing how many people struggle to find their perfect foundation match, I knew there had to be a better way. NovaMirror combines cutting-edge tech with human warmth—it's not just about precision, it's about making everyone feel seen.

I'd love to share how ${companyName} could be part of this revolution in personalized beauty.
` : `
Consumer research shows foundation shade-matching is a top frustration in beauty. Meanwhile, brands face massive inventory costs from unsold products across dozens of SKUs.

NovaMirror solves both: perfect matches for every customer, zero wasted inventory. Our technology creates 4.5 million possible shades on-demand.
`}

Would you have 15 minutes next week to explore how this could work for ${companyName}?

Best,
Faith
Founder & CEO, Chromara`

      setSubject(demoSubject)
      setGeneratedEmail(demoEmail)
    } catch (error) {
      console.error('Error generating email:', error)
      alert('Failed to generate email')
    } finally {
      setGenerating(false)
    }
  }

  const copyEmail = () => {
    const fullEmail = `Subject: ${subject}\n\n${generatedEmail}`
    navigator.clipboard.writeText(fullEmail)
    alert('Email copied to clipboard!')
  }

  const copySubject = () => {
    navigator.clipboard.writeText(subject)
  }

  const copyBody = () => {
    navigator.clipboard.writeText(generatedEmail)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Email Writer ✍️</h1>
          <p className="text-white/60 mt-1">Generate personalized emails with Claude</p>
        </div>
        <a
          href="/dashboard/agents"
          className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
        >
          ← Back to Agent
        </a>
      </div>

      {/* Email Variant Selection */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Choose Email Variant</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(EMAIL_TEMPLATES) as EmailVariant[]).map((key) => {
            const template = EMAIL_TEMPLATES[key]
            return (
              <button
                key={key}
                onClick={() => setVariant(key)}
                className={`p-4 rounded-lg text-left transition-all ${
                  variant === key
                    ? 'bg-gradient-to-r from-chromara-purple to-chromara-pink text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                <h4 className="font-semibold mb-1">{template.name}</h4>
                <p className="text-xs opacity-80">{template.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Input Form */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recipient Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Company Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., L'Oréal"
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Contact Name *</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g., Sarah"
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Contact Title</label>
            <input
              type="text"
              value={contactTitle}
              onChange={(e) => setContactTitle(e.target.value)}
              placeholder="e.g., VP of Innovation"
              className="glass-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Custom Notes (Optional)</label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g., Met at CES, interested in AI"
              className="glass-input w-full"
            />
          </div>
        </div>

        <button
          onClick={generateEmail}
          disabled={generating || !companyName || !contactName}
          className="glass-button w-full md:w-auto mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? '✨ Generating Email...' : '✨ Generate Email with Claude'}
        </button>
      </div>

      {/* Generated Email */}
      {(generatedEmail || generating) && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Generated Email</h3>
            {generatedEmail && (
              <div className="flex gap-2">
                <button
                  onClick={copyEmail}
                  className="px-4 py-2 bg-gradient-to-r from-chromara-purple to-chromara-pink rounded-lg text-white text-sm hover:shadow-glass-hover transition-all"
                >
                  📋 Copy Full Email
                </button>
              </div>
            )}
          </div>

          {generating ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-pulse">✨</div>
              <p className="text-white/60">Claude is writing your email...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-white">Subject Line</label>
                  <button
                    onClick={copySubject}
                    className="text-xs text-chromara-pink hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-white font-semibold">{subject}</p>
                </div>
              </div>

              {/* Email Body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-white">Email Body</label>
                  <button
                    onClick={copyBody}
                    className="text-xs text-chromara-pink hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <pre className="text-white whitespace-pre-wrap font-sans">{generatedEmail}</pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={generateEmail}
                  className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  🔄 Regenerate
                </button>
                <button className="glass-button">
                  📧 Send with Resend
                </button>
                <button className="glass-button">
                  ➕ Add to Queue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="glass-card p-4 bg-blue-500/10 border border-blue-500/20">
        <p className="text-sm text-white/80">
          💡 <strong>Demo Mode:</strong> This is showing demo-generated emails. In production, this will use Claude API to generate highly personalized emails based on your variant selection and recipient information.
        </p>
      </div>
    </div>
  )
}
