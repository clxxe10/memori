'use client'
import { useRef, useState } from 'react'

export default function PullToRefresh({
  onRefresh, children,
}: {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}) {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)
  const threshold = 70

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      pulling.current = true
    }
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current) return
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) setPullY(Math.min(dy * 0.5, threshold + 20))
  }
  const handleTouchEnd = async () => {
    if (!pulling.current) return
    pulling.current = false
    if (pullY >= threshold && !refreshing) {
      setRefreshing(true)
      setPullY(40)
      await onRefresh()
      setRefreshing(false)
    }
    setPullY(0)
    startY.current = 0
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative' }}
    >
      {(pullY > 0 || refreshing) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: `${pullY}px`, overflow: 'hidden',
          transition: pulling.current ? 'none' : 'height 0.3s ease',
        }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            border: '2px solid var(--color-border)',
            borderTop: '2px solid var(--color-text-primary)',
            animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
            opacity: Math.min(pullY / threshold, 1),
          }} />
        </div>
      )}
      <div style={{
        transform: `translateY(${pullY > 0 ? pullY : 0}px)`,
        transition: pulling.current ? 'none' : 'transform 0.3s ease',
      }}>
        {children}
      </div>
    </div>
  )
}
