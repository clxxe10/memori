'use client'

import { useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string; flag?: string }

type Props = {
  value: string
  onChange: (val: string) => void
  options: Option[]
  placeholder?: string
  multiple?: boolean
  selectedValues?: string[]
  onMultiChange?: (vals: string[]) => void
}

export default function SelectDropdown({
  value, onChange, options, placeholder = '선택',
  multiple = false, selectedValues = [], onMultiChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayValue = multiple
    ? selectedValues.length === 0 ? placeholder
      : selectedValues.length === 1 ? selectedValues[0]
      : `${selectedValues[0]} 외 ${selectedValues.length - 1}개`
    : value || placeholder

  const handleSelect = (val: string) => {
    if (multiple && onMultiChange) {
      if (val === '전체') {
        onMultiChange([])
        setOpen(false)
        return
      }
      const next = selectedValues.includes(val)
        ? selectedValues.filter(v => v !== val)
        : [...selectedValues, val]
      onMultiChange(next)
    } else {
      onChange(val)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          height: '40px', padding: '0 14px',
          background: 'var(--color-surface)',
          border: '1.5px solid var(--color-border)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '6px',
          cursor: 'pointer', fontSize: '13px',
          color: 'var(--color-text-primary)',
          whiteSpace: 'nowrap',
          minWidth: '90px',
        }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{displayValue}</span>
        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '44px', left: 0,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px', overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100, minWidth: '140px',
          maxHeight: '200px', overflowY: 'auto',
        }}>
          {options.map((opt, i) => {
            const isSelected = multiple
              ? selectedValues.includes(opt.value)
              : value === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                style={{
                  width: '100%', padding: '11px 14px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: isSelected ? 'var(--color-surface-2)' : 'transparent',
                  border: 'none',
                  borderBottom: i < options.length - 1 ? '1px solid var(--color-border)' : 'none',
                  cursor: 'pointer', fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  textAlign: 'left' as const,
                }}
              >
                {opt.flag && <span style={{ fontSize: '16px' }}>{opt.flag}</span>}
                <span style={{ flex: 1, fontWeight: isSelected ? 700 : 400 }}>{opt.label}</span>
                {isSelected && <span style={{ color: 'var(--color-my)', fontSize: '12px' }}>✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
