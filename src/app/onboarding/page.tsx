'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Slide1 from '@/components/onboarding/Slide1'
import Slide2 from '@/components/onboarding/Slide2'
import Slide3 from '@/components/onboarding/Slide3'
import Slide4 from '@/components/onboarding/Slide4'
import Slide5 from '@/components/onboarding/Slide5'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

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
      {step === 1 && <Slide1 onNext={() => setStep(2)} />}
      {step === 2 && <Slide2 onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <Slide3 onNext={() => setStep(4)} onBack={() => setStep(2)} onGoogleLogin={handleFinish} email={email} setEmail={setEmail} name={name} setName={setName} />}
      {step === 4 && <Slide4 onNext={() => setStep(5)} onBack={() => setStep(3)} email={email} name={name} />}
      {step === 5 && <Slide5 onFinish={handleFinish} />}
    </main>
  )
}
