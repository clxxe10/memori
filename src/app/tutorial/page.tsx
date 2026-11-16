'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TutorialPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/home')
  }, [router])

  return null
}
