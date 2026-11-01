export default function handler(req, res) {
  if (req.method === 'PUT') return res.json({ success: true })
  if (req.method === 'DELETE') return res.json({ success: true })
  return res.status(405).json({ error: 'Method not allowed' })
}
