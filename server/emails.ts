import nodemailer from 'nodemailer'

export interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

function createTransport() {
  const host = process.env.SMTP_HOST
  if (!host) return null
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'hello@tunabayresort.com'

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    from,
  })
}

export function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; mode: 'smtp' | 'console' }> {
  const transport = createTransport()
  if (transport) {
    await transport.sendMail({
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    })
    return { ok: true, mode: 'smtp' }
  }

  // Fallback: log to server console so the flow is still testable.
  console.log('[email] SMTP not configured — logging to console.')
  console.log(`  To: ${payload.to}`)
  console.log(`  Subject: ${payload.subject}`)
  console.log(`  Body: ${payload.text || payload.html}`)
  return { ok: true, mode: 'console' }
}

export function bookingConfirmationEmail(params: {
  name: string
  reference: string
  bookingType: string
  date: string
  checkout?: string | null
  party?: string | null
  room?: string | null
  message?: string | null
  total?: number
}): { subject: string; html: string; text: string } {
  const { name, reference, bookingType, date, checkout, party, room, message, total } = params
  const totalLine = total ? `Estimated total: K${total.toLocaleString()}` : ''
  return {
    subject: `Booking request received — ${reference}`,
    html: `
      <h2>Thank you, ${name}!</h2>
      <p>Your booking request has been received and is pending confirmation.</p>
      <p><strong>Reference:</strong> ${reference}</p>
      <p><strong>Type:</strong> ${bookingType}</p>
      <p><strong>Date:</strong> ${date}</p>
      ${checkout ? `<p><strong>Check-out:</strong> ${checkout}</p>` : ''}
      ${party ? `<p><strong>Party:</strong> ${party}</p>` : ''}
      ${room ? `<p><strong>Room:</strong> ${room}</p>` : ''}
      ${totalLine ? `<p><strong>${totalLine}</strong></p>` : ''}
      ${message ? `<p><em>"${message}"</em></p>` : ''}
      <p>Our team will confirm availability and final details shortly.</p>
    `,
    text: `Thank you, ${name}!\n\nBooking request received — ${reference}\nType: ${bookingType}\nDate: ${date}${checkout ? `\nCheck-out: ${checkout}` : ''}${party ? `\nParty: ${party}` : ''}${room ? `\nRoom: ${room}` : ''}${total ? `\nEstimated total: K${total.toLocaleString()}` : ''}\n\nOur team will confirm availability and final details shortly.`,
  }
}

export function bookingStatusEmail(params: {
  name: string
  reference: string
  status: 'confirmed' | 'cancelled'
  note?: string
}): { subject: string; html: string; text: string } {
  const { name, reference, status, note } = params
  const isConfirmed = status === 'confirmed'
  return {
    subject: `Booking ${reference} ${isConfirmed ? 'confirmed' : 'cancelled'}`,
    html: `
      <h2>${isConfirmed ? 'Booking confirmed' : 'Booking cancelled'}</h2>
      <p>Hi ${name},</p>
      <p>Your booking <strong>${reference}</strong> has been <strong>${isConfirmed ? 'confirmed' : 'cancelled'}</strong>.</p>
      ${note ? `<p>${note}</p>` : ''}
      ${isConfirmed ? '<p>We look forward to welcoming you to Tuna Bay Resort.</p>' : '<p>If you have any questions, please contact us at +675 7000 0000.</p>'}
    `,
    text: `Hi ${name},\n\nYour booking ${reference} has been ${isConfirmed ? 'confirmed' : 'cancelled'}.\n${note || ''}\n\n${isConfirmed ? 'We look forward to welcoming you to Tuna Bay Resort.' : 'If you have any questions, please contact us at +675 7000 0000.'}`,
  }
}

export function reminderEmail(params: {
  name: string
  reference: string
  date: string
  checkout?: string | null
}): { subject: string; html: string; text: string } {
  const { name, reference, date, checkout } = params
  return {
    subject: `Reminder — your stay at Tuna Bay Resort`,
    html: `
      <h2>Reminder</h2>
      <p>Hi ${name},</p>
      <p>This is a reminder about your upcoming stay.</p>
      <p><strong>Reference:</strong> ${reference}</p>
      <p><strong>Check-in:</strong> ${date}</p>
      ${checkout ? `<p><strong>Check-out:</strong> ${checkout}</p>` : ''}
      <p>We look forward to seeing you soon!</p>
    `,
    text: `Hi ${name},\n\nThis is a reminder about your upcoming stay.\nReference: ${reference}\nCheck-in: ${date}${checkout ? `\nCheck-out: ${checkout}` : ''}\n\nWe look forward to seeing you soon!`,
  }
}