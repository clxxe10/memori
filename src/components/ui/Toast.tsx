'use client'
import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: string; message: string; type: ToastType }

let toastListeners: ((toast: Toast) => void)[] = []

export function showToast(message: string, type: ToastType = 'success') {
  const toast: Toast = { id: Date.now().toString(), message, type }
  toastListeners.forEach(listener => listener(toast))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

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

  const getStyle = (type: ToastType) => {
    if (type === 'success') return { bg: '#1C1C1E', icon: '✓' }
    if (type === 'error') return { bg: '#E24B4A', icon: '✕' }
    return { bg: '#3A3A3C', icon: 'ℹ' }
  }

  return (
    <div style={{
      position: 'fixed', bottom: '100px', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex',
      flexDirection: 'column', gap: '8px',
      alignItems: 'center', pointerEvents: 'none',
    }}>
      {toasts.map(toast => {
        const s = getStyle(toast.type)
        return (
          <div key={toast.id} style={{
            background: s.bg, color: '#FFFFFF',
            padding: '10px 18px', borderRadius: '20px',
            fontSize: '14px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            <span style={{
              fontSize: '12px', width: '18px', height: '18px',
              borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {s.icon}
            </span>
            {toast.message}
          </div>
        )
      })}
    </div>
  )
}
