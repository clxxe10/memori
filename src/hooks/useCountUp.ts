'use client'
import { useEffect, useState, useRef } from 'react'

export function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    const start = prevTarget.current
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + diff * eased))
      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        prevTarget.current = target
      }
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return value
}
