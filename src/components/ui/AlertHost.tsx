'use client'

import { useEffect, useRef, useState } from 'react'
import AlertModal from '@/components/AlertModal'
import { useTranslation } from '@/lib/i18n'

export type AlertOptions = {
  title: string
  description?: string
  confirmText?: string
}

export type ConfirmOptions = {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

type AlertRequest =
  | { kind: 'alert'; options: AlertOptions; resolve: () => void }
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (ok: boolean) => void }

let listeners: ((req: AlertRequest) => void)[] = []

export function showAlert(options: AlertOptions | string): Promise<void> {
  const opts: AlertOptions = typeof options === 'string' ? { title: options } : options
  return new Promise(resolve => {
    const req: AlertRequest = { kind: 'alert', options: opts, resolve }
    if (listeners.length === 0) {
      console.warn('AlertHost not mounted:', opts.title)
      resolve()
      return
    }
    listeners.forEach(l => l(req))
  })
}

export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise(resolve => {
    const req: AlertRequest = { kind: 'confirm', options, resolve }
    if (listeners.length === 0) {
      console.warn('AlertHost not mounted:', options.title)
      resolve(false)
      return
    }
    listeners.forEach(l => l(req))
  })
}

export default function AlertHost() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState<AlertRequest | null>(null)
  const queueRef = useRef<AlertRequest[]>([])
  const busyRef = useRef(false)

  useEffect(() => {
    const listener = (req: AlertRequest) => {
      if (busyRef.current) {
        queueRef.current.push(req)
        return
      }
      busyRef.current = true
      setCurrent(req)
    }
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  const advance = () => {
    const next = queueRef.current.shift()
    if (next) {
      setCurrent(next)
    } else {
      busyRef.current = false
      setCurrent(null)
    }
  }

  if (!current) return null

  if (current.kind === 'alert') {
    const { options, resolve } = current
    const close = () => {
      resolve()
      advance()
    }
    return (
      <AlertModal
        title={options.title}
        description={options.description}
        confirmText={options.confirmText ?? t.common.confirm}
        showCancel={false}
        onConfirm={close}
        onCancel={close}
      />
    )
  }

  const { options, resolve } = current
  const finish = (ok: boolean) => {
    resolve(ok)
    advance()
  }
  return (
    <AlertModal
      title={options.title}
      description={options.description}
      confirmText={options.confirmText ?? t.common.confirm}
      cancelText={options.cancelText}
      isDestructive={options.destructive}
      showCancel
      onConfirm={() => finish(true)}
      onCancel={() => finish(false)}
    />
  )
}
