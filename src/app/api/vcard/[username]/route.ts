import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVCard } from '@/lib/vcard'
import type { Profile } from '@/lib/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!data) {
    return new NextResponse('Not found', { status: 404 })
  }

  const profile = data as Profile
  let avatarBase64: string | undefined

  if (profile.avatar_url) {
    try {
      const res = await fetch(profile.avatar_url)
      if (res.ok) {
        const buffer = await res.arrayBuffer()
        avatarBase64 = Buffer.from(buffer).toString('base64')
      }
    } catch {
      // skip avatar on fetch failure
    }
  }

  const vcard = generateVCard(profile, avatarBase64)
  console.log('[vcard] raw output for', username, '\n', vcard)

  return new NextResponse(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${username}.vcf"`,
    },
  })
}
