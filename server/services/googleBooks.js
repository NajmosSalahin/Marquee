async function fetchWithRetry(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return res
      if ((res.status < 500 && res.status !== 429) || i === attempts - 1) {
        throw new Error(`Google Books responded ${res.status}`)
      }
    } catch (err) {
      if (i === attempts - 1) throw err
    }
    await new Promise((r) => setTimeout(r, 1500 * 2 ** i))
  }
  throw new Error('Google Books unavailable')
}

export async function searchGoogleBooks(_type, query, opts = {}) {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', opts.author ? `inauthor:${query}` : query)
  url.searchParams.set('maxResults', '6')
  url.searchParams.set('langRestrict', 'en')
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  if (apiKey) url.searchParams.set('key', apiKey)

  const res = await fetchWithRetry(url)
  const data = await res.json()

  return (data.items || []).map((item) => {
    const v = item.volumeInfo || {}
    const thumb = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail
    const year = (v.publishedDate || '').slice(0, 4)
    const rating = v.averageRating ? Number((v.averageRating * 2).toFixed(1)) : null
    return {
      source: 'googlebooks',
      externalId: String(item.id || ''),
      title: (v.title || '').trim(),
      year,
      overview: (v.description || '').trim(),
      authors: (v.authors || []).slice(0, 5),
      publisher: v.publisher || '',
      genres: (v.categories || []).map((c) => c.split(' / ')[0].trim()),
      rating,
      posters: [thumb]
        .filter(Boolean)
        .map((url) => ({ url: url.replace('zoom=1&edge=curl', 'zoom=2'), lang: null, votes: 0 })),
    }
  })
}
