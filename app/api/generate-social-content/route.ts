import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const platformPrompts: Record<string, string> = {
  twitter: 'Write a tweet (max 280 characters). Casual, engaging, use line breaks for impact. Return only the tweet text.',
  linkedin: 'Write a LinkedIn post: professional, thought leadership, 1–3 short paragraphs. Return only the post text.',
  tiktok: 'Write a TikTok script: hook (first line), value (main point), CTA. Format as: HOOK: ... VALUE: ... CTA: ...',
  pinterest: 'Write a Pinterest description: visual description + 3–5 keywords/hashtags. Return only the description.',
}

export async function POST(request: Request) {
  try {
    const { platform, topic, tone = 'professional' } = await request.json()
    if (!platform || !topic) {
      return NextResponse.json(
        { error: 'Missing platform or topic' },
        { status: 400 }
      )
    }
    const prompt = platformPrompts[platform.toLowerCase()]
    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid platform. Use: twitter, linkedin, tiktok, pinterest' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 503 }
      )
    }

    const anthropic = new Anthropic({ apiKey })
    const system = `You are a social media copywriter for a beauty-tech startup (Chromara). Tone: ${tone}. Generate 3 distinct variants. Return a JSON object with a single key "variants" that is an array of exactly 3 strings, e.g. {"variants": ["...", "...", "..."]}. No other text.`
    const userMessage = `Topic/theme: ${topic}\n\nTask: ${prompt}`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text =
      message.content?.find((b) => b.type === 'text')?.type === 'text'
        ? (message.content.find((b) => b.type === 'text') as { type: 'text'; text: string }).text
        : ''
    let parsed: { variants?: string[] }
    try {
      const json = text.replace(/```json?\s*/g, '').replace(/```\s*$/g, '').trim()
      parsed = JSON.parse(json)
    } catch {
      parsed = { variants: [text || 'No content generated.'] }
    }
    const variants = Array.isArray(parsed.variants) ? parsed.variants.slice(0, 3) : [text || '']

    return NextResponse.json({ variants })
  } catch (error: unknown) {
    console.error('generate-social-content error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content', details: String(error) },
      { status: 500 }
    )
  }
}
