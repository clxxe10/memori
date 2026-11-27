import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function fail(step: string, error: { message?: string } | null): NextResponse | null {
  if (!error) return null
  console.error(`delete-account [${step}]:`, error)
  return NextResponse.json(
    { error: `Failed at ${step}`, detail: error.message || 'unknown' },
    { status: 500 },
  )
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: { user }, error: authError } = await adminClient.auth.getUser(token)
  if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = user.id

  // 1) UGC / social related rows first
  {
    const { error } = await adminClient.from('folder_comments').delete().eq('user_id', uid)
    const res = fail('folder_comments', error)
    if (res) return res
  }
  {
    const { error } = await adminClient.from('folder_likes').delete().eq('user_id', uid)
    const res = fail('folder_likes', error)
    if (res) return res
  }
  {
    const { error } = await adminClient.from('support_requests').delete().eq('user_id', uid)
    const res = fail('support_requests', error)
    if (res) return res
  }
  {
    const { error } = await adminClient
      .from('reports')
      .delete()
      .or(`reporter_id.eq.${uid},owner_id.eq.${uid}`)
    const res = fail('reports', error)
    if (res) return res
  }
  {
    const { error } = await adminClient
      .from('user_blocks')
      .delete()
      .or(`blocker_id.eq.${uid},blocked_id.eq.${uid}`)
    const res = fail('user_blocks', error)
    if (res) return res
  }

  // 2) Core learning data
  {
    const { error } = await adminClient.from('words').delete().eq('user_id', uid)
    const res = fail('words', error)
    if (res) return res
  }
  {
    const { error } = await adminClient.from('folders').delete().eq('user_id', uid)
    const res = fail('folders', error)
    if (res) return res
  }
  {
    const { error } = await adminClient.from('user_learning_stats').delete().eq('user_id', uid)
    const res = fail('user_learning_stats', error)
    if (res) return res
  }
  {
    const { error } = await adminClient.from('user_daily_study').delete().eq('user_id', uid)
    const res = fail('user_daily_study', error)
    if (res) return res
  }

  // 3) Avatar storage — path rule: `${user.id}/avatar.${ext}`
  {
    const { data: files, error: listError } = await adminClient.storage.from('avatars').list(uid)
    const listFail = fail('avatars.list', listError)
    if (listFail) return listFail

    if (files && files.length > 0) {
      const paths = files.map((f) => `${uid}/${f.name}`)
      const { error: removeError } = await adminClient.storage.from('avatars').remove(paths)
      const removeFail = fail('avatars.remove', removeError)
      if (removeFail) return removeFail
    }
  }

  // 4) Auth user last — only after all data wiped
  {
    const { error } = await adminClient.auth.admin.deleteUser(uid)
    const res = fail('auth.deleteUser', error)
    if (res) return res
  }

  return NextResponse.json({ success: true })
}
