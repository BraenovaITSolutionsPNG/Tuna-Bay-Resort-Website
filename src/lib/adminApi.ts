export function token() { return localStorage.getItem('token') || '' }
export function ah(extra: Record<string,string> = {}): Record<string,string> {
  const t = token(); return t ? { Authorization: `Bearer ${t}`, ...extra } : extra
}
export async function ajson<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { ...init, headers: { ...(ah() as any), ...(init.headers as any || {}) } })
  if (res.status === 401 || res.status === 403) { localStorage.removeItem('token'); throw new Error('Session expired. Please sign in again.') }
  if (!res.ok) { let msg = 'Request failed'; try { const j = await res.json(); msg = j.error || msg } catch {} throw new Error(msg) }
  return res.json()
}
