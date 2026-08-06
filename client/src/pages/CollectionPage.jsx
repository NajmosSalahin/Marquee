import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Columns3, LayoutGrid, List, Plus, Search as SearchIcon } from 'lucide-react'
import { useAuth } from '../context/useAuth.js'
import { useUiStore } from '../store/ui.js'
import { fetchItems } from '../api/items.js'
import { updatePreferences } from '../api/users.js'
import FilterBar from '../components/watchlist/FilterBar.jsx'
import BoardView from '../components/watchlist/BoardView.jsx'
import GridView from '../components/watchlist/GridView.jsx'
import ListView from '../components/watchlist/ListView.jsx'
import ItemDrawer from '../components/watchlist/ItemDrawer.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { STATUSES, STATUS_LABELS, READING_STATUS_LABELS, TYPES } from '../lib/constants.js'

const VIEWS = [
  { id: 'board', label: 'Board', icon: Columns3 },
  { id: 'grid', label: 'Grid', icon: LayoutGrid },
  { id: 'list', label: 'List', icon: List },
]

const SCOPE_TYPES = {
  watchlist: ['movie', 'tv', 'anime'],
  library: ['book', 'manga'],
}

export default function CollectionPage({
  title,
  scope,
  itemNoun,
  itemNounPlural,
  emptyBody,
  noMatchTitle,
  statusLabels = STATUS_LABELS,
}) {
  const { user, updateUser } = useAuth()
  const { view, setView, filters, setFilter } = useUiStore()
  const [selected, setSelected] = useState(null)
  const queryClient = useQueryClient()

  const scopeTypes = SCOPE_TYPES[scope]
  const typeTabs = useMemo(
    () => [{ id: 'all', label: 'All' }, ...TYPES.filter((t) => scopeTypes.includes(t.id))],
    [scopeTypes]
  )

  useEffect(() => {
    if (filters.type !== 'all' && !scopeTypes.includes(filters.type)) {
      setFilter('type', 'all')
    }
  }, [scopeTypes, filters.type, setFilter])

  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: fetchItems })
  const items = useMemo(() => itemsQuery.data || [], [itemsQuery.data])
  const activeView = view || user?.preferences?.defaultView || 'board'

  const prefsMutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: (u) => updateUser(u),
    onError: (err) => toast.error(err.friendlyMessage),
  })

  const switchView = (v) => {
    setView(v)
    if (v !== user?.preferences?.defaultView) {
      prefsMutation.mutate({ defaultView: v })
    }
  }

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    let out = items.filter(
      (i) =>
        (filters.type === 'all' ? scopeTypes.includes(i.type) : i.type === filters.type) &&
        (filters.status === 'all' || i.status === filters.status) &&
        (filters.genre === 'all' || (i.genres || []).includes(filters.genre)) &&
        (filters.tag === 'all' || (i.tags || []).includes(filters.tag)) &&
        (!q || i.title.toLowerCase().includes(q))
    )
    const sort = filters.sort
    out = [...out].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'releaseYear') return (b.releaseYear || 0) - (a.releaseYear || 0)
      if (sort === 'rating') return (b.externalRating ?? -1) - (a.externalRating ?? -1)
      return new Date(b.dateAdded) - new Date(a.dateAdded)
    })
    return out
  }, [items, filters, scopeTypes])

  const itemsByStatus = useMemo(() => {
    const map = {}
    for (const s of STATUSES) map[s.id] = []
    for (const i of filtered) {
      const arr = map[i.status] || (map[i.status] = [])
      arr.push(i)
    }
    for (const s of STATUSES) {
      map[s.id].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.dateAdded) - new Date(b.dateAdded)
      )
    }
    return map
  }, [filtered])

  const density = user?.preferences?.density || 'comfortable'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} {items.length === 1 ? itemNoun : itemNounPlural}
          </p>
        </div>
        <div
          className="flex overflow-hidden rounded-lg hairline"
          role="group"
          aria-label="View mode"
        >
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => switchView(id)}
              aria-pressed={activeView === id}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors ${
                activeView === id
                  ? 'bg-accent text-[#14100a]'
                  : 'text-muted hover:bg-surface2 hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <FilterBar items={items} typeTabs={typeTabs} statusLabels={statusLabels} />

      {itemsQuery.isLoading ? (
        activeView === 'board' ? (
          <div className="flex gap-4 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-56 shrink-0 space-y-3">
                <Skeleton className="h-4 w-28" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="aspect-[2/3] rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <GridView items={[]} onItemClick={() => {}} density={density} loading />
        )
      ) : itemsQuery.isError ? (
        <EmptyState
          icon={List}
          title="Couldn't load your watchlist"
          body={itemsQuery.error?.friendlyMessage}
          action={
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['items'] })}
              className="btn btn-ghost"
            >
              Try again
            </button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState icon={Plus} title="Nothing here yet" body={emptyBody} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={noMatchTitle}
          body="Loosen a filter or clear them."
        />
      ) : (
        <>
          {activeView === 'board' && (
            <BoardView
              itemsByStatus={itemsByStatus}
              onItemClick={setSelected}
              statusLabels={statusLabels}
            />
          )}
          {activeView === 'grid' && (
            <GridView
              items={filtered}
              onItemClick={setSelected}
              density={density}
              loading={false}
            />
          )}
          {activeView === 'list' && (
            <ListView
              items={filtered}
              sort={filters.sort}
              onSort={(key) => setFilter('sort', key)}
              onItemClick={setSelected}
            />
          )}
        </>
      )}

      <ItemDrawer item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
