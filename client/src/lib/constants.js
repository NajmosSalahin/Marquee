export const STATUSES = [
  { id: 'plan_to_watch', label: 'Plan to Watch' },
  { id: 'watching', label: 'Watching' },
  { id: 'completed', label: 'Completed' },
  { id: 'on_hold', label: 'On Hold' },
  { id: 'dropped', label: 'Dropped' },
]

export const STATUS_LABELS = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]))

export const STATUS_DESCRIPTIONS = {
  plan_to_watch: 'Queued up for later',
  watching: 'Currently in progress',
  completed: 'Finished, no more to go',
  on_hold: 'Paused, might come back',
  dropped: 'Stopped watching',
}

export const TYPES = [
  { id: 'movie', label: 'Movie' },
  { id: 'tv', label: 'TV' },
  { id: 'anime', label: 'Anime' },
  { id: 'book', label: 'Book' },
  { id: 'manga', label: 'Manga' },
]

export const TYPE_LABELS = Object.fromEntries(TYPES.map((t) => [t.id, t.label]))

export const TYPE_SOURCE_HINTS = {
  movie: 'TMDB + OMDb',
  tv: 'TMDB + OMDb',
  anime: 'Jikan + AniList',
  book: 'Google Books + Open Library',
  manga: 'Jikan + AniList',
}

export const READING_STATUS_LABELS = {
  plan_to_watch: 'Plan to Read',
  watching: 'Reading',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
}

export const READING_TYPES = new Set(['book', 'manga'])

export function statusLabel(type, status) {
  return (READING_TYPES.has(type) ? READING_STATUS_LABELS : STATUS_LABELS)[status] || status
}

export const ACCENTS = [
  { id: 'amber', label: 'Marquee Amber', color: '#E3A857' },
  { id: 'crimson', label: 'Velvet Crimson', color: '#B23A48' },
  { id: 'violet', label: 'Dusk Violet', color: '#8B6FD8' },
  { id: 'emerald', label: 'Reel Emerald', color: '#3FA37B' },
  { id: 'azure', label: 'Screening Azure', color: '#4C7EDB' },
]

export const SOURCE_LABELS = {
  tmdb: 'TMDB',
  omdb: 'OMDb',
  jikan: 'Jikan',
  anilist: 'AniList',
  googlebooks: 'Google Books',
  openlibrary: 'Open Library',
  manual: 'Manual',
}

export const SORTS = [
  { id: 'dateAdded', label: 'Date added' },
  { id: 'releaseYear', label: 'Release year' },
  { id: 'rating', label: 'Rating' },
  { id: 'title', label: 'Title A–Z' },
]
