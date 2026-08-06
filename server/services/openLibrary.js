export async function searchOpenLibrary(_type, query) {
  const url = new URL('https://openlibrary.org/search.json')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '6')
  url.searchParams.set('fields', 'key,title,first_publish_year,author_name,cover_i,subject')

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open Library responded ${res.status}`)
  const data = await res.json()

  return (data.docs || []).map((d) => ({
    source: 'openlibrary',
    externalId: String(d.key || ''),
    title: (d.title || '').trim(),
    year: d.first_publish_year ? String(d.first_publish_year) : '',
    overview: '',
    genres: (d.subject || []).slice(0, 5).map((s) => s.split(/[,(]/)[0].trim()).filter(Boolean),
    rating: null,
    posters: [
      d.cover_i
        ? { url: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`, lang: null, votes: 0 }
        : null,
    ].filter(Boolean),
  }))
}
