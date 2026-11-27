import type { CSSProperties } from 'react'

/** Liquid Glass surface fill */
export function glassSurface(isDark: boolean): string {
  return isDark ? 'rgba(30,30,32,0.82)' : 'rgba(255,255,255,0.88)'
}

/** Liquid Glass border */
export function glassBorder(isDark: boolean): string {
  return `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)'}`
}

/** Inset highlight + outer soft shadow */
export function glassShadow(): string {
  return 'inset 0 1px 0 rgba(255,255,255,0.6), 0 20px 40px rgba(0,0,0,0.15)'
}

export function glassBlur(): Pick<CSSProperties, 'backdropFilter' | 'WebkitBackdropFilter'> {
  return {
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  }
}

/** Shared surface style (panel / sheet / toast / popover) */
export function glassSurfaceStyle(
  isDark: boolean,
  opts?: { borderRadius?: string | number },
): CSSProperties {
  return {
    background: glassSurface(isDark),
    ...glassBlur(),
    border: glassBorder(isDark),
    boxShadow: glassShadow(),
    borderRadius: opts?.borderRadius ?? '28px',
  }
}

/** Primary capsule (confirm / save) */
export function glassButtonPrimary(isDark: boolean): CSSProperties {
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

/** Secondary capsule (cancel) */
export function glassButtonSecondary(isDark: boolean): CSSProperties {
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

/** Destructive primary capsule */
export function glassDestructive(): CSSProperties {
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

/** @deprecated alias — prefer glassButtonPrimary / glassDestructive */
export function glassPrimaryBtnStyle(isDark: boolean, destructive = false): CSSProperties {
  return destructive ? glassDestructive() : glassButtonPrimary(isDark)
}

/** @deprecated alias */
export function glassSecondaryBtnStyle(isDark: boolean): CSSProperties {
  return glassButtonSecondary(isDark)
}

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

/** Dim overlay behind modals / sheets */
export function glassDimStyle(isDark: boolean, zIndex = 200): CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    zIndex,
    background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.25)',
  }
}

/** Flex-centered fullscreen overlay host */
export function glassOverlayStyle(isDark: boolean): CSSProperties {
  return {
    ...glassDimStyle(isDark, 9999),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
    animation: 'fadeIn 0.2s ease both',
  }
}

/** Centered glass panel */
export function glassPanelStyle(
  isDark: boolean,
  opts?: { width?: string | number; maxWidth?: string; maxHeight?: string; overflowY?: CSSProperties['overflowY']; borderRadius?: string },
): CSSProperties {
  return {
    width: opts?.width ?? '300px',
    maxWidth: opts?.maxWidth,
    maxHeight: opts?.maxHeight,
    overflowY: opts?.overflowY,
    ...glassSurfaceStyle(isDark, { borderRadius: opts?.borderRadius ?? '28px' }),
    animation: 'modalEnter 0.25s cubic-bezier(0.32, 0.72, 0, 1) both',
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

/**
 * iOS 26 floating sheet — inset from screen edges, all corners rounded.
 * (replaces edge-stuck bottom sheets)
 */
export function glassBottomSheetStyle(
  isDark: boolean,
  opts?: { zIndex?: number; padding?: string; maxHeight?: string },
): CSSProperties {
  return {
    position: 'fixed',
    left: '10px',
    right: '10px',
    bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
    zIndex: opts?.zIndex ?? 201,
    maxHeight: opts?.maxHeight ?? '85vh',
    overflowY: 'auto',
    padding: opts?.padding ?? '20px',
    boxSizing: 'border-box',
    ...glassSurfaceStyle(isDark, { borderRadius: '32px' }),
    animation: 'glassSheetUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) both',
  }
}

export function glassGrabberStyle(isDark: boolean): CSSProperties {
  return {
    width: '36px',
    height: '5px',
    borderRadius: '999px',
    background: isDark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)',
    margin: '0 auto 14px',
  }
}

/** Sheet title */
export function glassSheetTitleStyle(isDark: boolean): CSSProperties {
  return {
    fontSize: '17px',
    fontWeight: 700,
    letterSpacing: '-0.3px',
    color: isDark ? '#FFFFFF' : '#000000',
    margin: '0 0 6px',
  }
}

/** Sheet subtitle / description */
export function glassSheetDescStyle(isDark: boolean): CSSProperties {
  return {
    fontSize: '13px',
    fontWeight: 400,
    color: isDark ? 'rgba(235,235,245,0.55)' : 'rgba(60,60,67,0.55)',
    margin: '0 0 16px',
    lineHeight: 1.4,
  }
}

/** Selectable option row (theme / language) */
export function glassOptionRowStyle(isDark: boolean, selected: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '48px',
    padding: '0 14px',
    borderRadius: '14px',
    cursor: 'pointer',
    border: 'none',
    background: selected
      ? (isDark ? '#FFFFFF' : '#1C1C1E')
      : (isDark ? 'rgba(120,120,128,0.22)' : 'rgba(120,120,128,0.12)'),
    color: selected
      ? (isDark ? '#1C1C1E' : '#FFFFFF')
      : 'var(--color-text-primary)',
    fontSize: '15px',
    fontWeight: 600,
    boxSizing: 'border-box',
  }
}

/** Form input field */
export function glassInputStyle(isDark: boolean): CSSProperties {
  return {
    width: '100%',
    height: '46px',
    padding: '0 14px',
    fontSize: '15px',
    borderRadius: '14px',
    border: 'none',
    background: isDark ? 'rgba(120,120,128,0.22)' : 'rgba(120,120,128,0.12)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  }
}

export function glassInputLabelStyle(): CSSProperties {
  return {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
    display: 'block',
  }
}

/** Floating popover / action menu */
export function glassPopoverStyle(
  isDark: boolean,
  opts?: { width?: string; zIndex?: number },
): CSSProperties {
  return {
    position: 'fixed',
    zIndex: opts?.zIndex ?? 301,
    width: opts?.width ?? '220px',
    overflow: 'hidden',
    ...glassSurfaceStyle(isDark, { borderRadius: '18px' }),
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 12px 32px rgba(0,0,0,0.18)',
    animation: 'modalEnter 0.2s cubic-bezier(0.32, 0.72, 0, 1) both',
  }
}

export function glassPopoverItemStyle(opts?: {
  destructive?: boolean
  last?: boolean
  isDark?: boolean
}): CSSProperties {
  const divider = opts?.isDark ? 'rgba(84,84,88,0.45)' : 'rgba(60,60,67,0.18)'
  return {
    width: '100%',
    height: '44px',
    background: 'none',
    border: 'none',
    borderBottom: opts?.last ? 'none' : `0.5px solid ${divider}`,
    fontSize: '16px',
    fontWeight: 500,
    color: opts?.destructive ? '#FF3B30' : 'var(--color-text-primary)',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0 16px',
  }
}

/** Toast pill */
export function glassToastStyle(isDark: boolean): CSSProperties {
  return {
    height: '44px',
    padding: '0 16px',
    borderRadius: '22px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    ...glassSurfaceStyle(isDark, { borderRadius: '22px' }),
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 24px rgba(0,0,0,0.12)',
    animation: 'glassToastIn 0.28s cubic-bezier(0.32, 0.72, 0, 1) both',
  }
}

/** Compact glass for coachmark bubble */
export function glassCoachmarkStyle(isDark: boolean): CSSProperties {
  return {
    ...glassSurfaceStyle(isDark, { borderRadius: '18px' }),
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 24px rgba(0,0,0,0.12)',
  }
}
