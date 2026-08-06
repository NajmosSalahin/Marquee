const ENDPOINT = 'https://graphql.anilist.co'

const CHARACTERS = `
      characters(sort: FAVOURITES_DESC, perPage: 10) {
        edges {
          role
          va: voiceActors(language: JAPANESE) { id name { full } }
          node { name { full } }
        }
      }
      staff(sort: FAVOURITES_DESC) { edges { role node { name { full } } } }
      studios { nodes { name } }`

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
      ${CHARACTERS}
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
          ${CHARACTERS}
        }
      }
    }
  }
}`

const DIRECTOR_RE = /^Director$/
const WRITER_RE = /\b(Story|Script|Screenplay|Writer|Author|Art)\b/i

function stripMarkup(text) {
  return (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function mapMedia(m, type) {
  const staff = m.staff?.edges || []
  const directors = staff
    .filter((e) => e.role && DIRECTOR_RE.test(e.role))
    .map((e) => e?.node?.name?.full)
    .filter(Boolean)
  const writers = staff
    .filter((e) => e.role && WRITER_RE.test(e.role))
    .map((e) => e?.node?.name?.full)
    .filter(Boolean)
    .filter((n) => !directors.includes(n))
  const cast =
    type === 'anime'
      ? (m.characters?.edges || []).slice(0, 10).map((e, i) => {
          const character = e?.node?.name?.full
          const va = e?.va?.[0]?.name?.full
          return {
            name: va || character,
            character: va ? character : undefined,
            role: e?.role || undefined,
            order: i,
          }
        })
      : []
  return {
    source: 'anilist',
    externalId: String(m.id),
    title: (m.title?.english || m.title?.romaji || '').trim(),
    year: m.startDate?.year ? String(m.startDate.year) : '',
    overview: stripMarkup(m.description),
    authors: [...new Set(writers.slice(0, 5))],
    directors: [...new Set(directors.slice(0, 3))],
    studios: (m.studios?.nodes || []).map((s) => s.name).slice(0, 5),
    cast,
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
    if (media.length > 0) return media.map((m) => mapMedia(m, 'manga'))
  }
  return []
}

export async function searchAnilist(type, query, opts = {}) {
  if (type === 'manga' && opts.author) return searchMangaByAuthor(query)

  const mediaType = type === 'manga' ? 'MANGA' : 'ANIME'
  const data = await gql(QUERY, { search: query, type: mediaType })
  return (data?.data?.Page?.media || []).map((m) => mapMedia(m, type))
}
