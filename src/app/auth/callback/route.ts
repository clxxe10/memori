import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      const user = data.user
      const createdAt = new Date(user.created_at).getTime()
      const lastSignIn = new Date(user.last_sign_in_at ?? user.created_at).getTime()
      const isNewUser = Math.abs(lastSignIn - createdAt) < 30000

      if (isNewUser) {
        return NextResponse.redirect(`${origin}/onboarding?step=3`)
      }
      return NextResponse.redirect(`${origin}/home`)
    }
  }

  return NextResponse.redirect(`${origin}/onboarding`)
}
