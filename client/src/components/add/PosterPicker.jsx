import { Film } from 'lucide-react'
import Poster from '../ui/Poster.jsx'
import SourceBadge from '../ui/SourceBadge.jsx'

export default function PosterPicker({ options, value, onChange }) {
  const seen = new Set()
  const unique = options
    .filter((o) => {
      if (!o.url || seen.has(o.url)) return false
      seen.add(o.url)
      return true
    })
    .slice(0, 10)

  if (!unique.length) {
    return (
      <p className="text-sm text-muted">
        No posters found — add one later if a better one turns up.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {unique.map((o) => {
        const selected = value === o.url
        return (
          <button
            key={o.url}
            type="button"
            onClick={() => onChange(o.url)}
            className={`group relative overflow-hidden rounded-md transition-shadow ${
              selected ? 'shadow-glow-sm' : 'hover:shadow-glow-sm'
            }`}
            aria-pressed={selected}
            aria-label={`Use poster ${o.title || ''}`}
          >
            <Poster src={o.url} alt="" />
            <SourceBadge source={o.source} className="absolute left-1 top-1" />
            {selected && (
              <span className="absolute inset-0 ring-2 ring-accent ring-inset" aria-hidden="true" />
            )}
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`group relative flex aspect-[2/3] w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-md border transition-colors ${
          !value ? 'border-accent ring-1 ring-accent' : 'border-line hover:border-accent/60'
        }`}
        aria-pressed={!value}
        aria-label="No poster"
      >
        <Film className="h-6 w-6 text-muted/60" aria-hidden="true" />
        <span className="text-[10px] font-semibold text-muted">No poster</span>
      </button>
    </div>
  )
}
