'use client'
import { useEffect, useState } from 'react'
import { glassToastStyle } from '@/lib/glassModalStyles'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: string; message: string; type: ToastType }

let toastListeners: ((toast: Toast) => void)[] = []

export function showToast(message: string, type: ToastType = 'success') {
  const toast: Toast = { id: Date.now().toString(), message, type }
  toastListeners.forEach(listener => listener(toast))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 2800)
    }
    toastListeners.push(listener)
    return () => { toastListeners = toastListeners.filter(l => l !== listener) }
  }, [])

  const iconFor = (type: ToastType) => {
    if (type === 'success') return '✓'
    if (type === 'error') return '✕'
    return 'ℹ'
  }

  const iconBg = (type: ToastType) => {
    if (type === 'error') return 'rgba(255,59,48,0.18)'
    if (type === 'success') return isDark ? 'rgba(255,255,255,0.14)' : 'rgba(28,28,30,0.1)'
    return isDark ? 'rgba(255,255,255,0.12)' : 'rgba(28,28,30,0.08)'
  }

  const iconColor = (type: ToastType) => {
    if (type === 'error') return '#FF3B30'
    return 'var(--color-text-primary)'
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div key={toast.id} className="glass-surface" style={glassToastStyle(isDark)}>
          <span style={{
            fontSize: '12px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: iconBg(toast.type),
            color: iconColor(toast.type),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontWeight: 700,
          }}>
            {iconFor(toast.type)}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  )
}
