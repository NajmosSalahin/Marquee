import { SOURCE_LABELS } from '../../lib/constants.js'

export default function RatingPicker({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = value?.source === o.source
        return (
          <button
            key={o.source}
            type="button"
            onClick={() => onChange({ source: o.source, value: o.value })}
            aria-pressed={selected}
            className={`rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors ${
              selected
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-line bg-surface text-ink hover:border-accent/50'
            }`}
          >
            {Number.isFinite(o.value) ? Number(o.value).toFixed(1) : '—'}
            <span className="ml-1.5 font-sans text-xs text-muted">· {SOURCE_LABELS[o.source]}</span>
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={!value}
        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
          !value
            ? 'border-accent bg-accent/15 text-accent'
            : 'border-line bg-surface text-muted hover:border-accent/50'
        }`}
      >
        No rating
      </button>
    </div>
  )
}
