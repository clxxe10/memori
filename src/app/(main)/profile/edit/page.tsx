// Supabase 대시보드 → Storage → New bucket
// 버킷 이름: avatars
// Public bucket: true
// 설정 후 아바타 업로드 가능
//
// Supabase SQL Editor에서 실행:
// create policy "아바타 업로드" on storage.objects
//   for insert with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
// create policy "아바타 수정" on storage.objects
//   for update with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
// create policy "아바타 조회" on storage.objects
//   for select using (bucket_id = 'avatars');

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT_MAX_WIDTH, usePagePadding } from '@/lib/responsive'

export default function ProfileEditPage() {
  const router = useRouter()
  const padding = usePagePadding()
  const fileRef = useRef<HTMLInputElement>(null)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setNickname(user.user_metadata?.nickname || user.user_metadata?.full_name || '')
      setEmail(user.email || '')
      setAvatarUrl(user.user_metadata?.avatar_url || '')
    }
    fetchUser()
  }, [])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        })

      if (uploadError) {
        console.error('업로드 오류:', uploadError)
        alert('사진 업로드에 실패했어요: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) {
        console.error('메타데이터 업데이트 오류:', updateError)
        alert('프로필 업데이트에 실패했어요')
        setUploading(false)
        return
      }

      setAvatarUrl(publicUrl)
      console.log('프로필 사진 업로드 완료:', publicUrl)
    } catch (e) {
      console.error('프로필 사진 오류:', e)
      alert('오류가 발생했어요')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!nickname.trim()) return
    setSaving(true)
    const supabase = createClient()

    await supabase.auth.updateUser({
      data: { nickname: nickname.trim() }
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('folders')
        .update({ author_nickname: nickname.trim() })
        .eq('user_id', user.id)
    }

    setSaving(false)
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
            프로필 편집
          </h1>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%',
              background: 'var(--color-surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={40} color="var(--color-text-secondary)" />
              )}
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--color-my)', border: '2px solid var(--color-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: uploading ? 'wait' : 'pointer',
                fontSize: '11px', fontWeight: 700, color: 'var(--color-my-contrast)',
              }}
            >
              {uploading ? '...' : <Camera size={13} color="var(--color-my-contrast)" />}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div>
            <label style={labelStyle}>닉네임</label>
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="닉네임 입력..."
              style={inputStyle}
            />
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              marginTop: '6px',
            }}>
              닉네임은 공개 단어장에 표시돼요
            </p>
          </div>

          <div>
            <label style={labelStyle}>이메일</label>
            <input
              value={email}
              disabled
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
              이메일은 변경할 수 없어요
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !nickname.trim()}
            style={{
              width: '100%', height: '52px', marginTop: '8px',
              background: nickname.trim() ? 'var(--color-my)' : 'var(--color-surface-2)',
              color: nickname.trim() ? 'var(--color-my-contrast)' : 'var(--color-text-tertiary)',
              border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: 700,
              cursor: nickname.trim() ? 'pointer' : 'not-allowed',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>

        </div>
      </div>
    </main>
  )
}
