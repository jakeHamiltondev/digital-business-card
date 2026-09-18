import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/subscription'
import type { Profile } from '@/lib/types'

const BYPASS_EMAIL = 'jh0695@gmail.com'
const DAILY_LIMIT = 20

const rateLimitMap = new Map<string, { count: number; date: string }>()

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function checkRateLimit(userId: string): boolean {
  const today = todayString()
  const entry = rateLimitMap.get(userId)
  if (!entry || entry.date !== today) {
    rateLimitMap.set(userId, { count: 1, date: today })
    return true
  }
  if (entry.count >= DAILY_LIMIT) return false
  entry.count++
  return true
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isBypass = user.email === BYPASS_EMAIL

  if (!isBypass) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData || !isPro(profileData as Profile)) {
      return NextResponse.json({ error: 'Pro feature' }, { status: 403 })
    }
  }

  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ error: 'Daily limit reached (20 polishes per day)' }, { status: 429 })
  }

  let text: string
  let context: string
  try {
    const body = await request.json()
    text = body.text
    context = body.context
    if (!text || !context) throw new Error('Missing fields')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system:
        'You are a professional resume writer. Rewrite the following text to be concise, impactful, and use strong action verbs. Keep it to 1-2 sentences per bullet point. Use metrics and specific outcomes where the original text implies them. Do not fabricate information — only enhance what was provided. Return ONLY the polished text, no explanations.',
      messages: [
        {
          role: 'user',
          content: `Context: ${context}\n\nText to polish:\n${text}`,
        },
      ],
    })

    const polished = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    return NextResponse.json({ polished })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('rate') || msg.includes('429')) {
      return NextResponse.json({ error: 'AI service rate limit reached. Try again shortly.' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Failed to polish text' }, { status: 500 })
  }
}
