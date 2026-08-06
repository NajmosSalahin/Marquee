import { searchTmdb } from './tmdb.js'
import { searchOmdb } from './omdb.js'
import { searchJikan } from './jikan.js'
import { searchAnilist } from './anilist.js'
import { searchGoogleBooks } from './googleBooks.js'
import { searchOpenLibrary } from './openLibrary.js'
import { getCached, setCached } from '../utils/cache.js'

const SOURCE_MAP = {
  movie: [searchTmdb, searchOmdb],
  tv: [searchTmdb, searchOmdb],
  anime: [searchJikan, searchAnilist],
  book: [searchGoogleBooks, searchOpenLibrary],
  manga: [searchJikan, searchAnilist],
}

export async function search(type, query) {
  const cacheKey = `search:${type}:${query.toLowerCase()}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const sources = SOURCE_MAP[type] || []
  const settled = await Promise.allSettled(sources.map((fn) => fn(type, query)))

  const sourceErrors = settled
    .map((r) => (r.status === 'rejected' ? `${r.reason?.message || 'source failed'}` : null))
    .filter(Boolean)

  const found = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))

  const results = found.map((result) => ({
    ...result,
    alternates: found.filter(
      (o) =>
        o.source !== result.source &&
        o.title.toLowerCase() === result.title.toLowerCase() &&
        (o.year === result.year || !o.year || !result.year)
    ),
  }))

  const payload = { results, sourceErrors }
  setCached(cacheKey, payload)
  return payload
}
