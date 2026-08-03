import { useMemo } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import { TYPES, SORTS } from '../../lib/constants.js'
import { useUiStore } from '../../store/ui.js'

export default function FilterBar({ items }) {
  const { filters, setFilter, resetFilters } = useUiStore()

  const genreOptions = useMemo(() => {
    const set = new Set()
    for (const i of items) for (const g of i.genres || []) set.add(g)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [items])

  const tagOptions = useMemo(() => {
    const set = new Set()
    for (const i of items) for (const t of i.tags || []) set.add(t)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [items])

  const active =
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.genre !== 'all' ||
    filters.tag !== 'all' ||
    filters.q !== ''

  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-base/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className="flex overflow-hidden rounded-lg hairline"
          role="group"
          aria-label="Filter by type"
        >
          {[{ id: 'all', label: 'All' }, ...TYPES].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter('type', t.id)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                filters.type === t.id
                  ? 'bg-accent text-[#14100a]'
                  : 'text-muted hover:bg-surface2 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <select
          aria-label="Filter by status"
          className="input w-auto py-1.5 text-xs"
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
        >
          <option value="all">Any status</option>
          <option value="plan_to_watch">Plan to Watch</option>
          <option value="watching">Watching</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="dropped">Dropped</option>
        </select>

        <select
          aria-label="Filter by genre"
          className="input w-auto py-1.5 text-xs"
          value={filters.genre}
          onChange={(e) => setFilter('genre', e.target.value)}
        >
          <option value="all">Any genre</option>
          {genreOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by tag"
          className="input w-auto py-1.5 text-xs"
          value={filters.tag}
          onChange={(e) => setFilter('tag', e.target.value)}
        >
          <option value="all">Any tag</option>
          {tagOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort by"
          className="input w-auto py-1.5 text-xs"
          value={filters.sort}
          onChange={(e) => setFilter('sort', e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              Sort: {s.label}
            </option>
          ))}
        </select>

        <div className="relative min-w-40 flex-1 sm:max-w-56">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            aria-label="Search your watchlist"
            className="input py-1.5 pl-8 text-xs"
            placeholder="Search your list…"
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
          />
        </div>

        {active && (
          <button
            onClick={resetFilters}
            className="btn btn-quiet px-2.5 py-1.5 text-xs"
            title="Clear filters"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>
        )}
      </div>
    </div>
  )
}
