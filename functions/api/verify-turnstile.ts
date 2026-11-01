interface Env {
  TURNSTILE_SECRET_KEY?: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

  try {
    const { token } = await request.json() as { token?: string }
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Missing token' }), { status: 400, headers })
    }

    const secret = env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA'
    const formData = new FormData()
    formData.append('secret', secret)
    formData.append('response', token)

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })
    const data = await result.json() as { success: boolean }

    return new Response(JSON.stringify({ success: data.success }), { status: 200, headers })
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Verification failed' }), { status: 500, headers })
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
