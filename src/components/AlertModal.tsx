'use client'
import { useTranslation } from '@/lib/i18n'
import { modalCard, modalDestructiveBtn, modalOverlay, modalPrimaryBtn, modalSecondaryBtn } from '@/lib/modalStyles'

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

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        ...modalOverlay,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '300px',
          ...modalCard,
          padding: '30px 24px 20px',
          textAlign: 'center' as const,
          animation: 'modalEnter 0.25s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
            {description}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%', padding: '14px',
              fontSize: '16px', fontWeight: 700,
              cursor: 'pointer',
              ...(isDestructive ? modalDestructiveBtn : modalPrimaryBtn),
            }}
          >
            {confirmText}
          </button>

          <button
            onClick={onCancel}
            style={{
              width: '100%', padding: '14px',
              fontSize: '16px', fontWeight: 600,
              cursor: 'pointer',
              ...modalSecondaryBtn,
            }}
          >
            {cancelText ?? t.common.cancel}
          </button>
        </div>
      </div>
    </div>
  )
}
