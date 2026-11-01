const BOOKING_TYPES = ['room', 'table', 'function', 'day-pass', 'general']
const ROOM_SLUGS: Record<string, string> = {
  standard: 'Standard Room',
  deluxe: 'Deluxe Room',
  'ocean-view': 'Ocean View Suite',
  family: 'Family Room',
  beachfront: 'Beachfront Villa',
}
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value: unknown, maxLength = 100): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export default function handler(req: any, res: any) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  const name = clean(body.name, 100);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);
  const bookingType = clean(body.bookingType, 30);
  const date = clean(body.date, 10);
  const checkout = clean(body.checkout, 10);
  const party = clean(body.party, 30);
  const room = clean(body.room, 30);
  const rooms = clean(body.rooms, 10) || '1';
  const message = clean(body.message, 600);

  const errors: string[] = [];
  if (!name) errors.push('Please enter your name.');
  if (!email) errors.push('Please enter your email address.');
  else if (!EMAIL_PATTERN.test(email)) errors.push('Please enter a valid email address.');
  if (!phone) errors.push('Please enter a phone number.');
  if (!BOOKING_TYPES.includes(bookingType)) errors.push('Please choose a valid booking type.');
  if (!date) errors.push('Please choose a date.');

  if (bookingType === 'room') {
    if (!ROOM_SLUGS[room]) errors.push('Please select a room.');
    if (!checkout) errors.push('Please choose a check-out date.');
    else if (date && checkout <= date) errors.push('Check-out must be after check-in.');
    if (!party || Number(party) < 1) errors.push('Please enter the number of guests.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0], errors });
  }

  const reference = `TB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  res.status(201).json({
    success: true,
    booking: {
      id: Date.now(),
      reference,
      name,
      email,
      phone,
      booking_type: bookingType,
      date,
      checkout: bookingType === 'room' ? checkout : null,
      party: party || null,
      room: bookingType === 'room' ? ROOM_SLUGS[room] : null,
      rooms: bookingType === 'room' ? rooms : null,
      message: message || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  });
}

