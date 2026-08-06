const AUTHOR_ROLES = new Set(['Story', 'Art', 'Story & Art', 'Author', 'Original Creator'])
const DIRECTOR_ROLES = new Set(['Director'])

async function fetchWithRetry(url, attempts = 2) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/vnd.api+json' } })
      if (res.ok) return res
      if ((res.status < 500 && res.status !== 429) || i === attempts - 1) {
        throw new Error(`Kitsu responded ${res.status}`)
      }
    } catch (err) {
      if (i === attempts - 1) throw err
    }
    await new Promise((r) => setTimeout(r, 1200 * (i + 1)))
  }
  throw new Error('Kitsu unavailable')
}

export async function searchKitsu(type, query) {
  const mediaType = type === 'manga' ? 'manga' : 'anime'
  const url = new URL(`https://kitsu.io/api/edge/${mediaType}`)
  url.searchParams.set('filter[text]', query)
  url.searchParams.set('page[limit]', '6')
  url.searchParams.set('include', 'staff.person,categories,genres')

  const res = await fetchWithRetry(url)
  const data = await res.json()

  const peopleById = new Map()
  const staffPersonById = new Map()
  const staffRoleById = new Map()
  for (const inc of data.included || []) {
    if (inc.type === 'people') {
      peopleById.set(inc.id, inc.attributes?.name)
    } else if (inc.type === 'mediaStaff') {
      const personId = inc.relationships?.person?.data?.id
      if (personId) staffPersonById.set(inc.id, personId)
      if (inc.attributes?.role) staffRoleById.set(inc.id, inc.attributes.role)
    }
  }
  const genreTitles = new Set(
    (data.included || [])
      .filter((i) => i.type === 'categories' || i.type === 'genres')
      .map((i) => i.attributes?.title)
      .filter(Boolean)
  )

  return (data.data || []).map((item) => {
    const a = item.attributes || {}
    const year = (a.startDate || '').slice(0, 4)
    const rating = a.averageRating ? Number((Number(a.averageRating) / 10).toFixed(1)) : null
    const posters = [a.posterImage?.large, a.posterImage?.medium, a.posterImage?.original]
      .filter(Boolean)
      .map((url) => ({ url, lang: null, votes: 0 }))
    const authors = []
    const directors = []
    for (const rel of item.relationships?.staff?.data || []) {
      const personId = staffPersonById.get(rel.id)
      if (!personId) continue
      const role = staffRoleById.get(rel.id) || ''
      const name = peopleById.get(personId)
      if (!name) continue
      if (AUTHOR_ROLES.has(role) && !authors.includes(name)) authors.push(name)
      if (DIRECTOR_ROLES.has(role) && !directors.includes(name)) directors.push(name)
    }
    return {
      source: 'kitsu',
      externalId: String(item.id || ''),
      title: (a.canonicalTitle || a.titles?.en_jp || '').trim(),
      year,
      overview: (a.synopsis || '').trim(),
      authors: authors.slice(0, 5),
      directors: directors.slice(0, 3),
      genres: [...genreTitles].slice(0, 6),
      rating,
      posters,
    }
  })
}
