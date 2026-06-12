'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'

type Plan = 'free' | 'monthly' | 'yearly'

export default function PremiumPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly')

  const plans = [
    {
      id: 'free' as Plan,
      name: '무료',
      price: '0',
      unit: '원',
      desc: '광고 포함 · 기본 기능',
      saving: null,
      badge: null,
    },
    {
      id: 'monthly' as Plan,
      name: '월간 프리미엄',
      price: '3,900',
      unit: '원/월',
      desc: '광고 제거 · 무제한 사용',
      saving: null,
      badge: null,
    },
    {
      id: 'yearly' as Plan,
      name: '연간 프리미엄',
      price: '35,000',
      unit: '원/년',
      desc: '월 2,917원 · 가장 저렴해요',
      saving: '✦ 월간 대비 25% 할인',
      badge: '🎁 2개월 무료',
    },
  ]

  const benefits = [
    { icon: '📸', text: '사진 추출 무제한', desc: '광고 없이 무제한 사용' },
    { icon: '📄', text: 'PDF 시험지 무제한', desc: '원하는 만큼 추출' },
    { icon: '🚫', text: '광고 완전 제거', desc: '방해 없이 학습' },
    { icon: '🔲', text: '홈 화면 위젯', desc: '학습 현황 · 오늘의 단어' },
  ]

  const handleSubscribe = () => {
    if (selectedPlan === 'free') {
      router.back()
      return
    }
    // RevenueCat 연동 후 실제 구독 처리
    alert(`${selectedPlan === 'monthly' ? '월간' : '연간'} 프리미엄 구독 (RevenueCat 연동 후 구현)`)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--premium-bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: '40px',
    }}>

      {/* 히어로 */}
      <div style={{
        background: 'transparent',
        padding: '52px 20px 24px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <button
          onClick={() => router.back()}
          style={{ position: 'absolute', top: '52px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <ArrowLeft size={22} color="var(--color-text-primary)" />
        </button>
        <div style={{ fontSize: '44px', marginBottom: '10px' }}>👑</div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
          Memori Premium
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
          광고 없이, 제한 없이 학습해요
        </p>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 20px 0' }}>

        {/* 플랜 카드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                borderRadius: '16px', padding: '14px 16px',
                border: selectedPlan === plan.id
                  ? '2px solid var(--color-text-primary)'
                  : '1.5px solid var(--color-border)',
                background: plan.id === 'free'
                  ? 'var(--color-surface-2)'
                  : 'var(--color-surface)',
                position: 'relative', cursor: 'pointer',
                boxShadow: selectedPlan === plan.id
                  ? '0 4px 16px rgba(0,0,0,0.08)'
                  : 'none',
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: '-10px', right: '12px',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-primary)',
                  border: '1.5px solid var(--color-text-primary)',
                  borderRadius: '20px', padding: '2px 10px',
                  fontSize: '10px', fontWeight: 800,
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {plan.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {plan.unit}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{plan.desc}</div>
              {plan.saving && (
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  {plan.saving}
                </div>
              )}

              {selectedPlan === plan.id && (
                <div style={{
                  position: 'absolute', top: '14px', right: '14px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'var(--color-text-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={12} color="var(--color-bg)" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 혜택 */}
        <div style={{ background: 'var(--color-surface)', borderRadius: '16px', padding: '16px', border: '1px solid var(--color-border)', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '12px', letterSpacing: '0.3px' }}>
            프리미엄 혜택
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {benefits.map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0',
                borderBottom: i < benefits.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <span style={{ fontSize: '20px' }}>{b.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{b.text}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>{b.desc}</div>
                </div>
                <Check size={16} color="#34C759" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleSubscribe}
            style={{
              width: '100%', height: '54px',
              background: selectedPlan === 'free' ? 'var(--color-surface-2)' : 'var(--color-text-primary)',
              color: selectedPlan === 'free' ? 'var(--color-text-secondary)' : 'var(--color-bg)',
              border: 'none', borderRadius: '16px',
              fontSize: '16px', fontWeight: 800, cursor: 'pointer',
            }}
          >
            {selectedPlan === 'free' ? '무료로 계속하기' :
             selectedPlan === 'monthly' ? '월간 구독 시작하기' :
             '👑 연간으로 시작 · 25% 할인'}
          </button>
          <button
            onClick={() => router.back()}
            style={{ width: '100%', height: '44px', background: 'none', border: 'none', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
          >
            나중에 할게요
          </button>
          <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textAlign: 'center', cursor: 'pointer' }}>
            구매 복원
          </p>
        </div>

      </div>
    </main>
  )
}
