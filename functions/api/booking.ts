interface Env {}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  try {
    const body = await request.json() as { name?: string; phone?: string; bookingType?: string; date?: string; message?: string }
    const { name, phone, bookingType, date, message } = body

    if (!name || !phone || !bookingType || !date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers })
    }

    const sanitized = {
      name: String(name).trim().slice(0, 100),
      phone: String(phone).trim().slice(0, 20),
      bookingType: String(bookingType).trim().slice(0, 50),
      date: String(date).trim(),
      message: message ? String(message).trim().slice(0, 500) : '',
    }

    console.log('Booking received:', sanitized)
    return new Response(JSON.stringify({ success: true, message: 'Booking request received' }), { status: 200, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers })
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
