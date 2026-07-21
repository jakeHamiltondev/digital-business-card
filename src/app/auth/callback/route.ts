import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const saveUsername = searchParams.get('save')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        if (saveUsername) {
          const { data: profileToSave } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', saveUsername)
            .maybeSingle()

          if (profileToSave && profileToSave.id !== user.id) {
            await supabase
              .from('saved_cards')
              .insert({ user_id: user.id, saved_profile_id: profileToSave.id })
          }

          return NextResponse.redirect(new URL('/cards', origin))
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.full_name) {
          return NextResponse.redirect(new URL(`/${profile.username}`, origin))
        }
      }

      return NextResponse.redirect(new URL('/onboarding', origin))
    }
  }

  return NextResponse.redirect(new URL('/', origin))
}
