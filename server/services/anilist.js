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
      staff(sort: FAVOURITES_DESC) { nodes { name { full } } }
    }
  }
}`

const AUTHOR_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 5) {
    staff(search: $search) {
      id
      name { full }
      staffMedia(page: 1, perPage: 6, type: MANGA, sort: POPULARITY_DESC) {
        nodes {
          format
          id
          title { romaji english native }
          coverImage { extraLarge large medium }
          averageScore
          description(asHtml: false)
          genres
          startDate { year }
          staff(sort: FAVOURITES_DESC) { nodes { name { full } } }
        }
      }
    }
  }
}`

function stripMarkup(text) {
  return (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mapMedia(m) {
  return {
    source: 'anilist',
    externalId: String(m.id),
    title: (m.title?.english || m.title?.romaji || '').trim(),
    year: m.startDate?.year ? String(m.startDate.year) : '',
    overview: stripMarkup(m.description),
    authors: (m.staff?.nodes || []).slice(0, 5).map((n) => n.name?.full).filter(Boolean),
    genres: m.genres || [],
    rating: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : null,
    posters: [m.coverImage?.extraLarge, m.coverImage?.large, m.coverImage?.medium]
      .filter(Boolean)
      .map((url) => ({ url, lang: null, votes: 0 })),
  }
}

async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`AniList responded ${res.status}`)
  return res.json()
}

async function searchMangaByAuthor(query) {
  const data = await gql(AUTHOR_QUERY, { search: query })
  const staff = data?.data?.Page?.staff || []
  for (const person of staff) {
    const media = (person.staffMedia?.nodes || []).filter((m) => m.format !== 'NOVEL')
    if (media.length > 0) return media.map(mapMedia)
  }
  return []
}

export async function searchAnilist(type, query, opts = {}) {
  if (type === 'manga' && opts.author) return searchMangaByAuthor(query)

  const mediaType = type === 'manga' ? 'MANGA' : 'ANIME'
  const data = await gql(QUERY, { search: query, type: mediaType })
  return (data?.data?.Page?.media || []).map(mapMedia)
}
