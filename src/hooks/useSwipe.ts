import { useRef } from 'react'

type Props = {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: Props) {
  const startX = useRef(0)
  const startY = useRef(0)

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (Math.abs(dx) < threshold) return
    if (dx < 0) onSwipeLeft?.()
    else onSwipeRight?.()
  }

  return { onTouchStart, onTouchEnd }
}
