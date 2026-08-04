import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListVideo, LogOut, Plus, Settings } from 'lucide-react'
import { useAuth } from '../../context/useAuth.js'
import ProfileMenu from './ProfileMenu.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/watchlist', label: 'Watchlist', icon: ListVideo, end: false },
]

export default function Header({ onAdd, onSettings }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-baseline gap-1">
          <span className="font-display text-2xl font-semibold tracking-tight text-ink">
            Marquee
            <span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="ml-2 flex items-center gap-1" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-accent' : 'text-muted hover:text-ink hover:bg-surface'
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={onSettings}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink hover:bg-surface md:hidden"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="ml-auto flex items-center gap-3">
          <button onClick={onAdd} className="btn btn-accent" aria-label="Add to watchlist">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add</span>
          </button>
          <ProfileMenu onSettings={onSettings} />
          <button
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
            className="btn btn-quiet p-2 md:hidden"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
