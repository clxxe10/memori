/** Flat B/W modal & sheet styles (no glass / gradient) */

export const modalOverlay = {
  background: 'rgba(0,0,0,0.4)',
} as const

export const modalCard = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.14)',
  borderRadius: '24px',
} as const

export const modalPrimaryBtn = {
  background: 'var(--color-text-primary)',
  color: 'var(--color-bg)',
  border: 'none',
  borderRadius: '9999px',
} as const

export const modalSecondaryBtn = {
  background: 'var(--color-surface-2)',
  color: 'var(--color-text-primary)',
  border: 'none',
  borderRadius: '9999px',
} as const

export const modalDestructiveBtn = {
  background: 'rgba(255, 59, 48, 0.12)',
  color: '#D9463A',
  border: 'none',
  borderRadius: '9999px',
} as const
