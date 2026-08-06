import { BookOpen } from 'lucide-react'
import Poster from '../ui/Poster.jsx'
import { TYPE_LABELS } from '../../lib/constants.js'

export default function ItemCard({ item, onClick, className = '', showMeta = true }) {
  const rating = item.externalRating
  const fallbackIcon = item.type === 'book' || item.type === 'manga' ? BookOpen : undefined
  return (
    <div className={className}>
      <button
        onClick={onClick}
        className="poster-glow group relative block w-full overflow-hidden rounded-lg bg-surface text-left"
        aria-label={`${item.title} (${item.releaseYear || 'unknown year'}) — ${TYPE_LABELS[item.type]}`}
      >
        <Poster src={item.posterUrl} alt={item.title} icon={fallbackIcon} />
        {rating != null && (
          <span className="absolute right-1.5 top-1.5 rounded bg-base/85 px-1.5 py-0.5 font-mono text-xs font-semibold text-ink ring-1 ring-line/60">
            {Number(rating).toFixed(1)}
          </span>
        )}
        {!item.posterUrl && (
          <span className="absolute inset-x-0 bottom-0 truncate bg-base/70 px-2 py-1 text-xs font-semibold text-ink">
            {item.title}
          </span>
        )}
      </button>
      {showMeta && (
        <div className="mt-1.5 min-w-0">
          <p className="truncate text-sm font-semibold text-ink group-hover:text-accent">
            {item.title}
          </p>
          {(item.type === 'book' || item.type === 'manga') && (item.authors || []).length > 0 && (
            <p className="truncate text-xs text-muted/80">By {item.authors.join(', ')}</p>
          )}
          {item.type !== 'book' && item.type !== 'manga' && (item.directors || []).length > 0 && (
            <p className="truncate text-xs text-muted/80">Directed by {item.directors.join(', ')}</p>
          )}
          <p className="font-mono text-xs text-muted">
            {item.releaseYear || '—'}
            <span className="mx-1 text-muted/50">·</span>
            {TYPE_LABELS[item.type]}
          </p>
        </div>
      )}
    </div>
  )
}
