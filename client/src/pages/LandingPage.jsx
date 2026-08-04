import { Link, Navigate } from 'react-router-dom'
import { CheckCircle2, Clock, Pause, Play, XCircle } from 'lucide-react'
import { useAuth } from '../context/useAuth.js'
import { STATUSES, STATUS_DESCRIPTIONS } from '../lib/constants.js'

const STATUS_ICONS = {
  plan_to_watch: Clock,
  watching: Play,
  completed: CheckCircle2,
  on_hold: Pause,
  dropped: XCircle,
}

const BULBS = 12

const TICKER = ['NOW SHOWING', ...STATUSES.map((s) => s.label.toUpperCase())].join(' · ')

const FEATURES = [
  'Board, grid, or list — your wall, your call.',
  'Ratings, notes, and tags on every title.',
  'The poster wall glows in the accent color you pick.',
]

function BulbRail() {
  return (
    <div
      aria-hidden="true"
      className="flex w-full max-w-3xl items-center justify-center gap-3 sm:gap-5"
    >
      {Array.from({ length: BULBS }).map((_, i) => (
        <span
          key={i}
          className={`bulb ${i >= BULBS - 3 ? 'bulb-flicker' : ''}`}
          style={{ animationDelay: `${i * 0.09}s` }}
        />
      ))}
    </div>
  )
}

function Ticker() {
  return (
    <div className="ticker border-y border-line py-3">
      <div className="ticker-track">
        {[TICKER, TICKER].map((line, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="shrink-0 pr-10 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-muted"
          >
            {line} ·
          </span>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-base">
      <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-semibold tracking-tight text-ink">
              Marquee<span className="text-accent">.</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost">
              Sign in
            </Link>
            <Link to="/register" className="btn btn-accent">
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="flex flex-col items-center px-4 pb-20 pt-20 text-center sm:pt-28">
        <BulbRail />
        <h1 className="mt-8 font-display text-[clamp(3.5rem,13vw,8rem)] font-semibold leading-none tracking-tight text-ink">
          Marquee<span className="text-accent">.</span>
        </h1>
        <BulbRail />
        <p className="mt-10 max-w-md text-lg text-ink">
          Track everything you plan, watch, finish, or drop.
        </p>
        <p className="mt-1 text-sm text-muted">Your list, lit up like a bill.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
          <Link to="/register" className="btn btn-accent px-6 py-3 text-base">
            Create your account
          </Link>
          <Link to="/login" className="font-semibold text-muted transition-colors hover:text-ink">
            Sign in →
          </Link>
        </div>
      </section>

      <Ticker />

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="eyebrow">THE BOARD</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
          Five statuses run the show.
        </h2>
        <p className="mt-2 text-sm text-muted">
          Every title lands in one of five places — that's the whole system.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {STATUSES.map((s) => {
            const Icon = STATUS_ICONS[s.id]
            return (
              <div key={s.id} className="rounded-xl border border-line bg-surface p-4">
                <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-ink">{s.label}</p>
                <p className="mt-1 text-xs text-muted">{STATUS_DESCRIPTIONS[s.id]}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <p className="eyebrow">THE SEARCH</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
            One search box, four sources.
          </h2>
          <p className="mt-2 text-sm text-muted">
            TMDB · OMDb · Jikan · AniList — films, series, and anime in a single query.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted">
            {FEATURES.map((f) => (
              <li key={f} className="flex gap-3">
                <span className="text-accent" aria-hidden="true">
                  ›
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <span className="font-display text-lg font-semibold text-ink">
            Marquee<span className="text-accent">.</span>
          </span>
          <p className="text-xs text-muted">© 2026 Marquee — your watchlist, on the big screen.</p>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-muted transition-colors hover:text-ink">
              Sign in
            </Link>
            <Link to="/register" className="font-semibold text-accent hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}