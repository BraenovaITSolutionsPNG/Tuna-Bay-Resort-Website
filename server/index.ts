import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3004'],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many booking requests, please try again later.'
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Booking endpoint
app.post('/api/booking', bookingLimiter, (req, res) => {
  const { name, phone, bookingType, date, message } = req.body;
  
  if (!name || !phone || !bookingType || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Sanitize input
  const sanitized = {
    name: String(name).trim().slice(0, 100),
    phone: String(phone).trim().slice(0, 20),
    bookingType: String(bookingType).trim().slice(0, 50),
    date: String(date).trim(),
    message: message ? String(message).trim().slice(0, 500) : ''
  };
  
  console.log('Booking received:', sanitized);
  res.json({ success: true, message: 'Booking request received' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
