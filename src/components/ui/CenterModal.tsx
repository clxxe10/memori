'use client'

import type { CSSProperties, ReactNode } from 'react'
import OverlayPortal from '@/components/ui/OverlayPortal'
import { useIsDark } from '@/hooks/useIsDark'
import {
  GLASS_BTN_PRESS_CSS,
  glassOverlayStyle,
  glassPanelStyle,
  glassSheetScrollStyle,
} from '@/lib/glassModalStyles'

type Props = {
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  /** Sticky footer (capsule buttons). Always visible below scroll body. */
  footer?: ReactNode
  /** Panel max-height when content may overflow (default 70dvh) */
  maxHeight?: string
  /** Extra panel style overrides */
  panelStyle?: CSSProperties
}

/**
 * Centered glass modal — same shell as DailyGoalModal / AlertModal.
 * Dim tap closes. No grabber. Scrollable body + fixed footer.
 */
export default function CenterModal({
  onClose,
  title,
  description,
  children,
  footer,
  maxHeight = '70dvh',
  panelStyle,
}: Props) {
  const isDark = useIsDark()

  return (
    <OverlayPortal>
      <style>{GLASS_BTN_PRESS_CSS}</style>
      <div onClick={onClose} style={glassOverlayStyle(isDark)}>
        <div
          className="glass-surface"
          onClick={e => e.stopPropagation()}
          style={{
            ...glassPanelStyle(isDark),
            position: 'relative',
            zIndex: 'var(--z-overlay)' as unknown as number,
            padding: '24px 16px 16px',
            boxSizing: 'border-box',
            maxHeight,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...panelStyle,
          }}
        >
          {(title || description) && (
            <div style={{ textAlign: 'center', marginBottom: children || footer ? '16px' : 0, padding: '0 4px', flexShrink: 0 }}>
              {title && (
                <h3 style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  letterSpacing: '-0.3px',
                  color: isDark ? '#FFFFFF' : '#000000',
                  margin: 0,
                }}>
                  {title}
                </h3>
              )}
              {description && (
                <p style={{
                  fontSize: '13px',
                  lineHeight: 1.4,
                  wordBreak: 'keep-all',
                  color: isDark ? 'rgba(235,235,245,0.55)' : 'rgba(60,60,67,0.55)',
                  margin: title ? '6px 0 0' : 0,
                }}>
                  {description}
                </p>
              )}
            </div>
          )}

          {children != null && (
            <div style={{
              ...glassSheetScrollStyle(),
              marginBottom: footer ? 0 : undefined,
            }}>
              {children}
            </div>
          )}

          {footer != null && (
            <div style={{ flexShrink: 0, paddingTop: children ? '12px' : 0 }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </OverlayPortal>
  )
}

/** Selectable option row for CenterModal lists (theme / language / report). */
export function ModalOptionRow({
  selected,
  onClick,
  children,
  check,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  check?: ReactNode
}) {
  const isDark = useIsDark()
  return (
    <button
      type="button"
      onClick={onClick}
      className="no-press-anim"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '44px',
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
        textAlign: 'left',
      }}
    >
      <span>{children}</span>
      {selected && (check ?? <span style={{ fontSize: '14px' }}>✓</span>)}
    </button>
  )
}

export function ModalOptionList({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {children}
    </div>
  )
}

/** Footer row: cancel | confirm capsules (AlertModal layout). */
export function ModalFooterButtons({
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  confirmDisabled,
  isDestructive,
  showCancel = true,
}: {
  cancelText?: string
  confirmText: string
  onCancel: () => void
  onConfirm: () => void
  confirmDisabled?: boolean
  isDestructive?: boolean
  showCancel?: boolean
}) {
  const isDark = useIsDark()
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {showCancel && (
        <button
          type="button"
          className="no-press-anim glass-press"
          onClick={onCancel}
          style={{
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
          }}
        >
          {cancelText ?? '취소'}
        </button>
      )}
      <button
        type="button"
        className="no-press-anim glass-press"
        onClick={onConfirm}
        disabled={confirmDisabled}
        style={{
          flex: 1,
          height: '48px',
          borderRadius: '24px',
          border: 'none',
          background: isDestructive ? '#FF3B30' : (isDark ? '#FFFFFF' : '#1C1C1E'),
          color: isDestructive ? '#FFFFFF' : (isDark ? '#1C1C1E' : '#FFFFFF'),
          fontSize: '16px',
          fontWeight: 600,
          cursor: confirmDisabled ? 'not-allowed' : 'pointer',
          padding: 0,
          opacity: confirmDisabled ? 0.5 : 1,
        }}
      >
        {confirmText}
      </button>
    </div>
  )
}
