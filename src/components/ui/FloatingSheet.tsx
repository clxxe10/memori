'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import OverlayPortal from '@/components/ui/OverlayPortal'
import { useIsDark } from '@/hooks/useIsDark'
import {
  GLASS_BTN_PRESS_CSS,
  glassDimStyle,
  glassGrabberStyle,
  glassSheetFooterStyle,
  glassSheetScrollStyle,
  glassSurfaceStyle,
} from '@/lib/glassModalStyles'

type Props = {
  onClose: () => void
  children: ReactNode
  /** Sticky footer below scroll body */
  footer?: ReactNode
  showGrabber?: boolean
  /** Extra shell style */
  style?: CSSProperties
}

/**
 * iOS 26 floating bottom sheet (keyboard-aware via visualViewport).
 * Use for forms with text inputs. Selection UIs should use CenterModal.
 */
export default function FloatingSheet({
  onClose,
  children,
  footer,
  showGrabber = true,
  style,
}: Props) {
  const isDark = useIsDark()
  const [kbInset, setKbInset] = useState(0)
  const [vvHeight, setVvHeight] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      // Distance from visual viewport bottom to layout viewport bottom (= keyboard inset)
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKbInset(inset)
      setVvHeight(vv.height)
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  const keyboardOpen = kbInset > 0

  const shellStyle: CSSProperties = {
    position: 'fixed',
    left: '10px',
    right: '10px',
    bottom: keyboardOpen
      ? `${kbInset + 10}px`
      : 'calc(10px + env(safe-area-inset-bottom, 0px))',
    zIndex: 'var(--z-overlay)' as unknown as number,
    maxHeight: keyboardOpen && vvHeight > 0
      ? `${Math.max(200, vvHeight - 20)}px`
      : 'calc(100dvh - env(safe-area-inset-top, 0px) - 40px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '20px',
    boxSizing: 'border-box',
    ...glassSurfaceStyle(isDark, { borderRadius: '32px' }),
    animation: 'glassSheetUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) both',
    transition: 'bottom 0.2s ease, max-height 0.2s ease',
    ...style,
  }

  return (
    <OverlayPortal>
      <style>{GLASS_BTN_PRESS_CSS}</style>
      <div onClick={onClose} style={glassDimStyle(isDark)} />
      <div
        className="glass-surface"
        onClick={e => e.stopPropagation()}
        style={shellStyle}
      >
        {showGrabber && <div style={glassGrabberStyle(isDark)} />}
        <div style={glassSheetScrollStyle()}>
          {children}
        </div>
        {footer != null && (
          <div style={glassSheetFooterStyle()}>
            {footer}
          </div>
        )}
      </div>
    </OverlayPortal>
  )
}
