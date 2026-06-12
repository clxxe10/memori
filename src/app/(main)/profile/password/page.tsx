'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

export default function ProfilePasswordPage() {
  const router = useRouter()
  const padding = usePagePadding()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [isEmailUser, setIsEmailUser] = useState<boolean | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsEmailUser(user?.app_metadata?.provider === 'email')
    }
    fetchUser()
  }, [])

  const handleChange = async () => {
    if (!currentPassword.trim()) {
      showToast('현재 비밀번호를 입력해주세요')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setSaving(false)
      showToast('현재 비밀번호가 올바르지 않아요', 'error')
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (signInError) {
      setSaving(false)
      showToast('현재 비밀번호가 올바르지 않아요', 'error')
      return
    }

    if (password.length < 8) {
      setSaving(false)
      showToast('8자 이상 입력해주세요', 'error')
      return
    }
    if (password !== confirmPassword) {
      setSaving(false)
      showToast('비밀번호가 일치하지 않아요', 'error')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    showToast('비밀번호가 변경되었어요')
    router.back()
  }

  const inputStyle = {
    width: '100%', height: '52px',
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: '14px', padding: '0 16px',
    fontSize: '15px', color: 'var(--color-text-primary)',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: 700,
    color: 'var(--color-text-secondary)',
    marginBottom: '8px', display: 'block',
  }

  const canSubmit = currentPassword.length > 0 && password.length >= 8 && confirmPassword.length >= 8

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      paddingBottom: '100px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto', padding }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <button onClick={() => router.back()}
            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={22} color="var(--color-text-primary)" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            비밀번호 변경
          </h1>
        </div>

        {isEmailUser === false && (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            소셜 로그인 계정은 비밀번호를 설정할 수 없어요
          </p>
        )}

        {isEmailUser === true && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div>
            <label style={labelStyle}>현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호 입력..."
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>새 비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="새 비밀번호 입력..."
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 다시 입력..."
              style={inputStyle}
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
              8자 이상 입력해주세요
            </p>
          </div>

          <button
            onClick={handleChange}
            disabled={saving || !canSubmit}
            style={{
              width: '100%', height: '52px', marginTop: '8px',
              background: canSubmit ? 'var(--color-my)' : 'var(--color-surface-2)',
              color: canSubmit ? 'var(--color-my-contrast)' : 'var(--color-text-tertiary)',
              border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: 700,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? '변경 중...' : '변경하기'}
          </button>

        </div>
        )}
      </div>
    </main>
  )
}
