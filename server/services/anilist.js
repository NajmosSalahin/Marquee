const ENDPOINT = 'https://graphql.anilist.co'

const QUERY = `
query ($search: String, $type: MediaType) {
  Page(page: 1, perPage: 6) {
    media(search: $search, type: $type, format_not: NOVEL, sort: POPULARITY_DESC) {
      id
      title { romaji english native }
      coverImage { extraLarge large medium }
      averageScore
      description(asHtml: false)
      genres
      startDate { year }
    }
  }
}`

function stripMarkup(text) {
  return (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function searchAnilist(type, query) {
  const mediaType = type === 'manga' ? 'MANGA' : 'ANIME'
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { search: query, type: mediaType } }),
  })
  if (!res.ok) throw new Error(`AniList responded ${res.status}`)
  const data = await res.json()

  const media = data?.data?.Page?.media || []
  return media.map((m) => ({
    source: 'anilist',
    externalId: String(m.id),
    title: (m.title?.english || m.title?.romaji || '').trim(),
    year: m.startDate?.year ? String(m.startDate.year) : '',
    overview: stripMarkup(m.description),
    genres: m.genres || [],
    rating: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : null,
    posters: [m.coverImage?.extraLarge, m.coverImage?.large, m.coverImage?.medium]
      .filter(Boolean)
      .map((url) => ({ url, lang: null, votes: 0 })),
  }))
}
