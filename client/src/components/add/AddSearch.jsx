import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, PenLine } from 'lucide-react'
import { searchTitle } from '../../api/search.js'
import useDebounce from '../../hooks/useDebounce.js'
import { TYPES, TYPE_LABELS, TYPE_SOURCE_HINTS } from '../../lib/constants.js'
import Skeleton from '../ui/Skeleton.jsx'
import Poster from '../ui/Poster.jsx'
import SourceBadge from '../ui/SourceBadge.jsx'
import EmptyState from '../ui/EmptyState.jsx'

function ResultCard({ result, onPick }) {
  const poster = result.posters?.[0]?.url
  return (
    <button
      onClick={() => onPick(result)}
      className="group text-left"
      aria-label={`Add ${result.title} (${result.year || 'unknown year'}) from ${result.source}`}
    >
      <div className="poster-glow relative overflow-hidden rounded-lg bg-surface">
        <Poster src={poster} alt={result.title} />
        <SourceBadge source={result.source} className="absolute left-1.5 top-1.5" />
        {result.rating != null && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-base/85 px-1.5 py-0.5 font-mono text-xs font-semibold text-ink">
            {Number(result.rating).toFixed(1)}
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-semibold text-ink group-hover:text-accent">
        {result.title}
      </p>
      <p className="font-mono text-xs text-muted">{result.year || '—'}</p>
    </button>
  )
}

export default function AddSearch({ onPick, onManual }) {
  const [type, setType] = useState('movie')
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 400)
  const query = useQuery({
    queryKey: ['search', type, debouncedQ],
    queryFn: () => searchTitle(type, debouncedQ),
    enabled: debouncedQ.trim().length >= 2,
  })

  const pick = (result) => onPick(result, type)

  const results = query.data?.results || []
  const sourceErrors = query.data?.sourceErrors || []

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="tablist" aria-label="Title type">
        {TYPES.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={type === t.id}
            onClick={() => setType(t.id)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              type === t.id
                ? 'bg-accent text-[#14100a]'
                : 'hairline bg-surface text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          className="input pl-9"
          placeholder={`Search ${TYPE_LABELS[type]}s — ${TYPE_SOURCE_HINTS[type]}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </div>

      {sourceErrors.length > 0 && (
        <p className="text-xs text-muted">{sourceErrors.join(' · ')} — showing the other source.</p>
      )}

      {query.isLoading && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label="Searching">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      )}

      {query.isError && (
        <EmptyState
          icon={Search}
          title="Search hiccuped"
          body="The search service didn't respond. Try again."
          action={
            <button onClick={() => query.refetch()} className="btn btn-ghost">
              Try again
            </button>
          }
        />
      )}

      {query.isSuccess && debouncedQ.trim().length >= 2 && !query.isLoading && (
        <>
          {results.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {results.map((r) => (
                <ResultCard key={`${r.source}-${r.externalId}`} result={r} onPick={pick} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="Nothing turned up"
              body={`No ${TYPE_LABELS[type]} matched “${debouncedQ}” on either source. Add it by hand instead.`}
              action={
                <button onClick={onManual} className="btn btn-ghost">
                  <PenLine className="h-4 w-4" aria-hidden="true" /> Add manually
                </button>
              }
            />
          )}
        </>
      )}

      {debouncedQ.trim().length < 2 && (
        <EmptyState
          icon={Search}
          title="Find something to watch"
          body="Type at least two characters. Every search checks two sources side by side."
          action={
            <button onClick={onManual} className="btn btn-ghost">
              <PenLine className="h-4 w-4" aria-hidden="true" /> Add manually
            </button>
          }
        />
      )}
    </div>
  )
}
