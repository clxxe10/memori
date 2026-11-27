'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/i18n'

const PRESETS = [5, 10, 20, 30, 50] as const

interface Props {
  initialGoal: number | null
  onSave: (goal: number) => void | Promise<void>
  onTurnOff: () => void | Promise<void>
  onCancel: () => void
}

export default function DailyGoalModal({ initialGoal, onSave, onTurnOff, onCancel }: Props) {
  const { t } = useTranslation()
  const [isDark, setIsDark] = useState(false)
  const [selected, setSelected] = useState<number>(initialGoal && initialGoal > 0 ? initialGoal : 10)
  const [custom, setCustom] = useState(
    initialGoal && !(PRESETS as readonly number[]).includes(initialGoal)
      ? String(initialGoal)
      : '',
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const separator = isDark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.29)'
  const cancelColor = isDark ? '#0A84FF' : '#007AFF'
  const confirmColor = isDark ? '#0A84FF' : '#007AFF'
  const pressBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  const activeGoal = custom.trim() !== '' ? Number(custom) : selected
  const canSave = Number.isFinite(activeGoal) && activeGoal >= 1 && activeGoal <= 200

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await onSave(Math.floor(activeGoal))
    } finally {
      setSaving(false)
    }
  }

  const pickPreset = (n: number) => {
    setSelected(n)
    setCustom('')
  }

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
        .goal-modal-btn:active { background: ${pressBg} !important; }
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
          animation: 'modalEnter 0.25s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
      >
        <div style={{ padding: '22px 18px 16px', textAlign: 'center' }}>
          <h3 style={{
            fontSize: '17px', fontWeight: 600, letterSpacing: '-0.3px',
            color: isDark ? '#FFFFFF' : '#000000', margin: '0 0 16px',
          }}>
            {t.home.goalModalTitle}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
            {PRESETS.map(n => {
              const active = custom.trim() === '' && selected === n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => pickPreset(n)}
                  style={{
                    minWidth: '52px', height: '36px', padding: '0 12px',
                    borderRadius: '10px',
                    border: active ? 'none' : `1px solid ${isDark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.29)'}`,
                    background: active ? 'var(--color-my)' : 'transparent',
                    color: active ? 'var(--color-my-contrast)' : (isDark ? '#FFFFFF' : '#000000'),
                    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {n}
                </button>
              )
            })}
          </div>

          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={200}
            placeholder={t.home.goalCustom}
            value={custom}
            onChange={e => {
              const v = e.target.value.replace(/[^\d]/g, '')
              setCustom(v)
              if (v) {
                const n = Number(v)
                if ((PRESETS as readonly number[]).includes(n)) setSelected(n)
              }
            }}
            style={{
              width: '100%', height: '40px', boxSizing: 'border-box',
              borderRadius: '10px',
              border: `1px solid ${isDark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.29)'}`,
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
              padding: '0 12px',
              fontSize: '15px',
              color: isDark ? '#FFFFFF' : '#000000',
              outline: 'none',
              textAlign: 'center',
            }}
          />

          {initialGoal != null && initialGoal > 0 && (
            <button
              type="button"
              onClick={async () => {
                if (saving) return
                setSaving(true)
                try { await onTurnOff() } finally { setSaving(false) }
              }}
              style={{
                marginTop: '12px', background: 'none', border: 'none',
                color: isDark ? '#FF453A' : '#FF3B30',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '4px',
              }}
            >
              {t.home.goalTurnOff}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', borderTop: `0.5px solid ${separator}` }}>
          <button
            className="no-press-anim goal-modal-btn"
            onClick={onCancel}
            style={{
              flex: 1, height: '50px', background: 'transparent', border: 'none',
              borderRight: `0.5px solid ${separator}`, borderRadius: 0,
              fontSize: '17px', fontWeight: 400, color: cancelColor, cursor: 'pointer', padding: 0,
            }}
          >
            {t.common.cancel}
          </button>
          <button
            className="no-press-anim goal-modal-btn"
            onClick={() => { void handleSave() }}
            disabled={!canSave || saving}
            style={{
              flex: 1, height: '50px', background: 'transparent', border: 'none', borderRadius: 0,
              fontSize: '17px', fontWeight: 600,
              color: canSave ? confirmColor : (isDark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)'),
              cursor: canSave ? 'pointer' : 'not-allowed', padding: 0,
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
