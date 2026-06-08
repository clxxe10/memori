'use client'

type Props = {
  icon: string
  title: string
  desc: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon, title, desc, actionLabel, onAction }: Props) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ fontSize: '52px', marginBottom: '16px', lineHeight: 1 }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '17px', fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: '8px', letterSpacing: '-0.3px',
        margin: '0 0 8px 0',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '14px', color: 'var(--color-text-secondary)',
        lineHeight: 1.6, maxWidth: '260px',
        margin: '0 0 24px 0',
      }}>
        {desc}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'var(--color-my)', color: 'var(--color-my-contrast)',
            border: 'none', borderRadius: '20px',
            padding: '12px 24px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
