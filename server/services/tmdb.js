const BASE = 'https://api.themoviedb.org/3'
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'

async function fetchJson(path, params = {}) {
  const url = new URL(BASE + path)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const headers = { accept: 'application/json' }
  if (process.env.TMDB_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
  } else if (process.env.TMDB_API_KEY) {
    url.searchParams.set('api_key', process.env.TMDB_API_KEY)
  } else {
    throw new Error('TMDB credentials missing')
  }
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`TMDB responded ${res.status}`)
  return res.json()
}

export async function searchTmdb(type, query) {
  const mediaType = type === 'movie' ? 'movie' : 'tv'
  const res = await fetchJson(`/search/${mediaType}`, { query, language: 'en-US', page: 1 })
  const results = (res.results || []).slice(0, 6)

  const items = await Promise.all(
    results.map(async (r) => {
      const [detail, images] = await Promise.allSettled([
        fetchJson(`/${mediaType}/${r.id}`, { language: 'en-US' }),
        fetchJson(`/${mediaType}/${r.id}/images`, {
          include_image_language: 'null,en,hi,ja,ko,zh,fr,es,de,it,pt,ar,ru',
        }),
      ])
      const d = detail.status === 'fulfilled' ? detail.value : r
      const posters =
        images.status === 'fulfilled'
          ? images.value.posters
              .slice()
              .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
              .slice(0, 12)
              .map((p) => ({
                url: `${POSTER_BASE}${p.file_path}`,
                lang: p.iso_639_1,
                votes: p.vote_count,
              }))
          : []
      if (!posters.length && r.poster_path) {
        posters.push({ url: `${POSTER_BASE}${r.poster_path}`, lang: null, votes: 0 })
      }
      return {
        source: 'tmdb',
        externalId: String(r.id),
        title: (d.title || d.name || r.title || r.name || '').trim(),
        year: (d.release_date || d.first_air_date || '').slice(0, 4),
        overview: (d.overview || r.overview || '').trim(),
        genres: (d.genres || []).map((g) => g.name),
        rating: d.vote_average || r.vote_average || null,
        posters,
      }
    })
  )

  return items.filter((i) => i.title)
}
