import { useState, useEffect } from 'react'

interface MenuItem {
  id: number
  category: string
  name: string
  description: string
  price: string
}

export default function AdminMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([])

  useEffect(() => {
    fetch('/api/menu').then(r => r.ok ? r.json() : []).then(d => setMenu(Array.isArray(d) ? d : [])).catch(() => setMenu([]))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Menu</h1>
      <p className="mt-1 text-muted">Manage menu items.</p>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-ocean text-white">
            <tr>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {menu.map(m => (
              <tr key={m.id} className="border-t border-ocean/10">
                <td className="px-4 py-3">{m.category}</td>
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{m.description}</td>
                <td className="px-4 py-3">{m.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
