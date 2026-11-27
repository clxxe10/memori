'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

let scrollLockCount = 0
let previousOverflow = ''

function lockBodyScroll() {
  scrollLockCount += 1
  if (scrollLockCount === 1) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) {
    document.body.style.overflow = previousOverflow
    previousOverflow = ''
  }
}

type Props = {
  children: ReactNode
  /** Lock page scroll while mounted (default true) */
  lockScroll?: boolean
}

/** Renders overlays into document.body, outside page stacking contexts. */
export default function OverlayPortal({ children, lockScroll = true }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!lockScroll || !mounted) return
    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [lockScroll, mounted])

  if (!mounted) return null
  return createPortal(children, document.body)
}
