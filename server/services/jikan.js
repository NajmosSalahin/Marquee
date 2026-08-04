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

export async function searchJikan(_type, query) {
  const url = new URL('https://api.jikan.moe/v4/anime')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '6')
  url.searchParams.set('order_by', 'popularity')
  url.searchParams.set('sfw', 'true')

  const res = await fetchWithRetry(url)
  const data = await res.json()

  return (data.data || []).map((a) => {
    const year = a.year || a.aired?.prop?.from?.year || (a.aired?.from || '').slice(0, 4) || ''
    const variants = [
      a.images?.jpg?.large_image_url,
      a.images?.webp?.large_image_url,
      a.images?.jpg?.image_url,
      a.images?.webp?.image_url,
    ].filter(Boolean)
    return {
      source: 'jikan',
      externalId: String(a.mal_id),
      title: (a.title_english || a.title || '').trim(),
      year: String(year),
      overview: (a.synopsis || '').trim(),
      genres: (a.genres || []).map((g) => g.name),
      rating: a.score ?? null,
      posters: [...new Set(variants)].map((url) => ({ url, lang: null, votes: 0 })),
    }
  })
}
