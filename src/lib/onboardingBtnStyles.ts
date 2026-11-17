import type { CSSProperties } from 'react'

/** CSS variable tokens — values set on onboarding main (dark/light) */
export const onboardingDarkVars: Record<string, string> = {
  '--m-bg': '#0B0B0C',
  '--m-fg': '#FFFFFF',
  '--m-fg2': 'rgba(235,235,245,0.6)',
  '--m-fg3': 'rgba(235,235,245,0.3)',
  '--m-surface': '#1C1C1E',
  '--m-card': '#1C1C1E',
  '--m-card-top': '#2C2C2E',
  '--m-stroke': 'rgba(255,255,255,0.08)',
  '--m-btn': '#FFFFFF',
  '--m-btn-fg': '#0B0B0C',
  '--m-google-bg': '#131314',
  '--m-google-fg': '#E3E3E3',
  '--m-google-border': '#8E918F',
  '--m-apple-bg': '#FFFFFF',
  '--m-apple-fg': '#000000',
  '--m-caret': '#0A84FF',
}

export const onboardingLightVars: Record<string, string> = {
  '--m-bg': '#FFFFFF',
  '--m-fg': '#0B0B0C',
  '--m-fg2': 'rgba(60,60,67,0.6)',
  '--m-fg3': 'rgba(60,60,67,0.3)',
  '--m-surface': '#F2F2F4',
  '--m-card': '#F2F2F4',
  '--m-card-top': '#FFFFFF',
  '--m-stroke': 'rgba(0,0,0,0.08)',
  '--m-btn': '#0B0B0C',
  '--m-btn-fg': '#FFFFFF',
  '--m-google-bg': '#FFFFFF',
  '--m-google-fg': '#1F1F1F',
  '--m-google-border': '#747775',
  '--m-apple-bg': '#000000',
  '--m-apple-fg': '#FFFFFF',
  '--m-caret': '#007AFF',
}

const ctaBase = {
  width: '100%',
  height: 52,
  borderRadius: 26,
  fontSize: 17,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  boxSizing: 'border-box',
  border: 'none',
  boxShadow: 'none',
  padding: 0,
} as const satisfies CSSProperties

export function onboardingPrimaryCta(_isDark?: boolean, disabled?: boolean): CSSProperties {
  if (disabled) return onboardingDisabledCta()
  return {
    ...ctaBase,
    background: 'var(--m-btn)',
    color: 'var(--m-btn-fg)',
  }
}

export const onboardingInkCta = onboardingPrimaryCta
export const onboardingNeutralCta = onboardingPrimaryCta(false)

export function onboardingSecondaryCta(_isDark?: boolean): CSSProperties {
  return {
    ...ctaBase,
    background: 'var(--m-surface)',
    color: 'var(--m-fg)',
  }
}

export function onboardingGoogleCta(_isDark?: boolean): CSSProperties {
  return {
    ...ctaBase,
    background: 'var(--m-google-bg)',
    color: 'var(--m-google-fg)',
    border: '1px solid var(--m-google-border)',
  }
}

export const onboardingKakaoCta: CSSProperties = {
  ...ctaBase,
  background: '#FEE500',
  color: 'rgba(0,0,0,0.85)',
  border: 'none',
}

export function onboardingAppleCta(_isDark?: boolean): CSSProperties {
  return {
    ...ctaBase,
    background: 'var(--m-apple-bg)',
    color: 'var(--m-apple-fg)',
  }
}

export function onboardingDisabledCta(_isDark?: boolean): CSSProperties {
  return {
    ...ctaBase,
    background: 'var(--m-surface)',
    color: 'var(--m-fg3)',
    cursor: 'default',
  }
}

/** Kept for Slide4.tsx (not in onboarding flow) */
export function onboardingColorCta(hex: string, disabled?: boolean): CSSProperties {
  if (disabled) return onboardingDisabledCta()
  const raw = hex.replace('#', '')
  const r = parseInt(raw.substring(0, 2), 16)
  const g = parseInt(raw.substring(2, 4), 16)
  const b = parseInt(raw.substring(4, 6), 16)
  const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65
  return {
    ...ctaBase,
    background: hex,
    color: light ? '#191919' : '#FFFFFF',
  }
}

export const onboardingCtaRow: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

export function onboardingBackBtn(_isDark?: boolean): CSSProperties {
  return {
    width: 44,
    height: 44,
    borderRadius: 22,
    background: 'var(--m-surface)',
    border: 'none',
    boxShadow: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--m-fg)',
    flexShrink: 0,
    padding: 0,
  }
}

export function onboardingInput(_isDark?: boolean, focused?: boolean): CSSProperties {
  return {
    width: '100%',
    height: 56,
    padding: '0 18px',
    borderRadius: 16,
    fontSize: 17,
    fontWeight: 400,
    border: 'none',
    background: 'var(--m-surface)',
    color: 'var(--m-fg)',
    outline: 'none',
    boxShadow: focused ? 'inset 0 0 0 1.5px var(--m-fg)' : 'none',
    boxSizing: 'border-box',
  }
}

export function onboardingPageBg(_isDark?: boolean): string {
  return 'var(--m-bg)'
}

export function onboardingSurface(_isDark?: boolean): string {
  return 'var(--m-surface)'
}

export function onboardingText(_isDark?: boolean): string {
  return 'var(--m-fg)'
}

export function onboardingSecondaryText(_isDark?: boolean): string {
  return 'var(--m-fg2)'
}

export const onboardingShell: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--m-bg)',
  color: 'var(--m-fg)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo", system-ui, sans-serif',
  overflow: 'hidden',
}

export const onboardingTopBar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 44,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
  flexShrink: 0,
  boxSizing: 'content-box',
}

export const onboardingBody: CSSProperties = {
  flex: 1,
  paddingLeft: 20,
  paddingRight: 20,
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  minHeight: 0,
}

export function onboardingFooter(keyboardPad = 0): CSSProperties {
  return {
    marginTop: 'auto',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: `calc(env(safe-area-inset-bottom) + 20px + ${keyboardPad}px)`,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    flexShrink: 0,
  }
}

export const onboardingTitle: CSSProperties = {
  fontSize: 30,
  fontWeight: 700,
  lineHeight: 1.27,
  letterSpacing: '-0.6px',
  margin: 0,
  color: 'var(--m-fg)',
  whiteSpace: 'pre-line',
}

export const onboardingSubtitle: CSSProperties = {
  fontSize: 16,
  fontWeight: 400,
  lineHeight: 1.45,
  margin: 0,
  color: 'var(--m-fg2)',
}

/** Legacy progress helpers (unused in new flow; kept for Slide4) */
export function onboardingProgressTrack(_isDark?: boolean): CSSProperties {
  return {
    flex: 1,
    height: 6,
    borderRadius: 9999,
    background: 'var(--m-surface)',
    overflow: 'hidden',
  }
}

export function onboardingProgressFill(_isDark?: boolean, widthPct?: string): CSSProperties {
  return {
    width: widthPct || '0%',
    height: '100%',
    borderRadius: 9999,
    background: 'var(--m-btn)',
  }
}

export function onboardingCard(_isDark?: boolean): CSSProperties {
  return {
    background: 'var(--m-card)',
    borderRadius: 20,
    border: 'none',
    boxShadow: 'none',
    padding: 20,
  }
}
