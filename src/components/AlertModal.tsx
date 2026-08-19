'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface Props {
  title: string
  description?: string
  confirmText: string
  cancelText?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function AlertModal({
  title,
  description,
  confirmText,
  cancelText,
  isDestructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') || '시스템'
    if (savedTheme === '다크') setIsDark(true)
    else if (savedTheme === '라이트') setIsDark(false)
    else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
  }, [])

  const dimBg = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(20,20,24,0.32)'
  const cardBg = isDark
    ? 'linear-gradient(165deg, rgba(70,68,80,0.45), rgba(20,18,26,0.5))'
    : 'linear-gradient(165deg, rgba(255,255,255,0.55), rgba(255,255,255,0.28))'
  const cardShadow = isDark
    ? 'inset 0 1.5px 0 rgba(255,255,255,0.18), inset 0 -1px 2px rgba(0,0,0,0.35), 0 24px 48px rgba(0,0,0,0.65)'
    : 'inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -1px 2px rgba(0,0,0,0.05), 0 24px 48px rgba(31,38,60,0.28)'
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.8)'
  const titleColor = isDark ? '#FFFFFF' : '#1C1C1E'
  const descColor = isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)'
  const destructiveColor = isDark ? '#FF6961' : '#D9463A'
  const destructiveBg = isDark ? 'rgba(255,59,48,0.16)' : 'rgba(255,59,48,0.12)'
  const cancelColor = isDark ? '#FFFFFF' : '#1C1C1E'
  const cancelBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(120,120,128,0.14)'

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: dimBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '300px',
          background: cardBg,
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: cardShadow,
          border: cardBorder,
          borderRadius: '28px',
          padding: '30px 24px 20px',
          textAlign: 'center' as const,
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: titleColor, margin: '0 0 8px' }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: '14px', color: descColor, margin: '0 0 24px', lineHeight: 1.5 }}>
            {description}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '9999px', border: 'none',
              background: isDestructive ? destructiveBg : cancelBg,
              color: isDestructive ? destructiveColor : titleColor,
              fontSize: '16px', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>

          <button
            onClick={onCancel}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '9999px', border: 'none',
              background: cancelBg,
              color: cancelColor,
              fontSize: '16px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {cancelText ?? t.common.cancel}
          </button>
        </div>
      </div>
    </div>
  )
}
