export const STATUSES = [
  { id: 'plan_to_watch', label: 'Plan to Watch' },
  { id: 'watching', label: 'Watching' },
  { id: 'completed', label: 'Completed' },
  { id: 'on_hold', label: 'On Hold' },
  { id: 'dropped', label: 'Dropped' },
]

export const STATUS_LABELS = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]))

export const TYPES = [
  { id: 'movie', label: 'Movie' },
  { id: 'tv', label: 'TV' },
  { id: 'anime', label: 'Anime' },
]

export const TYPE_LABELS = Object.fromEntries(TYPES.map((t) => [t.id, t.label]))

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
  manual: 'Manual',
}

export const SORTS = [
  { id: 'dateAdded', label: 'Date added' },
  { id: 'releaseYear', label: 'Release year' },
  { id: 'rating', label: 'Rating' },
  { id: 'title', label: 'Title A–Z' },
]
