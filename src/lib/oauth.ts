import { createClient } from '@/lib/supabase/client'

export type OAuthProvider = 'google' | 'kakao' | 'apple'

const NATIVE_REDIRECT = 'com.oneidea.memori://auth/callback'

/**
 * Start OAuth for web or native Capacitor.
 * - Native: custom URL scheme redirect + Browser.open (PKCE stays in WebView)
 * - Web: normal redirect to /auth/callback
 */
export async function signInWithProvider(provider: OAuthProvider): Promise<void> {
  const supabase = createClient()

  const { Capacitor } = await import('@capacitor/core')
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform()

  const options: {
    redirectTo: string
    skipBrowserRedirect?: boolean
    scopes?: string
  } = {
    redirectTo: isNative
      ? NATIVE_REDIRECT
      : `${window.location.origin}/auth/callback`,
  }

  if (isNative) {
    options.skipBrowserRedirect = true
  }

  if (provider === 'kakao') {
    options.scopes = 'profile_nickname profile_image'
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options,
  })

  if (error) {
    throw error
  }

  if (isNative) {
    if (!data?.url) {
      throw new Error('OAuth URL을 받지 못했어요')
    }
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url: data.url })
  }
  // Web: Supabase redirects the page automatically when skipBrowserRedirect is unset
}
