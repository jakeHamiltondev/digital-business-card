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

  const vcard = generateVCard(data as Profile)

  return new NextResponse(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${username}.vcf"`,
    },
  })
}
