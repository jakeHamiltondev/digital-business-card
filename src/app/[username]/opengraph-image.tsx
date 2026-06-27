import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export const alt = 'Digital business card on Linkfol'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  const profile = data as Profile | null
  const displayName = profile?.full_name ?? `@${username}`

  let subtitle = ''
  if (profile?.title && profile?.company) {
    subtitle = `${profile.title} at ${profile.company}`
  } else if (profile?.title) {
    subtitle = profile.title
  }

  let avatarSrc: string | null = null
  if (profile?.avatar_url) {
    try {
      const res = await fetch(profile.avatar_url)
      const buffer = await res.arrayBuffer()
      const mime = res.headers.get('content-type') ?? 'image/jpeg'
      avatarSrc = `data:${mime};base64,${Buffer.from(buffer).toString('base64')}`
    } catch {
      avatarSrc = null
    }
  }

  const initial = displayName.charAt(0).toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: avatarSrc ? `url(${avatarSrc})` : '#27272a',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            marginBottom: 36,
          }}
        >
          {!avatarSrc && (
            <div
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                color: '#a1a1aa',
                display: 'flex',
              }}
            >
              {initial}
            </div>
          )}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#fafafa',
            marginBottom: subtitle ? 16 : 0,
            textAlign: 'center',
          }}
        >
          {displayName}
        </div>

        {/* Title / Company */}
        {subtitle && (
          <div
            style={{
              fontSize: 30,
              color: '#a1a1aa',
              textAlign: 'center',
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 22,
            color: '#3f3f46',
            display: 'flex',
          }}
        >
          linkfol.com
        </div>
      </div>
    ),
    { ...size },
  )
}
