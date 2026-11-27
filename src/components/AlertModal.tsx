'use client'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import {
  GLASS_BTN_PRESS_CSS,
  glassOverlayStyle,
  glassPanelStyle,
  glassPrimaryBtnStyle,
  glassSecondaryBtnStyle,
} from '@/lib/glassModalStyles'

interface Props {
  title: string
  description?: string
  confirmText: string
  cancelText?: string
  isDestructive?: boolean
  /** When false, only the confirm button is shown (안내/에러용) */
  showCancel?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function AlertModal({
  title,
  description,
  confirmText,
  cancelText,
  isDestructive = false,
  showCancel = true,
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

  return (
    <div onClick={onCancel} style={glassOverlayStyle(isDark)}>
      <style>{GLASS_BTN_PRESS_CSS}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...glassPanelStyle(isDark),
          padding: '28px 16px 16px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px', padding: '0 4px' }}>
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
              color: isDark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.7)',
              margin: '6px 0 0',
            }}>
              {description}
            </p>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '0 0 0',
        }}>
          {showCancel && (
            <button
              className="no-press-anim glass-press"
              onClick={onCancel}
              style={glassSecondaryBtnStyle(isDark)}
            >
              {cancelText ?? t.common.cancel}
            </button>
          )}
          <button
            className="no-press-anim glass-press"
            onClick={onConfirm}
            style={glassPrimaryBtnStyle(isDark, isDestructive)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
