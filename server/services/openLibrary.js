export async function searchOpenLibrary(_type, query, opts = {}) {
  const url = new URL('https://openlibrary.org/search.json')
  url.searchParams.set('q', opts.author ? `author:${query}` : query)
  url.searchParams.set('limit', '6')
  url.searchParams.set('fields', 'key,title,first_publish_year,author_name,cover_i,subject,publisher')

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open Library responded ${res.status}`)
  const data = await res.json()

  return (data.docs || []).map((d) => ({
    source: 'openlibrary',
    externalId: String(d.key || ''),
    title: (d.title || '').trim(),
    year: d.first_publish_year ? String(d.first_publish_year) : '',
    overview: '',
    authors: (d.author_name || []).slice(0, 5),
    publisher: (d.publisher || [])[0] || '',
    genres: (d.subject || []).slice(0, 5).map((s) => s.split(/[,(]/)[0].trim()).filter(Boolean),
    rating: null,
    posters: [
      d.cover_i
        ? { url: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`, lang: null, votes: 0 }
        : null,
    ].filter(Boolean),
  }))
}
