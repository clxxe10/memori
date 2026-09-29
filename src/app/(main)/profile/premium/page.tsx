'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, Camera, Check, FileText } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/revenuecat'

type Plan = 'free' | 'monthly' | 'yearly'

export default function PremiumPage() {
  const { t, lang } = useTranslation()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly')
  const [offerings, setOfferings] = useState<any>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const offering = await getOfferings()
        if (offering) {
          setOfferings(offering)
        }
      } catch (e) {
        console.error('Offerings 로드 실패:', e)
      }
    }
    loadOfferings()
  }, [])

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const handleSubscribe = async () => {
    if (selectedPlan === 'free') {
      router.back()
      return
    }
    if (!offerings) { alert(t.alert.preparing); return }
    setIsPurchasing(true)
    try {
      const packageType = selectedPlan === 'monthly' ? 'MONTHLY' : 'ANNUAL'
      const pkg = offerings.availablePackages.find((p: any) => p.packageType === packageType)
      if (!pkg) { alert(t.alert.preparing); return }
      const result = await purchasePackage(pkg)
      if (result) {
        alert(lang === 'en' ? 'Successfully subscribed!' : '구독이 완료됐어요!')
        router.back()
      }
    } catch (e) {
      console.error('구매 실패:', e)
    } finally {
      setIsPurchasing(false)
    }
  }

  const text = isDark ? '#FFFFFF' : '#1C1C1E'
  const selectedBorder = isDark ? '#FFFFFF' : '#1C1C1E'
  const idleBorder = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(60,60,67,0.12)'
  const radioIdle = isDark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)'
  const divider = isDark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.18)'
  const linkColor = isDark ? 'rgba(235,235,245,0.45)' : 'rgba(60,60,67,0.45)'

  const benefits = [
    { icon: Camera, title: 'AI 사진 추출 무제한', desc: '교재를 찍는 만큼 단어장이 생겨요' },
    { icon: FileText, title: 'PDF 시험지 무제한', desc: '시험 전날, 바로 뽑아서 풀어요' },
    { icon: Ban, title: '광고 없이 집중', desc: '공부 흐름이 끊기지 않아요' },
  ]

  const radio = (selected: boolean) => (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: selected ? (isDark ? '#FFFFFF' : '#1C1C1E') : 'transparent',
      border: selected ? 'none' : `1.5px solid ${radioIdle}`,
      transition: '200ms',
    }}>
      {selected && <Check size={12} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={3} />}
    </div>
  )

  return (
    <main style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', overflow: 'hidden', position: 'relative',
      background: isDark ? '#000000' : '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <style>{`.premium-cta:active:not(:disabled){transform:scale(0.98);transition:transform 80ms}`}</style>
      <div style={{
        position: 'absolute', left: -90, top: -120, width: 360, height: 360, borderRadius: '50%',
        background: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(142,142,147,0.30)',
        filter: isDark ? 'blur(80px)' : 'blur(70px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: -110, top: -60, width: 340, height: 320, borderRadius: '50%',
        background: isDark ? 'rgba(142,142,147,0.22)' : 'rgba(209,209,214,0.55)',
        filter: isDark ? 'blur(80px)' : 'blur(70px)', pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
      }}>
        <div style={{
          flexShrink: 0,
          padding: 'max(16px, env(safe-area-inset-top)) 20px 0',
        }}>
          <button
            onClick={() => router.back()}
            aria-label="닫기"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
              backdropFilter: isDark ? undefined : 'blur(20px)',
              WebkitBackdropFilter: isDark ? undefined : 'blur(20px)',
              border: isDark ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(0,0,0,0.06)',
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255,255,255,0.18)'
                : 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 3l8 8M11 3L3 11" stroke={isDark ? 'rgba(235,235,245,0.7)' : 'rgba(60,60,67,0.7)'} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 8 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 13,
              background: isDark ? '#FFFFFF' : '#1C1C1E',
              color: isDark ? '#000000' : '#FFFFFF',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: 16, boxSizing: 'border-box',
              boxShadow: isDark ? '0 10px 30px rgba(255,255,255,0.18)' : '0 10px 24px rgba(0,0,0,0.18)',
            }}>
              <span style={{ fontWeight: 800, fontSize: 30, letterSpacing: '-1px', lineHeight: 1 }}>M</span>
              <span style={{ fontWeight: 800, fontSize: 18, lineHeight: 1, marginTop: -12 }}>+</span>
            </div>

            <h1 style={{
              margin: '14px 0 0', fontWeight: 800, fontSize: 28, lineHeight: 1.2,
              letterSpacing: '-0.8px', color: text,
            }}>
              <span style={{
                backgroundImage: isDark ? 'linear-gradient(90deg,#FFFFFF,#8E8E93)' : 'linear-gradient(90deg,#000000,#8E8E93)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}>Memori+</span>로
              <br />
              끝까지 외워요
            </h1>

            <div style={{
              marginTop: 12, padding: '6px 12px', borderRadius: 9999,
              fontWeight: 600, fontSize: 14,
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)',
              border: isDark ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(0,0,0,0.06)',
              color: isDark ? '#FFFFFF' : '#1C1C1E',
            }}>
              연간 플랜이면 <span style={{ fontWeight: 800 }}>3개월 무료</span>
            </div>
          </div>

          <div style={{
            marginTop: 16, borderRadius: 22, padding: '6px 16px',
            backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            background: isDark ? 'rgba(28,28,30,0.72)' : 'rgba(255,255,255,0.72)',
            border: isDark ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(0,0,0,0.06)',
            boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : '0 8px 24px rgba(0,0,0,0.06)',
          }}>
            {benefits.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={item.title} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0',
                  borderBottom: i < benefits.length - 1 ? `0.5px solid ${divider}` : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDark ? 'rgba(255,255,255,0.14)' : '#1C1C1E',
                  }}>
                    <Icon size={20} color="#FFFFFF" strokeWidth={2} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: text }}>{item.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 400, color: isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)', marginTop: 1 }}>{item.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{
          marginTop: 'auto',
          padding: '18px 20px max(30px, env(safe-area-inset-bottom))',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div
            onClick={() => setSelectedPlan('yearly')}
            style={{
              position: 'relative', borderRadius: 22, padding: '18px 16px 16px', cursor: 'pointer',
              border: `2px solid ${selectedPlan === 'yearly' ? selectedBorder : idleBorder}`,
              background: isDark ? '#1C1C1E' : '#FFFFFF',
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.08)',
              transition: '200ms',
            }}
          >
            <div style={{
              position: 'absolute', top: -11, left: 16, padding: '4px 10px', borderRadius: 9999,
              fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
              background: isDark ? 'linear-gradient(90deg,#FFFFFF,#AEAEB2)' : 'linear-gradient(90deg,#000000,#636366)',
              color: isDark ? '#000000' : '#FFFFFF',
            }}>
              가장 인기
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {radio(selectedPlan === 'yearly')}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: text }}>연간</div>
                <div style={{ fontWeight: 400, fontSize: 13, color: text, whiteSpace: 'nowrap' }}>35,000원 / 년</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.4px', color: text, whiteSpace: 'nowrap' }}>월 2,917원</div>
                <span style={{
                  display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 9999,
                  fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
                  background: isDark ? '#FFFFFF' : '#1C1C1E',
                  color: isDark ? '#000000' : '#FFFFFF',
                }}>11,800원 절약</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setSelectedPlan('monthly')}
            style={{
              borderRadius: 18, padding: '14px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              border: `2px solid ${selectedPlan === 'monthly' ? selectedBorder : idleBorder}`,
              background: isDark ? 'rgba(28,28,30,0.8)' : 'rgba(255,255,255,0.8)',
              transition: '200ms',
            }}
          >
            {radio(selectedPlan === 'monthly')}
            <span style={{ flex: 1, fontWeight: 600, fontSize: 16, color: text }}>월간</span>
            <span style={{ fontWeight: 600, fontSize: 16, color: text, whiteSpace: 'nowrap' }}>3,900원 / 월</span>
          </div>

          <button
            className="premium-cta"
            onClick={handleSubscribe}
            disabled={isPurchasing}
            style={{
              height: 56, borderRadius: 9999, marginTop: 6, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 17,
              background: isDark ? 'linear-gradient(180deg,#FFFFFF,#C7C7CC)' : 'linear-gradient(180deg,#3A3A3C,#000000)',
              color: isDark ? '#000000' : '#FFFFFF',
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255,255,255,0.9), 0 12px 32px rgba(255,255,255,0.14)'
                : 'inset 0 1px 0 rgba(255,255,255,0.28), 0 12px 28px rgba(0,0,0,0.28)',
            }}
          >
            Memori+ 시작하기
          </button>

          <p style={{
            margin: 0, fontWeight: 400, fontSize: 12, lineHeight: 1.5, textAlign: 'center', color: linkColor,
          }}>
            {selectedPlan === 'monthly'
              ? '3,900원 매월 결제 · 언제든 해지할 수 있어요'
              : '35,000원 연 1회 결제 · 언제든 해지할 수 있어요'}
          </p>

          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14,
            fontWeight: 500, fontSize: 12, color: linkColor,
          }}>
            <span
              onClick={async () => {
                try {
                  const result = await restorePurchases()
                  if (result) {
                    alert(lang === 'en' ? 'Purchases restored!' : '구매가 복원됐어요!')
                  }
                } catch (e) {
                  console.error('복원 실패:', e)
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              구독 복원
            </span>
            <span>·</span>
            <span onClick={() => window.open('https://memori-seven.vercel.app/terms', '_blank')} style={{ cursor: 'pointer' }}>이용약관</span>
            <span>·</span>
            <span onClick={() => window.open('https://memori-seven.vercel.app/privacy', '_blank')} style={{ cursor: 'pointer' }}>개인정보처리방침</span>
          </div>
        </div>
      </div>
    </main>
  )
}
