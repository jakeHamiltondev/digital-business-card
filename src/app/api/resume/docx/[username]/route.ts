import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/subscription'
import { buildResumeDocx } from '@/lib/resume-docx'
import type { Profile, ResumeEntry } from '@/lib/types'

const BYPASS_EMAIL = 'jh0695@gmail.com'
const CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

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

  const buffer = await buildResumeDocx(profile, entries)

  const safeName = (profile.full_name ?? profile.username)
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': CONTENT_TYPE,
      'Content-Disposition': `attachment; filename="${safeName}-resume.docx"`,
    },
  })
}
