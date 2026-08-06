const BASE = 'https://www.omdbapi.com'

async function fetchJson(params = {}) {
  const url = new URL(BASE)
  url.searchParams.set('apikey', process.env.OMDB_API_KEY)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OMDb responded ${res.status}`)
  return res.json()
}

function parseScore(value) {
  const n = parseFloat(value)
  return Number.isNaN(n) ? null : n
}

export async function searchOmdb(type, query) {
  const omdbType = type === 'movie' ? 'movie' : type === 'tv' ? 'series' : null
  const res = await fetchJson({ s: query, type: omdbType })
  if (res.Response === 'False' || !res.Search) return []

  const items = await Promise.all(
    res.Search.slice(0, 6).map(async (r, idx) => {
      const detail =
        idx < 3 ? await fetchJson({ i: r.imdbID, plot: 'short' }).catch(() => null) : null
      const d = detail && detail.Response !== 'False' ? detail : r
      const ratings = (d.Ratings || []).reduce((acc, x) => ({ ...acc, [x.Source]: x.Value }), {})
      const imdb = parseScore(d.imdbRating)
      const splitCredits = (v) =>
        v && v !== 'N/A'
          ? v.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      return {
        source: 'omdb',
        externalId: d.imdbID || r.imdbID,
        title: (d.Title || r.Title || '').trim(),
        year: (d.Year || '').slice(0, 4),
        overview: d.Plot && d.Plot !== 'N/A' ? d.Plot : '',
        genres: (d.Genre || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        authors: splitCredits(d.Writer),
        directors: splitCredits(d.Director),
        studios: splitCredits(d.Studio),
        cast: splitCredits(d.Actors).map((name, i) => ({
          name,
          character: undefined,
          role: undefined,
          order: i,
        })),
        rating: imdb,
        extraRatings: [
          ratings['Rotten Tomatoes']
            ? { source: 'Rotten Tomatoes', value: ratings['Rotten Tomatoes'] }
            : null,
          ratings['Metacritic'] ? { source: 'Metacritic', value: ratings['Metacritic'] } : null,
        ].filter(Boolean),
        posters: d.Poster && d.Poster !== 'N/A' ? [{ url: d.Poster, lang: null, votes: 0 }] : [],
      }
    })
  )

  return items.filter((i) => i.title)
}
