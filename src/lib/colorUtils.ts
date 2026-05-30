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
  const root = document.documentElement
  root.style.setProperty('--color-my', color)
  root.style.setProperty('--color-my-rgb', rgb)
  root.style.setProperty('--color-my-contrast', getContrastColor(color))
  const isDark = root.classList.contains('dark')
  root.style.setProperty('--color-my-light', `rgba(${rgb}, ${isDark ? 0.15 : 0.08})`)
}
