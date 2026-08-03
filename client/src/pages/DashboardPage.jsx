import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, ListVideo, Pause, Play, Plus, XCircle } from 'lucide-react'
import { useAuth } from '../context/useAuth.js'
import { fetchItems } from '../api/items.js'
import ItemCard from '../components/watchlist/ItemCard.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { STATUSES, STATUS_LABELS } from '../lib/constants.js'
import ItemDrawer from '../components/watchlist/ItemDrawer.jsx'

const STATUS_ICONS = {
  plan_to_watch: Clock,
  watching: Play,
  completed: CheckCircle2,
  on_hold: Pause,
  dropped: XCircle,
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [selected, setSelected] = useState(null)
  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: fetchItems })
  const items = useMemo(() => itemsQuery.data || [], [itemsQuery.data])

  const stats = useMemo(() => {
    const byStatus = { plan_to_watch: 0, watching: 0, completed: 0, on_hold: 0, dropped: 0 }
    const genreCount = {}
    let completedThisMonth = 0
    const now = new Date()
    for (const i of items) {
      if (byStatus[i.status] !== undefined) byStatus[i.status]++
      for (const g of i.genres || []) genreCount[g] = (genreCount[g] || 0) + 1
      if (i.dateCompleted) {
        const d = new Date(i.dateCompleted)
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
          completedThisMonth++
      }
    }
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g)
    return { byStatus, topGenres, completedThisMonth, total: items.length }
  }, [items])

  const continuing = useMemo(
    () =>
      items
        .filter((i) => i.status === 'watching')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .slice(0, 8),
    [items]
  )
  const recent = useMemo(
    () => [...items].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 8),
    [items]
  )

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Good to see you, {user?.username}.
        </h1>
        <p className="mt-1 text-sm text-muted">
          Pick up where you left off, or find your next one.
        </p>
      </div>

      {itemsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={ListVideo} title="Nothing here yet" body="Add a title to get started." />
      ) : (
        <>
          <section
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
            aria-label="Your stats"
          >
            {STATUSES.map((s) => {
              const Icon = STATUS_ICONS[s.id]
              return (
                <div key={s.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
                    <span className="font-mono text-xs text-muted">{stats.byStatus[s.id]}</span>
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold uppercase tracking-wide text-ink">
                    {STATUS_LABELS[s.id]}
                  </p>
                </div>
              )
            })}
          </section>

          {stats.completedThisMonth > 0 && (
            <p className="text-sm text-muted">
              <span className="font-mono font-semibold text-accent">
                {stats.completedThisMonth}
              </span>{' '}
              completed this month.
            </p>
          )}
          {stats.topGenres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              Top genres:
              {stats.topGenres.map((g) => (
                <span key={g} className="chip">
                  {g}
                </span>
              ))}
            </div>
          )}

          <Section title="Continue Watching" subtitle="Where you left off">
            {continuing.length ? (
              <PosterRow items={continuing} onPick={setSelected} />
            ) : (
              <p className="text-sm text-muted">Nothing in progress — pick something up.</p>
            )}
          </Section>

          <Section title="Recently Added" subtitle="Fresh on the shelf">
            {recent.length ? <PosterRow items={recent} onPick={setSelected} /> : null}
          </Section>
        </>
      )}

      <ItemDrawer item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <span className="text-xs text-muted">{subtitle}</span>
      </div>
      {children}
    </section>
  )
}

function PosterRow({ items, onPick }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {items.map((item) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ItemCard item={item} onClick={() => onPick(item)} />
        </motion.div>
      ))}
    </div>
  )
}
