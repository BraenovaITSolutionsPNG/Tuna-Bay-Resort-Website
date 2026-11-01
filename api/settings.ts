export default function handler(req, res) {
  if (req.method === 'GET') return res.json([])
  if (req.method === 'POST') return res.json({ success: true })
  return res.status(405).json({ error: 'Method not allowed' })
}
