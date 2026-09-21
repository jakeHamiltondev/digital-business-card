import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/subscription'
import { ResumePDF } from '@/lib/resume-pdf'
import type { Profile, ResumeEntry } from '@/lib/types'

const BYPASS_EMAIL = 'jh0695@gmail.com'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle()

  const profile = profileData as Profile | null

  if (!profile) {
    return new Response('Not found', { status: 404 })
  }

  const canGenerate = isPro(profile) || profile.email === BYPASS_EMAIL
  if (!canGenerate) {
    return new Response('Pro subscription required', { status: 403 })
  }

  const { data: entriesData } = await supabase
    .from('resume_entries')
    .select('*')
    .eq('user_id', profile.id)
    .order('type', { ascending: true })
    .order('sort_order', { ascending: true })

  const entries = (entriesData ?? []) as ResumeEntry[]

  if (entries.length === 0) {
    return new Response('No resume entries', { status: 404 })
  }

  // renderToBuffer expects ReactElement<DocumentProps> — ResumePDF returns a Document as its root
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(ResumePDF, { profile, entries }) as any
  const buffer = await renderToBuffer(element)

  const safeName = (profile.full_name ?? profile.username)
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName}-resume.pdf"`,
    },
  })
}
