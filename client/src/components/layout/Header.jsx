import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Clapperboard, LayoutDashboard, ListVideo, LogOut, Plus, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/watchlist', label: 'Watchlist', icon: ListVideo, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export default function Header({ onAdd }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={onAdd}
            className="btn btn-accent"
            aria-label="Add to watchlist"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add</span>
          </button>
          <div className="hidden items-center gap-2 md:flex" title={user?.email}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface2 text-sm font-bold text-accent ring-1 ring-line">
              {user?.username?.[0]?.toUpperCase()}
            </span>
            <span className="text-sm font-medium text-ink">{user?.username}</span>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="btn btn-quiet p-2"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
