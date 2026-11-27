'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '@/lib/i18n'
import { glassCoachmarkStyle, glassSurface } from '@/lib/glassModalStyles'

type Props = {
  id: string
  targetRef: RefObject<HTMLElement | null>
  text: string
  placement?: 'top' | 'bottom'
}

type Pos = { top: number; left: number; arrowLeft: number }

export default function Coachmark({ id, targetRef, text, placement = 'bottom' }: Props) {
  const { lang } = useTranslation()
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const [ready, setReady] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(`coach_${id}_done`)) return
    setActive(true)
  }, [id])

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const updatePosition = useCallback(() => {
    const target = targetRef.current
    const bubble = bubbleRef.current
    if (!target || !bubble) return false

    const rect = target.getBoundingClientRect()
    const bubbleRect = bubble.getBoundingClientRect()
    const bubbleW = bubbleRect.width
    const bubbleH = bubbleRect.height
    if (bubbleW <= 0 || bubbleH <= 0) return false

    const vw = document.documentElement.clientWidth
    const gap = 12
    const targetCenterX = rect.left + rect.width / 2

    let left = targetCenterX - bubbleW / 2
    left = Math.max(16, Math.min(left, vw - bubbleW - 16))

    const top = placement === 'bottom'
      ? rect.bottom + gap
      : rect.top - bubbleH - gap

    const arrowLeft = Math.max(16, Math.min(targetCenterX - left - 6, bubbleW - 28))

    setPos({ top, left, arrowLeft })
    setReady(true)
    return true
  }, [targetRef, placement])

  useEffect(() => {
    if (!active) return

    let cancelled = false
    let raf = 0

    const tick = () => {
      if (cancelled) return
      if (updatePosition()) return
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onResizeOrScroll = () => updatePosition()
    window.addEventListener('resize', onResizeOrScroll)
    window.addEventListener('scroll', onResizeOrScroll, true)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResizeOrScroll)
      window.removeEventListener('scroll', onResizeOrScroll, true)
    }
  }, [active, updatePosition])

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`coach_${id}_done`, '1')
    }
    setActive(false)
    setPos(null)
    setReady(false)
  }

  if (!mounted || !active) return null

  const textColor = isDark ? '#FFFFFF' : '#1C1C1E'
  const arrowBg = glassSurface(isDark)

  return createPortal(
    <>
      <style>{`
        @keyframes coachmarkIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        onClick={dismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'transparent',
          zIndex: 'var(--z-coachmark)' as unknown as number,
          visibility: ready ? 'visible' : 'hidden',
        }}
      />
      <div
        ref={bubbleRef}
        className="glass-surface"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: pos?.top ?? 0,
          left: pos?.left ?? 0,
          width: 'min(280px, calc(100vw - 32px))',
          maxWidth: 'min(280px, calc(100vw - 32px))',
          boxSizing: 'border-box',
          zIndex: 'var(--z-coachmark)' as unknown as number,
          padding: '14px 16px',
          ...glassCoachmarkStyle(isDark),
          visibility: ready ? 'visible' : 'hidden',
          animation: ready && !reduceMotion
            ? 'coachmarkIn 0.25s cubic-bezier(0.32, 0.72, 0, 1) both'
            : 'none',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            background: arrowBg,
            borderRadius: '2px',
            transform: 'rotate(45deg)',
            left: pos?.arrowLeft ?? 16,
            ...(placement === 'bottom'
              ? { top: '-6px' }
              : { bottom: '-6px' }),
          }}
        />
        <p style={{
          margin: 0,
          fontSize: '15px',
          lineHeight: 1.45,
          wordBreak: 'keep-all',
          color: textColor,
          paddingRight: '4px',
        }}>
          {text}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="button"
            className="no-press-anim"
            onClick={dismiss}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: textColor,
              cursor: 'pointer',
            }}
          >
            {lang === 'en' ? 'Got it' : '확인'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}
