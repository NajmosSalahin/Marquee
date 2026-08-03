import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import AddPanel from '../add/AddPanel.jsx'
import { useState } from 'react'

export default function AppShell() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="min-h-screen bg-base">
      <Header onAdd={() => setAddOpen(true)} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        <Outlet />
      </main>
      <AddPanel open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
