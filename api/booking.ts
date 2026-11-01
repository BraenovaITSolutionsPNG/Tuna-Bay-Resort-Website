export default function handler(req, res) {
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
  
  const { name, phone, bookingType, date, message } = req.body;
  
  if (!name || !phone || !bookingType || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const sanitized = {
    name: String(name).trim().slice(0, 100),
    phone: String(phone).trim().slice(0, 20),
    bookingType: String(bookingType).trim().slice(0, 50),
    date: String(date).trim(),
    message: message ? String(message).trim().slice(0, 500) : ''
  };
  
  console.log('Booking received:', sanitized);
  res.json({ success: true, message: 'Booking request received' });
}
