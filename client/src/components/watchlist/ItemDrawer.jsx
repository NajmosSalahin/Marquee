import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CalendarDays, Loader2, Trash2, X, BookOpen } from 'lucide-react'
import { deleteItem, updateItem } from '../../api/items.js'
import { searchTitle } from '../../api/search.js'
import { SOURCE_LABELS, STATUSES, TYPE_LABELS, statusLabel } from '../../lib/constants.js'
import { formatDate } from '../../lib/format.js'
import Poster from '../ui/Poster.jsx'
import SourceBadge from '../ui/SourceBadge.jsx'
import PosterPicker from '../add/PosterPicker.jsx'
import RatingPicker from '../add/RatingPicker.jsx'

const splitList = (text) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export default function ItemDrawer({ item, onClose }) {
  const queryClient = useQueryClient()
  const allItems = useMemo(() => queryClient.getQueryData(['items']) || [], [queryClient])

  const [status, setStatus] = useState(item?.status || 'plan_to_watch')
  const [notes, setNotes] = useState(item?.notes || '')
  const [tagsText, setTagsText] = useState((item?.tags || []).join(', '))
  const [posterUrl, setPosterUrl] = useState(item?.posterUrl || '')
  const [rating, setRating] = useState(
    item?.externalRating != null
      ? { source: item.ratingSource || 'manual', value: item.externalRating }
      : null
  )
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (!item) return
    setStatus(item.status || 'plan_to_watch')
    setNotes(item.notes || '')
    setTagsText((item.tags || []).join(', '))
    setPosterUrl(item.posterUrl || '')
    setRating(
      item.externalRating != null
        ? { source: item.ratingSource || 'manual', value: item.externalRating }
        : null
    )
    setConfirmingDelete(false)
  }, [item])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (item) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [item, onClose])

  const search = useQuery({
    queryKey: ['search', item?.type, item?.title],
    queryFn: () => searchTitle(item.type, item.title),
    enabled: Boolean(item),
    staleTime: 10 * 60 * 1000,
  })

  const posterOptions = useMemo(() => {
    const opts = []
    if (posterUrl) opts.push({ url: posterUrl, source: item?.source || 'manual' })
    const results = search.data?.results || []
    for (const r of results) {
      for (const alt of [r, ...(r.alternates || [])]) {
        for (const p of alt.posters || []) opts.push({ url: p.url, source: alt.source })
      }
    }
    return opts
  }, [search.data, posterUrl, item?.source])

  const ratingOptions = useMemo(() => {
    const opts = []
    if (item?.externalRating != null)
      opts.push({ source: item.ratingSource || 'manual', value: item.externalRating })
    const results = search.data?.results || []
    for (const r of results) {
      for (const alt of [r, ...(r.alternates || [])]) {
        if (alt.rating != null && alt.rating > 0)
          opts.push({ source: alt.source, value: alt.rating })
      }
    }
    return opts
  }, [search.data, item?.externalRating, item?.ratingSource])

  const allTags = useMemo(() => {
    const set = new Set()
    for (const i of allItems) for (const t of i.tags || []) set.add(t)
    return [...set].sort()
  }, [allItems])

  const save = useMutation({
    mutationFn: (payload) => updateItem(item._id, payload),
    onSuccess: () => {
      toast.success('Saved')
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
    onError: (err) => toast.error(err.friendlyMessage),
  })

  const remove = useMutation({
    mutationFn: () => deleteItem(item._id),
    onSuccess: () => {
      toast.success('Removed from your collection')
      queryClient.invalidateQueries({ queryKey: ['items'] })
      onClose()
    },
    onError: (err) => toast.error(err.friendlyMessage),
  })

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-label="Close details"
          />
          <motion.aside
            role="dialog"
            aria-label={`${item.title} details`}
            className="relative flex h-full w-full max-w-xl flex-col bg-surface"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
          >
            <header className="flex items-center gap-3 border-b border-line px-5 py-4">
              <h2 className="min-w-0 flex-1 truncate font-display text-xl font-semibold text-ink">
                {item.title}
              </h2>
              <button onClick={onClose} className="btn btn-quiet p-2" aria-label="Close">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex gap-5">
                <div className="w-32 shrink-0 sm:w-40">
                  <Poster
                    src={item.posterUrl}
                    alt={item.title}
                    className="rounded-lg shadow-card"
                    icon={
                      item.type === 'book' || item.type === 'manga' ? BookOpen : undefined
                    }
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <SourceBadge source={item.source} />
                    <span className="chip">{TYPE_LABELS[item.type]}</span>
                    {item.releaseYear && (
                      <span className="font-mono text-sm text-muted">{item.releaseYear}</span>
                    )}
                  </div>
                  {item.externalRating != null && (
                    <p className="font-mono text-2xl font-semibold text-ink">
                      {Number(item.externalRating).toFixed(1)}
                      <span className="ml-2 align-middle font-sans text-xs font-medium text-muted">
                        · {SOURCE_LABELS[item.ratingSource || 'manual']}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-muted">
                    <CalendarDays
                      className="mr-1 inline h-3.5 w-3.5 align-[-2px]"
                      aria-hidden="true"
                    />
                    Added {formatDate(item.dateAdded)}
                    {item.dateCompleted && ` · Completed ${formatDate(item.dateCompleted)}`}
                  </p>
                  {(item.genres || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {(item.genres || []).map((g) => (
                        <span key={g} className="chip">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {item.overview && (
                <p className="mt-5 text-sm leading-relaxed text-muted">{item.overview}</p>
              )}

              <div className="mt-6 space-y-5">
                <div>
                  <label className="label" htmlFor="d-status">
                    Status
                  </label>
                  <select
                    id="d-status"
                    className="input"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value)
                      save.mutate({ status: e.target.value })
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {statusLabel(item.type, s.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="label">Poster</span>
                  <PosterPicker options={posterOptions} value={posterUrl} onChange={setPosterUrl} />
                </div>

                <div>
                  <span className="label">Rating</span>
                  <RatingPicker options={ratingOptions} value={rating} onChange={setRating} />
                </div>

                <div>
                  <label className="label" htmlFor="d-tags">
                    Tags
                  </label>
                  <input
                    id="d-tags"
                    className="input"
                    list="tag-options"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="rewatch, favorite"
                  />
                  <datalist id="tag-options">
                    {allTags.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="label" htmlFor="d-notes">
                    Notes
                  </label>
                  <textarea
                    id="d-notes"
                    className="input min-h-20 resize-y"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything worth remembering"
                  />
                </div>
              </div>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
              {confirmingDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">Delete for good?</span>
                  <button
                    onClick={() => remove.mutate()}
                    className="btn bg-red-500/15 text-red-300 hover:bg-red-500/25"
                    disabled={remove.isPending}
                  >
                    {remove.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}{' '}
                    Delete
                  </button>
                  <button onClick={() => setConfirmingDelete(false)} className="btn btn-ghost">
                    Keep
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="btn btn-quiet"
                  aria-label="Delete item"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    save.mutate({
                      notes: notes.trim(),
                      tags: splitList(tagsText),
                      posterUrl: posterUrl || null,
                      externalRating: rating?.value ?? null,
                      ratingSource: rating?.source || 'manual',
                    })
                  }}
                  className="btn btn-accent"
                  disabled={save.isPending}
                >
                  {save.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  Save
                </button>
              </div>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
