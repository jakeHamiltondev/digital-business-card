import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isPro } from '@/lib/subscription'
import type { Profile } from '@/lib/types'

const BYPASS_EMAIL = 'jh0695@gmail.com'

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

  let logoUrl: string
  try {
    const body = await request.json()
    logoUrl = body.logoUrl
    if (!logoUrl) throw new Error('Missing logoUrl')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const imgRes = await fetch(logoUrl)
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 400 })
    }
    const imgBlob = await imgRes.blob()

    const { removeBackground } = await import('@imgly/background-removal-node')
    const resultBlob = await removeBackground(imgBlob, { output: { format: 'image/png' } })

    const arrayBuffer = await resultBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const path = `${user.id}/logo-nobg.png`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, { upsert: true, contentType: 'image/png' })

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return NextResponse.json({ url: `${data.publicUrl}?t=${Date.now()}` })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Background removal failed: ${msg}` }, { status: 500 })
  }
}
