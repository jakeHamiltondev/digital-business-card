import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/subscription'
import type { Profile } from '@/lib/types'

const BYPASS_EMAIL = 'jh0695@gmail.com'
const DAILY_LIMIT = 5

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

async function extractText(buffer: Buffer, ext: string): Promise<string> {
  if (ext === 'pdf') {
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    return result.text
  }

  if (ext === 'docx' || ext === 'doc') {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  throw new Error(`Unsupported file type: ${ext}`)
}

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isBypass = user.email === BYPASS_EMAIL
  if (!isBypass && (!profileData || !isPro(profileData as Profile))) {
    return NextResponse.json({ error: 'Pro feature' }, { status: 403 })
  }

  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: 'Daily limit reached (5 parses per day)' },
      { status: 429 },
    )
  }

  const resumeUrl = (profileData as Profile)?.resume_url
  if (!resumeUrl) {
    return NextResponse.json({ error: 'No resume uploaded' }, { status: 400 })
  }

  const ext = resumeUrl.split('.').pop()?.toLowerCase() ?? ''
  if (!['pdf', 'docx', 'doc'].includes(ext)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('resumes')
    .download(resumeUrl)

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Failed to download resume' }, { status: 500 })
  }

  let resumeText: string
  try {
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    resumeText = await extractText(buffer, ext)
  } catch {
    return NextResponse.json({ error: 'Failed to extract text from file' }, { status: 500 })
  }

  if (!resumeText.trim()) {
    return NextResponse.json({ error: 'Could not extract text from resume' }, { status: 422 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: `You are a resume parser. Extract structured data from the resume text below and return ONLY valid JSON with no markdown formatting, no code fences, no explanation. Return an object with this exact shape:
{
  "experience": [
    {
      "title": "Job Title",
      "organization": "Company Name",
      "location": "City, State or Remote",
      "start_date": "YYYY-MM" or "",
      "end_date": "YYYY-MM" or "Present" or "",
      "description": "All bullet points for this role, joined with newlines"
    }
  ],
  "education": [
    {
      "title": "Degree (e.g. B.S. Computer Science)",
      "organization": "School Name",
      "location": "City, State or Remote",
      "start_date": "YYYY-MM" or "",
      "end_date": "YYYY-MM" or "",
      "description": "Any additional details like GPA, honors, relevant coursework"
    }
  ],
  "skills": [
    {
      "title": "Skill Category (e.g. Programming, Leadership, Tools)",
      "skills_list": ["skill1", "skill2", "skill3"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "organization": "Associated org or empty string",
      "description": "Project description"
    }
  ],
  "certifications": [
    {
      "title": "Certification Name",
      "organization": "Issuing Organization",
      "end_date": "YYYY-MM or empty string for date earned"
    }
  ]
}
If a section has no entries, use an empty array. Parse dates as YYYY-MM format where possible. For "Present" or current roles, use "Present" as end_date.`,
      messages: [{ role: 'user', content: resumeText }],
    })

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    let entries: unknown
    try {
      entries = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 })
    }

    return NextResponse.json({ entries })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('rate') || msg.includes('429')) {
      return NextResponse.json(
        { error: 'AI service rate limit reached. Try again shortly.' },
        { status: 429 },
      )
    }
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}
