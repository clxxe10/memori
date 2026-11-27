'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import {
  GLASS_BTN_PRESS_CSS,
  glassCircleBtnStyle,
  glassOverlayStyle,
  glassPanelStyle,
  glassPrimaryBtnStyle,
  glassSecondaryBtnStyle,
} from '@/lib/glassModalStyles'

const PRESETS = [10, 20, 30, 50] as const
const STEP = 5
const MIN = 5
const MAX = 200

interface Props {
  initialGoal: number | null
  onSave: (goal: number) => void | Promise<void>
  onTurnOff: () => void | Promise<void>
  onCancel: () => void
}

export default function DailyGoalModal({ initialGoal, onSave, onTurnOff, onCancel }: Props) {
  const { t } = useTranslation()
  const [isDark, setIsDark] = useState(false)
  const [value, setValue] = useState(() => {
    if (initialGoal && initialGoal >= MIN) return Math.min(MAX, initialGoal)
    return 10
  })
  const [bumpKey, setBumpKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const applyValue = useCallback((next: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, next))
    setValue(clamped)
    setBumpKey(k => k + 1)
  }, [])

  const stopHold = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current)
      holdRef.current = null
    }
  }, [])

  const startHold = useCallback((delta: number) => {
    stopHold()
    applyValue(valueRef.current + delta)
    holdRef.current = setInterval(() => {
      applyValue(valueRef.current + delta)
    }, 120)
  }, [applyValue, stopHold])

  useEffect(() => () => stopHold(), [stopHold])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await onSave(value)
    } finally {
      setSaving(false)
    }
  }

  const secondaryFill = isDark ? 'rgba(120,120,128,0.32)' : 'rgba(120,120,128,0.16)'

  return (
    <div onClick={onCancel} style={glassOverlayStyle(isDark)}>
      <style>{`
        ${GLASS_BTN_PRESS_CSS}
        @keyframes goalNumBump {
          0% { transform: scale(1); }
          40% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...glassPanelStyle(isDark),
          padding: '28px 16px 16px',
          boxSizing: 'border-box',
        }}
      >
        <h3 style={{
          fontSize: '18px', fontWeight: 600, letterSpacing: '-0.4px',
          color: isDark ? '#FFFFFF' : '#000000',
          margin: '0 0 20px', textAlign: 'center',
        }}>
          {t.home.goalModalTitle}
        </h3>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '20px', marginBottom: '6px',
        }}>
          <button
            type="button"
            className="no-press-anim glass-press"
            aria-label="decrease"
            disabled={value <= MIN}
            onPointerDown={e => { e.preventDefault(); startHold(-STEP) }}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            style={{ ...glassCircleBtnStyle(isDark), opacity: value <= MIN ? 0.4 : 1 }}
          >
            −
          </button>
          <span
            key={bumpKey}
            style={{
              fontSize: '34px',
              fontWeight: 700,
              letterSpacing: '-0.8px',
              color: isDark ? '#FFFFFF' : '#000000',
              minWidth: '72px',
              textAlign: 'center',
              display: 'inline-block',
              animation: 'goalNumBump 0.22s ease',
            }}
          >
            {value}
          </span>
          <button
            type="button"
            className="no-press-anim glass-press"
            aria-label="increase"
            disabled={value >= MAX}
            onPointerDown={e => { e.preventDefault(); startHold(STEP) }}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            style={{ ...glassCircleBtnStyle(isDark), opacity: value >= MAX ? 0.4 : 1 }}
          >
            +
          </button>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: isDark ? 'rgba(235,235,245,0.45)' : 'rgba(60,60,67,0.55)',
          margin: '0 0 16px',
        }}>
          {t.home.goalUnit}
        </p>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: '8px',
          marginBottom: initialGoal != null && initialGoal > 0 ? '12px' : '20px',
        }}>
          {PRESETS.map(n => {
            const active = value === n
            return (
              <button
                key={n}
                type="button"
                className="no-press-anim glass-press"
                onClick={() => applyValue(n)}
                style={{
                  height: '28px',
                  padding: '0 12px',
                  borderRadius: '999px',
                  border: 'none',
                  background: active
                    ? (isDark ? '#FFFFFF' : '#1C1C1E')
                    : secondaryFill,
                  color: active
                    ? (isDark ? '#1C1C1E' : '#FFFFFF')
                    : 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                {n}
              </button>
            )
          })}
        </div>

        {initialGoal != null && initialGoal > 0 && (
          <button
            type="button"
            onClick={async () => {
              if (saving) return
              setSaving(true)
              try { await onTurnOff() } finally { setSaving(false) }
            }}
            style={{
              display: 'block',
              width: '100%',
              marginBottom: '14px',
              background: 'none',
              border: 'none',
              color: isDark ? 'rgba(235,235,245,0.45)' : 'rgba(60,60,67,0.55)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px',
              textAlign: 'center',
            }}
          >
            {t.home.goalTurnOff}
          </button>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="no-press-anim glass-press"
            onClick={onCancel}
            style={glassSecondaryBtnStyle(isDark)}
          >
            {t.common.cancel}
          </button>
          <button
            className="no-press-anim glass-press"
            onClick={() => { void handleSave() }}
            disabled={saving}
            style={{
              ...glassPrimaryBtnStyle(isDark),
              opacity: saving ? 0.6 : 1,
            }}
          >
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  )
}
