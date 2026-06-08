'use client'
import { useEffect } from 'react'

export function SkeletonBox({ width = '100%', height = '20px', radius = '8px', style = {} }: {
  width?: string
  height?: string
  radius?: string
  style?: React.CSSProperties
}) {
  useEffect(() => {
    if (document.getElementById('skeleton-style')) return
    const s = document.createElement('style')
    s.id = 'skeleton-style'
    s.textContent = `
      @keyframes shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      .skeleton {
        background: linear-gradient(
          90deg,
          var(--color-surface-2, #f0f0f0) 25%,
          var(--color-border, #e0e0e0) 50%,
          var(--color-surface-2, #f0f0f0) 75%
        );
        background-size: 800px 100%;
        animation: shimmer 1.4s ease-in-out infinite;
      }
    `
    document.head.appendChild(s)
  }, [])

  return (
    <div className="skeleton" style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }} />
  )
}

export function FolderSkeleton() {
  return (
    <div style={{
      background: 'var(--color-surface)', borderRadius: '16px',
      padding: '14px 16px', border: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <SkeletonBox width="44px" height="44px" radius="12px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SkeletonBox width="60%" height="14px" radius="6px" />
        <SkeletonBox width="40%" height="11px" radius="6px" />
      </div>
    </div>
  )
}

export function WordSkeleton() {
  return (
    <div style={{
      background: 'var(--color-surface)', borderRadius: '14px',
      padding: '12px 14px', border: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column', gap: '7px',
    }}>
      <SkeletonBox width="50%" height="15px" radius="6px" />
      <SkeletonBox width="70%" height="12px" radius="6px" />
      <SkeletonBox width="30%" height="10px" radius="10px" />
    </div>
  )
}
