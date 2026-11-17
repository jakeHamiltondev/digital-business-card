import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/subscription'
import type { Profile } from '@/lib/types'

const BYPASS_EMAIL = 'jh0695@gmail.com'
const DAILY_LIMIT = 20

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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('feature', 'extract_colors')
      .gte('created_at', today.toISOString())

    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json({ error: 'Daily limit reached (20 color extractions per day)' }, { status: 429 })
    }
  }

  let logoUrl: string
  try {
    const body = await request.json()
    logoUrl = body.logoUrl
    if (!logoUrl) throw new Error('Missing logoUrl')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  try {
    const imgRes = await fetch(logoUrl)
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 400 })
    }
    const imgBuffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(imgBuffer).toString('base64')
    const contentType = (imgRes.headers.get('content-type') ?? 'image/png') as
      | 'image/jpeg'
      | 'image/png'
      | 'image/gif'
      | 'image/webp'

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: contentType, data: base64 },
            },
            {
              type: 'text',
              text: `Analyze this company logo and extract the two most prominent brand colors.

Return ONLY a JSON object with exactly this format, no other text:
{"primary": "#RRGGBB", "accent": "#RRGGBB"}

Rules:
- "primary" should be the dominant/main brand color (used for backgrounds, headers)
- "accent" should be the secondary brand color (used for buttons, highlights)
- If the logo only has one color, derive an accent by choosing a complementary or slightly shifted version
- Never return pure white (#ffffff) or pure black (#000000) as primary — if the logo is mostly black, pick the nearest dark brand shade; if mostly white, pick the lightest identifiable brand tint
- Always return valid 6-digit hex codes with the # prefix`,
            },
          ],
        },
      ],
    })

    const responseText = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    const jsonMatch = responseText.match(/\{[^}]+\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse color response' }, { status: 500 })
    }

    const { primary, accent } = JSON.parse(jsonMatch[0]) as { primary: string; accent: string }
    const hexPattern = /^#[0-9a-fA-F]{6}$/
    if (!hexPattern.test(primary) || !hexPattern.test(accent)) {
      return NextResponse.json({ error: 'Invalid color values returned' }, { status: 500 })
    }

    await supabase.from('ai_usage').insert({ user_id: user.id, feature: 'extract_colors' })

    return NextResponse.json({ primary: primary.toLowerCase(), accent: accent.toLowerCase() })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Color extraction failed: ${msg}` }, { status: 500 })
  }
}
