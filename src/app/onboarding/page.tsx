'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingSlide1 from '@/components/onboarding/Slide1'
import OnboardingSlide2 from '@/components/onboarding/Slide2'
import OnboardingSlide3 from '@/components/onboarding/Slide3'
import OnboardingSlide4 from '@/components/onboarding/Slide4'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
    else handleFinish()
  }

  const handleFinish = () => {
    localStorage.setItem('onboarding_done', 'true')
    router.replace('/home')
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_done', 'true')
    router.replace('/home')
  }

  return (
    <main style={{
      position: 'fixed', inset: 0,
      background: 'var(--color-bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden',
    }}>
      {step === 1 && <OnboardingSlide1 onNext={handleNext} />}
      {step === 2 && <OnboardingSlide2 onNext={handleNext} onSkip={handleSkip} />}
      {step === 3 && <OnboardingSlide3 onNext={handleNext} onSkip={handleSkip} />}
      {step === 4 && <OnboardingSlide4 onFinish={handleFinish} />}
    </main>
  )
}
