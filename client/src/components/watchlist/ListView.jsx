import Poster from '../ui/Poster.jsx'
import { STATUS_LABELS, TYPE_LABELS } from '../../lib/constants.js'
import { formatDate } from '../../lib/format.js'

const SORTABLE = ['title', 'releaseYear', 'rating', 'dateAdded']

export default function ListView({ items, sort, onSort, onItemClick }) {
  return (
    <div className="hairline overflow-hidden rounded-xl bg-surface/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
            <th className="px-4 py-3 font-semibold">Title</th>
            {SORTABLE.map((key) => (
              <th key={key} className="px-4 py-3 font-semibold">
                <button
                  onClick={() => onSort(key)}
                  className={`inline-flex items-center gap-1 hover:text-ink ${sort === key ? 'text-accent' : ''}`}
                >
                  {key === 'releaseYear'
                    ? 'Year'
                    : key === 'dateAdded'
                      ? 'Added'
                      : key === 'rating'
                        ? 'Rating'
                        : key}
                  <span aria-hidden="true" className="text-[10px]">
                    {sort === key ? '▾' : ''}
                  </span>
                </button>
              </th>
            ))}
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">Status</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Tags</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item._id}
              onClick={() => onItemClick(item)}
              className="cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-surface2"
            >
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded">
                    <Poster src={item.posterUrl} alt="" className="rounded" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{item.title}</p>
                    <p className="font-mono text-xs text-muted">
                      {TYPE_LABELS[item.type]}
                      <span className="mx-1 text-muted/50">·</span>
                      {formatDate(item.dateAdded)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5 font-mono text-muted">{item.releaseYear || '—'}</td>
              <td className="px-4 py-2.5 font-mono text-muted">
                {item.externalRating != null ? Number(item.externalRating).toFixed(1) : '—'}
              </td>
              <td className="hidden px-4 py-2.5 font-mono text-muted sm:table-cell">
                {formatDate(item.dateAdded)}
              </td>
              <td className="hidden px-4 py-2.5 sm:table-cell">
                <span className="chip">{STATUS_LABELS[item.status]}</span>
              </td>
              <td className="hidden px-4 py-2.5 md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {(item.tags || []).slice(0, 3).map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                  {(item.tags || []).length > 3 && (
                    <span className="chip">+{(item.tags || []).length - 3}</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
