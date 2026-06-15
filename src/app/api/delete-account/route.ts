import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 토큰으로 유저 확인
  const { data: { user }, error } = await adminClient.auth.getUser(token)
  if (!user || error) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await adminClient.from('words').delete().eq('user_id', user.id)
  await adminClient.from('folders').delete().eq('user_id', user.id)
  await adminClient.from('user_learning_stats').delete().eq('user_id', user.id)
  await adminClient.from('user_daily_study').delete().eq('user_id', user.id)
  await adminClient.auth.admin.deleteUser(user.id)

  return NextResponse.json({ success: true })
}
