import type { CSSProperties } from 'react'

/** iOS 26 Liquid Glass — overlay dim */
export function glassOverlayStyle(isDark: boolean): CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
    animation: 'fadeIn 0.2s ease both',
  }
}

/** iOS 26 Liquid Glass — centered panel shell */
export function glassPanelStyle(
  isDark: boolean,
  opts?: { width?: string | number; maxWidth?: string; maxHeight?: string; overflowY?: CSSProperties['overflowY'] },
): CSSProperties {
  return {
    width: opts?.width ?? '300px',
    maxWidth: opts?.maxWidth,
    maxHeight: opts?.maxHeight,
    overflowY: opts?.overflowY,
    borderRadius: '28px',
    background: isDark ? 'rgba(30,30,32,0.72)' : 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(30px) saturate(180%)',
    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)'}`,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 20px 40px rgba(0,0,0,0.15)',
    animation: 'modalEnter 0.25s cubic-bezier(0.32, 0.72, 0, 1) both',
  }
}

/** Secondary / cancel capsule */
export function glassSecondaryBtnStyle(isDark: boolean): CSSProperties {
  return {
    flex: 1,
    height: '48px',
    borderRadius: '24px',
    border: 'none',
    background: isDark ? 'rgba(120,120,128,0.32)' : 'rgba(120,120,128,0.16)',
    color: 'var(--color-text-primary)',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
    transition: 'transform 0.15s ease',
  }
}

/** Primary / confirm capsule */
export function glassPrimaryBtnStyle(isDark: boolean, destructive = false): CSSProperties {
  if (destructive) {
    return {
      flex: 1,
      height: '48px',
      borderRadius: '24px',
      border: 'none',
      background: '#FF3B30',
      color: '#FFFFFF',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      padding: 0,
      transition: 'transform 0.15s ease',
    }
  }
  return {
    flex: 1,
    height: '48px',
    borderRadius: '24px',
    border: 'none',
    background: isDark ? '#FFFFFF' : '#1C1C1E',
    color: isDark ? '#1C1C1E' : '#FFFFFF',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
    transition: 'transform 0.15s ease',
  }
}

/** Circular stepper (− / +) — same fill as secondary */
export function glassCircleBtnStyle(isDark: boolean): CSSProperties {
  return {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: isDark ? 'rgba(120,120,128,0.32)' : 'rgba(120,120,128,0.16)',
    color: 'var(--color-text-primary)',
    fontSize: '20px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'transform 0.15s ease',
    lineHeight: 1,
  }
}

export const GLASS_BTN_PRESS_CSS = `
  .glass-press:active {
    transform: scale(0.97) !important;
  }
`

/** Dim layer for fixed-position center modals (separate from panel) */
export function glassDimStyle(isDark: boolean, zIndex = 200): CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    zIndex,
    background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.18)',
  }
}

/** Fixed centered glass panel (left/top 50% + translate) */
export function glassFixedPanelStyle(
  isDark: boolean,
  opts?: {
    width?: string
    maxWidth?: string
    maxHeight?: string
    overflowY?: CSSProperties['overflowY']
    zIndex?: number
    padding?: string
  },
): CSSProperties {
  return {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: opts?.zIndex ?? 201,
    padding: opts?.padding ?? '28px 20px 20px',
    boxSizing: 'border-box',
    ...glassPanelStyle(isDark, {
      width: opts?.width ?? 'min(340px, calc(100vw - 40px))',
      maxWidth: opts?.maxWidth,
      maxHeight: opts?.maxHeight,
      overflowY: opts?.overflowY,
    }),
    animation: 'modalEnterCentered 0.25s cubic-bezier(0.32, 0.72, 0, 1) both',
  }
}
