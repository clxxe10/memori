import { createClient } from '@/lib/supabase/client'
import { clearAllTabCache } from '@/lib/tabCache'

export type OAuthProvider = 'google' | 'kakao' | 'apple'

const NATIVE_REDIRECT = 'com.oneidea.memori://auth/callback'
/** HTTPS callback for App Store 1.0 binaries without App/Browser plugins */
const LEGACY_NATIVE_REDIRECT = 'https://memori-seven.vercel.app/auth/callback'

/**
 * Start OAuth for web or native Capacitor.
 * - Native (new): custom URL scheme + Browser.open
 * - Native (1.0 / no App plugin): HTTPS callback + window.location
 * - Web: normal redirect to /auth/callback
 */
export async function signInWithProvider(provider: OAuthProvider): Promise<void> {
  clearAllTabCache()
  const supabase = createClient()

  const { Capacitor } = await import('@capacitor/core')
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform()
  const hasAppPlugin = isNative && Capacitor.isPluginAvailable('App')
  const hasBrowserPlugin = isNative && Capacitor.isPluginAvailable('Browser')
  const useNativeDeepLink = hasAppPlugin && hasBrowserPlugin

  const options: {
    redirectTo: string
    skipBrowserRedirect?: boolean
    scopes?: string
  } = {
    redirectTo: useNativeDeepLink
      ? NATIVE_REDIRECT
      : isNative
        ? LEGACY_NATIVE_REDIRECT
        : `${window.location.origin}/auth/callback`,
  }

  if (useNativeDeepLink || isNative) {
    // Control navigation ourselves (Browser.open or window.location)
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

  if (!data?.url) {
    throw new Error('OAuth URL을 받지 못했어요')
  }

  if (useNativeDeepLink) {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url: data.url })
    return
  }

  if (isNative) {
    // Old binary: no App/Browser — navigate in the WebView
    window.location.href = data.url
    return
  }
  // Web: Supabase redirects when skipBrowserRedirect is unset;
  // if we set it above only for native, web uses automatic redirect.
}
