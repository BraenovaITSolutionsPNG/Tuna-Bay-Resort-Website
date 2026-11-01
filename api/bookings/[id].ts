export default function handler(req: any, res: any) {
  const { id } = req.query
  if (req.method === 'PUT') {
    const { status } = req.body || {}
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    return res.json({ success: true })
  }
  if (req.method === 'DELETE') {
    return res.json({ success: true })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
