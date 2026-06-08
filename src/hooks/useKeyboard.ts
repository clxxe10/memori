import { useEffect, useState } from 'react'

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      const visualHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.screen.height
      const diff = windowHeight - visualHeight
      if (diff > 150) {
        setKeyboardHeight(diff)
        setIsKeyboardOpen(true)
      } else {
        setKeyboardHeight(0)
        setIsKeyboardOpen(false)
      }
    }
    window.visualViewport?.addEventListener('resize', handleResize)
    window.addEventListener('resize', handleResize)
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { keyboardHeight, isKeyboardOpen }
}
