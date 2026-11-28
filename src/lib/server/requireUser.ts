import { createClient, type User } from '@supabase/supabase-js'

export type RequireUserResult =
  | { user: User; response: null }
  | { user: null; response: Response }

/**
 * Bearer access_token → Supabase auth.getUser. Call before any paid upstream work.
 */
export async function requireUser(request: Request): Promise<RequireUserResult> {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return {
      user: null,
      response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('requireUser: missing Supabase env')
    return {
      user: null,
      response: Response.json({ error: 'Server error' }, { status: 500 }),
    }
  }

  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: { user }, error } = await adminClient.auth.getUser(token)
  if (!user || error) {
    return {
      user: null,
      response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { user, response: null }
}
