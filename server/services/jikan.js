async function fetchWithRetry(url, attempts = 2) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return res
      if (res.status < 500 || i === attempts - 1) throw new Error(`Jikan responded ${res.status}`)
    } catch (err) {
      if (i === attempts - 1) throw err
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error('Jikan unavailable')
}

const yearOf = (a) => {
  const published = a.published || a.aired
  return a.year || published?.prop?.from?.year || (published?.from || '').slice(0, 4) || ''
}

const posterVariants = (a) =>
  [
    a.images?.jpg?.large_image_url,
    a.images?.webp?.large_image_url,
    a.images?.jpg?.image_url,
    a.images?.webp?.image_url,
  ].filter(Boolean)

const toResult = (a, extraAuthors = []) => ({
  source: 'jikan',
  externalId: String(a.mal_id ?? ''),
  title: (a.title_english || a.title || '').trim(),
  year: String(yearOf(a)),
  overview: (a.synopsis || '').trim(),
  authors: [...extraAuthors, ...(a.authors || []).map((x) => x.name)].slice(0, 5),
  studios: (a.studios || []).map((s) => s.name).slice(0, 5),
  genres: (a.genres || []).map((g) => g.name),
  rating: a.score ?? null,
  posters: [...new Set(posterVariants(a))].map((url) => ({ url, lang: null, votes: 0 })),
})

async function searchJikanMangaByAuthor(query) {
  const personUrl = new URL('https://api.jikan.moe/v4/people')
  personUrl.searchParams.set('q', query)
  personUrl.searchParams.set('limit', '1')
  const personRes = await fetchWithRetry(personUrl)
  const personData = await personRes.json()
  const person = personData.data?.[0]
  if (!person) return []

  const mangaUrl = new URL(`https://api.jikan.moe/v4/people/${person.mal_id}/manga`)
  const mangaRes = await fetchWithRetry(mangaUrl)
  const mangaData = await mangaRes.json()

  return (mangaData.data || []).slice(0, 6).map((entry) => toResult(entry.manga || {}, [person.name]))
}

export async function searchJikan(type, query, opts = {}) {
  if (type === 'manga' && opts.author) return searchJikanMangaByAuthor(query)

  const mediaType = type === 'manga' ? 'manga' : 'anime'
  const url = new URL(`https://api.jikan.moe/v4/${mediaType}`)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '6')
  url.searchParams.set('order_by', 'popularity')
  url.searchParams.set('sfw', 'true')

  const res = await fetchWithRetry(url)
  const data = await res.json()

  return (data.data || []).map((a) => toResult(a))
}
