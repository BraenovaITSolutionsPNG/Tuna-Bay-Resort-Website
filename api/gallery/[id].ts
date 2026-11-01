export default function handler(req: any, res: any) {
  if (req.method === 'DELETE') {
    return res.json({ success: true })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
