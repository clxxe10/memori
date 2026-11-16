'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Slide1 from '@/components/onboarding/Slide1'
import Slide2 from '@/components/onboarding/Slide2'
import Slide2Name from '@/components/onboarding/Slide2Name'
import Slide3 from '@/components/onboarding/Slide3'
import Slide5 from '@/components/onboarding/Slide5'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialStep = Number(searchParams.get('step')) || 1
  const [step, setStep] = useState(Math.min(initialStep, 5))
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    document.documentElement.style.setProperty('--color-my', isDark ? '#FFFFFF' : '#1C1C1E')
    document.documentElement.style.setProperty('--color-my-contrast', isDark ? '#000000' : '#FFFFFF')
  }, [])

  const handleFinish = () => {
    router.replace('/home')
  }

  return (
    <main style={{
      position: 'fixed', inset: 0,
      height: '100dvh',
      background: 'var(--color-bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes onbSlideInRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes onbSlideInLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes onbSlideInRight { from { opacity: 1; transform: none; } to { opacity: 1; transform: none; } }
          @keyframes onbSlideInLeft  { from { opacity: 1; transform: none; } to { opacity: 1; transform: none; } }
        }
      `}</style>
      <div
        key={step}
        style={{
          position: 'absolute', inset: 0,
          animation: `${direction === 'forward' ? 'onbSlideInRight' : 'onbSlideInLeft'} 0.32s cubic-bezier(0.32, 0.72, 0, 1) both`,
        }}
      >
        {step === 1 && (
          <Slide1 onNext={() => { setDirection('forward'); setStep(2) }} />
        )}
        {step === 2 && (
          <Slide2
            onNext={() => { setDirection('forward'); setStep(3) }}
            onBack={() => { setDirection('back'); setStep(1) }}
            onLogin={handleFinish}
            email={email}
            setEmail={setEmail}
            name={name}
            setName={setName}
          />
        )}
        {step === 3 && (
          <Slide2Name
            onNext={() => { setDirection('forward'); setStep(4) }}
            onBack={() => { setDirection('back'); setStep(2) }}
            name={name}
            setName={setName}
          />
        )}
        {step === 4 && (
          <Slide3
            onNext={() => { setDirection('forward'); setStep(5) }}
            onBack={() => { setDirection('back'); setStep(3) }}
          />
        )}
        {step === 5 && <Slide5 onFinish={handleFinish} />}
      </div>
    </main>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  )
}
