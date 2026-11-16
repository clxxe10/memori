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
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const separator = isDark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.29)'
  const confirmColor = isDestructive
    ? (isDark ? '#FF453A' : '#FF3B30')
    : (isDark ? '#0A84FF' : '#007AFF')
  const cancelColor = isDark ? '#0A84FF' : '#007AFF'
  const pressBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <style>{`
        .alert-modal-btn:active {
          background: ${pressBg} !important;
        }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '300px',
          borderRadius: '22px',
          overflow: 'hidden',
          background: isDark ? 'rgba(44,44,46,0.96)' : 'rgba(242,242,247,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'none',
          border: 'none',
          animation: 'modalEnter 0.25s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
      >
        <div style={{ padding: '24px 20px 20px', textAlign: 'center' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '-0.4px',
            color: isDark ? '#FFFFFF' : '#000000',
            margin: 0,
          }}>
            {title}
          </h3>
          {description && (
            <p style={{
              fontSize: '14px',
              lineHeight: 1.4,
              wordBreak: 'keep-all',
              color: isDark ? 'rgba(235,235,245,0.6)' : '#3C3C43',
              margin: '4px 0 0',
            }}>
              {description}
            </p>
          )}
        </div>

        <div style={{
          display: 'flex',
          borderTop: `0.5px solid ${separator}`,
        }}>
          <button
            className="no-press-anim alert-modal-btn"
            onClick={onCancel}
            style={{
              flex: 1,
              height: '50px',
              background: 'transparent',
              border: 'none',
              borderRight: `0.5px solid ${separator}`,
              borderRadius: 0,
              fontSize: '17px',
              fontWeight: 400,
              color: cancelColor,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {cancelText ?? t.common.cancel}
          </button>
          <button
            className="no-press-anim alert-modal-btn"
            onClick={onConfirm}
            style={{
              flex: 1,
              height: '50px',
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              fontSize: '17px',
              fontWeight: 600,
              color: confirmColor,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
