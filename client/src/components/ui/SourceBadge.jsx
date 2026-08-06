import { SOURCE_LABELS } from '../../lib/constants.js'

const SOURCE_STYLE = {
  tmdb: 'text-sky-300/90',
  omdb: 'text-amber-300/90',
  jikan: 'text-violet-300/90',
  anilist: 'text-teal-300/90',
  kitsu: 'text-pink-300/90',
  googlebooks: 'text-blue-300/90',
  openlibrary: 'text-orange-300/90',
  manual: 'text-muted',
}

export default function SourceBadge({ source, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded border border-line bg-base/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${
        SOURCE_STYLE[source] || 'text-muted'
      } ${className}`}
    >
      {SOURCE_LABELS[source] || source}
    </span>
  )
}
