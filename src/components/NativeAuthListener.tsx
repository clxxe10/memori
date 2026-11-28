'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NATIVE_CALLBACK_PREFIX = 'com.oneidea.memori://auth/callback'

function isNewUser(user: { created_at: string; last_sign_in_at?: string | null }): boolean {
  const createdAt = new Date(user.created_at).getTime()
  const lastSignIn = new Date(user.last_sign_in_at ?? user.created_at).getTime()
  return Math.abs(lastSignIn - createdAt) < 30000
}

/**
 * Listens for OAuth deep links on native iOS/Android.
 * Skipped on old binaries without the App plugin.
 * Must exchange the code in the WebView so PKCE code_verifier is available.
 */
export default function NativeAuthListener() {
  const router = useRouter()
  const attached = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (attached.current) return

    let remove: (() => void) | undefined
    let cancelled = false

    const setup = async () => {
      const { Capacitor } = await import('@capacitor/core')
      if (!Capacitor.isNativePlatform() || cancelled) return

      // App Store 1.0 binary has no @capacitor/app — skip quietly
      if (!Capacitor.isPluginAvailable('App')) return

      attached.current = true
      const { App } = await import('@capacitor/app')
      const hasBrowser = Capacitor.isPluginAvailable('Browser')
      const Browser = hasBrowser
        ? (await import('@capacitor/browser')).Browser
        : null

      const handle = await App.addListener('appUrlOpen', async ({ url }) => {
        if (!url?.startsWith(NATIVE_CALLBACK_PREFIX)) return

        if (Browser) {
          try {
            await Browser.close()
          } catch {
            // Browser may already be closed
          }
        }

        let parsed: URL
        try {
          // URL constructor needs a standard base for custom schemes in some engines
          parsed = new URL(url.replace('com.oneidea.memori://', 'https://memori.local/'))
        } catch {
          console.error('OAuth callback URL parse failed:', url)
          return
        }

        const error = parsed.searchParams.get('error')
        const errorDescription = parsed.searchParams.get('error_description')
        if (error) {
          const msg = errorDescription || error
          sessionStorage.setItem('oauth_error', msg)
          router.replace(`/onboarding?oauth_error=${encodeURIComponent(msg)}`)
          return
        }

        const code = parsed.searchParams.get('code')
        if (!code) {
          const msg = '인증 코드를 받지 못했어요'
          sessionStorage.setItem('oauth_error', msg)
          router.replace(`/onboarding?oauth_error=${encodeURIComponent(msg)}`)
          return
        }

        try {
          const supabase = createClient()
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error('exchangeCodeForSession failed:', exchangeError)
            sessionStorage.setItem('oauth_error', exchangeError.message)
            router.replace(`/onboarding?oauth_error=${encodeURIComponent(exchangeError.message)}`)
            return
          }

          const user = data?.user
          if (user && isNewUser(user)) {
            router.replace('/onboarding?step=3')
          } else {
            router.replace('/home')
          }
        } catch (e) {
          console.error('Native OAuth handling failed:', e)
          const msg = e instanceof Error ? e.message : '로그인에 실패했어요'
          sessionStorage.setItem('oauth_error', msg)
          router.replace(`/onboarding?oauth_error=${encodeURIComponent(msg)}`)
        }
      })

      remove = () => {
        void handle.remove()
      }
    }

    void setup()

    return () => {
      cancelled = true
      remove?.()
      attached.current = false
    }
  }, [router])

  return null
}
