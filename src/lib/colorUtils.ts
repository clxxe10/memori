/** Sentinel stored in localStorage when user explicitly chooses default mode */
export const MY_COLOR_DEFAULT = 'default'

// 색상이 밝은지 어두운지 판별
export function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}

// 마이컬러 위에 올라갈 텍스트 색상
export function getContrastColor(hex: string): string {
  return isLightColor(hex) ? '#1C1C1E' : '#FFFFFF'
}

export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

export function applyMyColor(color: string) {
  const rgb = hexToRgb(color)
  const contrast = getContrastColor(color)
  const root = document.documentElement
  root.style.setProperty('--color-my', color)
  root.style.setProperty('--color-my-rgb', rgb)
  root.style.setProperty('--color-my-contrast', contrast)
  root.style.setProperty('--color-my-contrast-rgb', hexToRgb(contrast))
  const isDark = root.classList.contains('dark')
  root.style.setProperty('--color-my-light', `rgba(${rgb}, ${isDark ? 0.15 : 0.08})`)
}

/** One-time: app_theme === '기본' → 시스템 + clear my color */
export function migrateLegacyDefaultTheme(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('app_theme') === '기본') {
    localStorage.setItem('app_theme', '시스템')
    localStorage.removeItem('app_my_color')
  }
}

/** Default mode: no key, empty, or sentinel 'default' */
export function isDefaultMyColor(): boolean {
  if (typeof window === 'undefined') return true
  const saved = localStorage.getItem('app_my_color')
  return saved === null || saved === '' || saved === MY_COLOR_DEFAULT
}

/** Resolved accent for current dark/light class */
export function getEffectiveMyColor(): string {
  if (typeof window === 'undefined') return '#1C1C1E'
  if (isDefaultMyColor()) {
    const isDark = document.documentElement.classList.contains('dark')
    return isDark ? '#FFFFFF' : '#1C1C1E'
  }
  return localStorage.getItem('app_my_color') || '#1C1C1E'
}

/** Apply effective my-color (+ contrast) for current theme */
export function refreshMyColor(): void {
  if (typeof window === 'undefined') return
  applyMyColor(getEffectiveMyColor())
}
