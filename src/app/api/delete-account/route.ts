import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  await adminClient.from('words').delete().eq('user_id', user.id)
  await adminClient.from('folders').delete().eq('user_id', user.id)
  await adminClient.from('user_learning_stats').delete().eq('user_id', user.id)
  await adminClient.from('user_daily_study').delete().eq('user_id', user.id)
  await adminClient.auth.admin.deleteUser(user.id)

  return NextResponse.json({ success: true })
}
