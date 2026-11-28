import { createClient } from '@/lib/supabase/client'
import { showAlert } from '@/components/ui/AlertHost'

const LOGIN_MSG = '로그인하고 사용할 수 있어요'

export type AiFetchResult =
  | { ok: true; response: Response }
  | { ok: false; reason: 'no_session' | 'unauthorized' | 'too_large' | 'bad_request' | 'failed' }

/**
 * Authenticated POST to AI routes. Prompts login if no session;
 * refreshes once on 401; maps 413/400 to caller-friendly reasons.
 */
export async function fetchAiApi(
  path: string,
  body: Record<string, unknown>,
): Promise<AiFetchResult> {
  const supabase = createClient()
  let { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    await showAlert(LOGIN_MSG)
    return { ok: false, reason: 'no_session' }
  }

  const post = (token: string) =>
    fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

  let response = await post(session.access_token)

  if (response.status === 401) {
    const { data } = await supabase.auth.refreshSession()
    const next = data.session?.access_token
    if (next) {
      response = await post(next)
    }
  }

  if (response.status === 401) {
    await showAlert(LOGIN_MSG)
    return { ok: false, reason: 'unauthorized' }
  }

  if (response.status === 413) {
    return { ok: false, reason: 'too_large' }
  }

  if (response.status === 400) {
    return { ok: false, reason: 'bad_request' }
  }

  if (!response.ok) {
    return { ok: false, reason: 'failed' }
  }

  return { ok: true, response }
}
