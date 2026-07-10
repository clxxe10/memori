'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes memoriIconIn {
        0%   { opacity: 0; transform: scale(0.72); }
        60%  { opacity: 1; transform: scale(1.04); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes memoriFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes memoriFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes memoriBarFill {
        0%   { width: 6%; }
        55%  { width: 78%; }
        100% { width: 92%; }
      }
      .splash-icon { animation: memoriIconIn 900ms cubic-bezier(0.32,0.72,0,1) both; }
      .splash-wordmark { animation: memoriFadeUp 800ms cubic-bezier(0.32,0.72,0,1) 220ms both; }
      .splash-tagline { animation: memoriFadeUp 800ms cubic-bezier(0.32,0.72,0,1) 380ms both; }
      .splash-track { animation: memoriFadeIn 600ms ease 500ms both; }
      .splash-fill { animation: memoriBarFill 2400ms cubic-bezier(0.32,0.72,0,1) infinite; }
    `
    document.head.appendChild(style)

    const timer = setTimeout(async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        let validSession = session
        if (!session) {
          const { data } = await supabase.auth.refreshSession()
          validSession = data.session
        }
        if (validSession) {
          router.replace('/home')
        } else {
          router.replace('/onboarding')
        }
      } catch (e) {
        router.replace('/onboarding')
      }
    }, 2200)

    return () => {
      clearTimeout(timer)
      document.head.removeChild(style)
    }
  }, [router])

  return (
    <main style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* 다크모드 배경 */}
      <style>{`
        @media (prefers-color-scheme: dark) {
          .splash-bg { background: linear-gradient(165deg, #000000 0%, #0A0A0C 45%, #111114 100%) !important; }
          .splash-wordmark-text { color: #FFFFFF !important; }
          .splash-tagline-text { color: rgba(235,235,245,0.6) !important; }
          .splash-track-bg { background: rgba(235,235,245,0.18) !important; }
          .splash-fill-bar { background: #0A84FF !important; }
          .splash-icon-img { box-shadow: 0 10px 28px rgba(0,0,0,0.50) !important; }
        }
      `}</style>

      <div className="splash-bg" style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F7F9FC 45%, #F2F4F9 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '22px',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {/* 아이콘 */}
        <img
          src="/icons/icon-180.png"
          alt="Memori"
          className="splash-icon splash-icon-img"
          style={{
            width: '84px', height: '84px',
            borderRadius: '22.37%',
            boxShadow: '0 10px 28px rgba(0,0,0,0.16)',
          }}
        />

        {/* 텍스트 그룹 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <h1
            className="splash-wordmark splash-wordmark-text"
            style={{
              fontSize: '40px', fontWeight: 800,
              letterSpacing: '-0.9px', margin: 0,
              color: '#0B0B0C',
            }}
          >
            Memori
          </h1>
          <p
            className="splash-tagline splash-tagline-text"
            style={{
              fontSize: '15px', fontWeight: 500,
              letterSpacing: '-0.2px', margin: 0,
              color: 'rgba(60,60,67,0.55)',
              textAlign: 'center',
            }}
          >
            사진 한 장으로 끝내는 단어 공부
          </p>
        </div>

        {/* 로딩 바 */}
        <div
          className="splash-track splash-track-bg"
          style={{
            position: 'absolute',
            bottom: 'max(78px, calc(env(safe-area-inset-bottom) + 40px))',
            left: '50%', transform: 'translateX(-50%)',
            width: '120px', height: '3px',
            borderRadius: '9999px', overflow: 'hidden',
            background: 'rgba(60,60,67,0.12)',
          }}
        >
          <div
            className="splash-fill splash-fill-bar"
            style={{
              height: '100%', borderRadius: '9999px',
              background: '#007AFF', width: '6%',
            }}
          />
        </div>
      </div>
    </main>
  )
}
