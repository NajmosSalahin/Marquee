import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { createItem } from '../../api/items.js'
import { STATUSES, STATUS_LABELS, TYPE_LABELS } from '../../lib/constants.js'
import Poster from '../ui/Poster.jsx'
import PosterPicker from './PosterPicker.jsx'
import RatingPicker from './RatingPicker.jsx'

const splitList = (text) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export default function AddForm({ type, result, onDone }) {
  const queryClient = useQueryClient()
  const existing = useQuery({ queryKey: ['items'] }).data || []

  const posterOptions = useMemo(() => {
    if (!result) return []
    const tagged = []
    for (const r of [result, ...(result.alternates || [])]) {
      for (const p of r.posters || []) {
        tagged.push({ url: p.url, source: r.source })
      }
    }
    return tagged
  }, [result])

  const ratingOptions = useMemo(() => {
    if (!result) return []
    const opts = []
    for (const r of [result, ...(result.alternates || [])]) {
      if (r.rating != null && r.rating > 0) opts.push({ source: r.source, value: r.rating })
    }
    return opts
  }, [result])

  const initialPoster = result?.posters?.[0]?.url || ''
  const initialRating = useMemo(
    () =>
      result?.rating != null && result.rating > 0
        ? { source: result.source, value: result.rating }
        : null,
    [result]
  )

  const [title, setTitle] = useState(result?.title || '')
  const [year, setYear] = useState(result?.year || '')
  const [overview, setOverview] = useState(result?.overview || '')
  const [genresText, setGenresText] = useState((result?.genres || []).join(', '))
  const [posterUrl, setPosterUrl] = useState(initialPoster)
  const [rating, setRating] = useState(initialRating)
  const [status, setStatus] = useState('plan_to_watch')
  const [notes, setNotes] = useState('')
  const [tagsText, setTagsText] = useState('')

  const duplicate = existing.find(
    (i) => i.title.toLowerCase() === title.trim().toLowerCase() && i.type === type
  )

  const mutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      toast.success('Added to Watchlist')
      queryClient.invalidateQueries({ queryKey: ['items'] })
      onDone()
    },
    onError: (err) => toast.error(err.friendlyMessage),
  })

  const canSave = title.trim().length > 0 && !mutation.isPending

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSave) return
        mutation.mutate({
          type,
          title: title.trim(),
          releaseYear: year ? Number(year) : undefined,
          overview: overview.trim(),
          genres: splitList(genresText),
          posterUrl: posterUrl || undefined,
          externalRating: rating?.value,
          ratingSource: rating?.source || 'manual',
          status,
          notes: notes.trim(),
          tags: splitList(tagsText),
          source: result?.source || 'manual',
          externalId: result?.externalId,
        })
      }}
    >
      {duplicate && (
        <div className="flex items-start gap-2.5 rounded-lg border border-accent/40 bg-accent/10 px-3.5 py-3 text-sm text-ink">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p>
            <span className="font-semibold">{duplicate.title}</span> is already on your watchlist
            {duplicate.status !== 'plan_to_watch' ? ` (${STATUS_LABELS[duplicate.status]})` : ''} —
            adding it anyway.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_1fr]">
        <Poster src={posterUrl} alt="Selected poster" className="rounded-lg" />
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="af-title">
              Title
            </label>
            <input
              id="af-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="af-year">
                Year
              </label>
              <input
                id="af-year"
                className="input font-mono"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                inputMode="numeric"
                maxLength={4}
              />
            </div>
            <div>
              <label className="label" htmlFor="af-status">
                Status
              </label>
              <select
                id="af-status"
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="af-genres">
          Genres
        </label>
        <input
          id="af-genres"
          className="input"
          value={genresText}
          onChange={(e) => setGenresText(e.target.value)}
          placeholder="Drama, Sci-Fi"
        />
      </div>

      <div>
        <label className="label" htmlFor="af-overview">
          Synopsis
        </label>
        <textarea
          id="af-overview"
          className="input min-h-24 resize-y"
          value={overview}
          onChange={(e) => setOverview(e.target.value)}
          placeholder="A few lines about the title…"
        />
      </div>

      <div>
        <span className="label">Poster</span>
        <PosterPicker options={posterOptions} value={posterUrl} onChange={setPosterUrl} />
      </div>

      <div>
        <span className="label">Rating</span>
        <RatingPicker options={ratingOptions} value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="af-tags">
            Tags
          </label>
          <input
            id="af-tags"
            className="input"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="rewatch, favorite"
          />
        </div>
        <div>
          <label className="label" htmlFor="af-notes">
            Notes
          </label>
          <input
            id="af-notes"
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything worth remembering"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <button type="button" onClick={onDone} className="btn btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={!canSave} className="btn btn-accent disabled:opacity-50">
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Add to Watchlist
        </button>
      </div>
    </form>
  )
}
