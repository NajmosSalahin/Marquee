# Marquee — a personal watchlist for movies, TV, and anime

Build a full-stack MERN web app called **Marquee** (rename it if you like — nothing below depends on the name). It's a multi-user watchlist manager: each person creates an account and keeps their own private collection of movies, TV series, and anime, adding titles either by searching free external APIs — comparing results across two sources per category so the person can pick the best match, rating, and poster before saving — or by typing them in manually. The product should feel closer to a boutique streaming service than a spreadsheet — minimal, dark, cinematic, fast.

If anything below is ambiguous, make the tasteful, reasonable call yourself and keep building — note the assumption in your summary rather than stopping to ask.

---

## 1. Tech stack

**Client:** React 18 + Vite · React Router v6 · Tailwind CSS · Framer Motion · TanStack Query (server state/caching) · Zustand (UI state: filters, view mode) · Axios · dnd-kit (drag-and-drop) · lucide-react (icons) · sonner (notifications)

**Server:** Node.js + Express · MongoDB + Mongoose · jsonwebtoken + bcryptjs · cookie-parser · express-validator (or zod) · helmet, cors, express-rate-limit · dotenv

**Dev tooling:** concurrently (run client + server together) · nodemon · ESLint + Prettier

Route every external API call through the Express server — never call TMDB, OMDb, Jikan, or AniList directly from the browser, so keys stay private and there's one place to throttle, cache, and merge results across sources.

## 2. External APIs (free, for auto-fetch & compare)

Each type queries **two** sources in parallel and merges the results — so a title missing from one source still turns up, ratings and posters can be compared side by side, and one flaky API is never a dead end.

| Source                                          | Covers                                                     | Key needed                                           | Notes                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [TMDB](https://www.themoviedb.org/settings/api) | Movies & TV — primary                                      | Free — register a Developer key at Settings → API    | Free for non-commercial use with attribution. Use `/search/movie`, `/search/tv`; posters come from `image.tmdb.org/t/p/w500{poster_path}`. Don't stop at the single default poster — `/movie/{id}/images` and `/tv/{id}/images` return the _whole_ set of community-uploaded posters (different crops, languages, fan uploads) sorted by vote, which is usually where the sharper option is hiding. |
| [OMDb](https://www.omdbapi.com/apikey.aspx)     | Movies & TV — secondary (fallback + rating/poster compare) | Free — request by email, key arrives within the hour | 1,000 requests/day on the free tier (a small Patreon donation raises it — not needed here). Backed by IMDb; one lookup returns IMDb, Rotten Tomatoes, _and_ Metacritic scores plus its own poster, so it doubles as a fallback when TMDB has no match and a second opinion on rating/poster.                                                                                                        |
| [Jikan v4](https://docs.api.jikan.moe/)         | Anime — primary                                            | None — fully open                                    | `https://api.jikan.moe/v4/anime?q=...`. Rate limit ≈ 3 req/sec, 60/min — debounce search input (~400ms) and cache results server-side.                                                                                                                                                                                                                                                              |
| [AniList](https://docs.anilist.co/)             | Anime — secondary (fallback + higher-res covers)           | None — GraphQL, no auth for public queries           | Single endpoint: `https://graphql.anilist.co` (POST). Rate limit 90 req/min. `coverImage` returns `extraLarge / large / medium` variants — often crisper than MAL's own art — and it's a second net for anime Jikan comes up empty on.                                                                                                                                                              |

**Search & merge logic:** the backend fires both sources for a given `type` in parallel and normalizes each into one shape (title, year, poster options, overview, genres, rating + its source, external id) — see §5 for how these surface as choices in the UI. If one source errors or times out, still return whatever the other found; if both come back empty, let the client fall through to "Add manually."

## 3. Data models (Mongoose)

**User**

```js
{
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  preferences: {
    accentColor: { type: String, default: 'amber' }, // amber | crimson | violet | emerald | azure
    defaultView: { type: String, default: 'board' },  // board | grid | list
    density: { type: String, default: 'comfortable' } // comfortable | compact
  },
  createdAt: { type: Date, default: Date.now }
}
```

**WatchlistItem**

```js
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['movie', 'tv', 'anime'], required: true },
  title: { type: String, required: true },
  posterUrl: String,        // whichever poster the user picked — see the poster picker in §5
  overview: String,
  releaseYear: Number,
  genres: [String],
  externalRating: Number,   // whichever source's rating the user picked — no personal 1–5 rating, see §12 note
  ratingSource: String,     // 'tmdb' | 'omdb' | 'jikan' | 'anilist' | 'manual' — independent of `source`, since the rating can be swapped on its own
  status: { type: String, enum: ['plan_to_watch','watching','completed','on_hold','dropped'], default: 'plan_to_watch' },
  notes: String,
  tags: [String],
  source: { type: String, enum: ['tmdb','omdb','jikan','anilist','manual'], default: 'manual' },
  externalId: String,       // id from the chosen source, for de-duping repeat adds
  order: { type: Number, default: 0 },
  dateAdded: { type: Date, default: Date.now },
  dateCompleted: Date
}
```

## 4. Auth & multi-user isolation

- JWT on login/register, set as an **httpOnly, secure, sameSite=strict cookie** — not localStorage, so a stray XSS bug can't walk off with the token.
- Passwords hashed with bcrypt (12 rounds).
- `authMiddleware` verifies the cookie and attaches `req.userId`; **every** WatchlistItem query and mutation filters by it. One user should never be able to read or edit another's list, including by guessing an item id.
- Rate-limit `/auth/login` and `/auth/register` to blunt brute force.
- Frontend: an auth context/hook wraps the app; unauthenticated users land on `/login`.

## 5. Core features

**Search & add** — pick a type (Movie / TV / Anime), debounced search hits both sources for that type in parallel (TMDB + OMDb for Movie/TV, Jikan + AniList for Anime). Results render as a poster-thumbnail grid with a small source badge per card — a title found on both sources shows as two cards side by side, so there's a real choice rather than a silent merge. Clicking a card opens a pre-filled add form using that source's data (title, year, overview, genres — all still hand-editable). Poster and rating each get their own compact picker inside the form, showing every option found across sources for that title (TMDB's `/images` endpoint alone usually surfaces several posters) — so the poster and the rating can be swapped independently of which source's card was clicked. "Add manually" skips search entirely. Neither source has anything for a query → the empty state points straight at "Add manually," never a dead end. Warn (don't hard-block) on duplicate adds of the same title.

**Three views, one dataset**

- _Board_ (default) — columns per status, drag cards between columns and reorder within one, via dnd-kit.
- _Grid_ — poster wall, Letterboxd/streaming-service style.
- _List_ — compact sortable table.

View choice is saved to `preferences.defaultView`.

**Item detail** — click a card to open a drawer: full poster + synopsis, the rating labeled by source (e.g. "7.8 · TMDB"), editable status / notes / tags, the same poster and rating pickers from the add flow in case a better option turns up later, delete with confirmation.

**Filter & sort** — by type, status, genre, tag; sort by date added, release year, rating, alphabetical; a separate client-side search-within-list.

**Customization** (this is a headline feature, not an afterthought)

- Accent color picker — five curated options (see §6), changes buttons/focus rings/hover glow app-wide.
- Density toggle (comfortable/compact) and default view mode.
- Free-text personal tags on any item, autocompleted from the user's own past tags.
- All of this lives on `User.preferences` in Mongo, not localStorage, so it follows the person across devices.

**Dashboard (home)** — small stats strip (counts by status, top genres, completed this month), a "Continue Watching" row, a "Recently Added" row.

## 6. Design direction — dark & moody, grounded in cinema

Skip the two defaults this brief could easily fall into: near-black-with-acid-neon, or generic purple-gradient SaaS. Go somewhere more specific — a marquee at night.

**Palette**

| Role                                 | Value                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Background                           | `#0C0C0F`                                                               |
| Surface (cards/panels)               | `#17171B`                                                               |
| Hairline border                      | `#27272C` (use this instead of drop shadows — they barely read on dark) |
| Text primary                         | `#EDEDEF`                                                               |
| Text muted                           | `#8B8B93`                                                               |
| **Accent — Marquee Amber** (default) | `#E3A857`                                                               |

Accent picker options (same dark-jewel-tone logic, not saturated neon): **Velvet Crimson** `#B23A48` · **Dusk Violet** `#8B6FD8` · **Reel Emerald** `#3FA37B` · **Screening Azure** `#4C7EDB`.

**Typography** — one workhorse sans for everything (Inter or Manrope): hierarchy from weight and size, not multiple families. For the wordmark and page titles only, bring in a warmer display serif (Fraunces) — used sparingly, so it stays a signature instead of wallpaper. For numeric metadata — year, rating, runtime — set it in a monospace (JetBrains Mono): a small nod to ticket stubs and film timecodes that costs nothing but reads as intentional.

**Restraint** — generous whitespace, an uncluttered filter bar, minimal chrome around the poster grid, only one accent color doing work at a time. Minimalism needs more precision here, not less.

**Signature moment** — posters lit like a marquee: on hover/focus a poster card gets a soft accent-colored edge glow and lifts slightly, as if a bulb switched on behind it. This is the one place glow appears; keep everything else quiet so it reads as a signature, not decoration.

**Board layout, roughly:**

```
┌─ Plan to Watch ──┐ ┌─ Watching ────────┐ ┌─ Completed ────────┐
│ ▢ poster + title │ │ ▢ poster + title  │ │ ▢ poster + title   │
│ ▢ poster + title │ │ ▢ poster + title  │ │ ▢ poster + title   │
│ ...               │ │ ...                │ │ ...                 │
└───────────────────┘ └────────────────────┘ └─────────────────────┘
```

**Motion** — restrained: 150–250ms ease for modals/drawers, skeleton shimmer (not spinners) while loading, one small orchestrated moment when a new item is added (poster fades/settles into place). Nothing bounces.

**Voice** — plain, active, consistent: a button that says "Add to Watchlist" produces a toast that says "Added to Watchlist," not "Success." Empty states invite action ("Nothing here yet — add a title to get started") instead of saying "No data."

## 7. Pages

- `/register`, `/login`
- `/` — dashboard
- `/watchlist` — board/grid/list + filters (item detail opens as a drawer over this, not a separate route)
- `/settings` — customization + profile

## 8. API endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/search?type=movie|tv|anime&q=...

GET    /api/items            ?status=&type=&genre=&tag=&sort=
POST   /api/items
PATCH  /api/items/:id
DELETE /api/items/:id
PATCH  /api/items/reorder    (bulk status/order update for drag-and-drop)

PATCH  /api/users/preferences
```

`/api/search` fans out to both sources for the given `type` server-side and returns one merged, source-tagged array — the multi-source compare described in §5 is entirely a backend concern; the client just renders whatever comes back.

## 9. Folder structure

```
marquee/
├── client/                React app (Vite)
│   └── src/
│       ├── components/  pages/  hooks/  context/  lib/  store/
├── server/
│   ├── models/             User.js  WatchlistItem.js
│   ├── routes/              auth.js  items.js  search.js  users.js
│   ├── controllers/  middleware/
│   └── services/             tmdb.js  omdb.js  jikan.js  anilist.js  searchAggregator.js
├── .env.example
└── package.json            root — concurrently script to run both
```

## 10. Environment variables

```
MONGODB_URI=
JWT_SECRET=
TMDB_API_KEY=
OMDB_API_KEY=
CLIENT_URL=http://localhost:5173
PORT=5000
```

## 11. Build order

1. Scaffold client + server, root `package.json` with `concurrently`, confirm both run together.
2. Backend: Mongo connection, User + WatchlistItem models, auth routes/middleware, items CRUD (userId-scoped).
3. Backend: `/api/search` proxy aggregating TMDB + OMDb (movies/TV) and Jikan + AniList (anime) — normalize each source's response into one shape, merge, tag with source.
4. Frontend: routing, auth pages, protected routes.
5. Frontend: dark theme tokens (Tailwind config) + app shell.
6. Frontend: add-title flow (multi-source search results, pre-filled form, poster + rating pickers, manual add) and item detail drawer.
7. Frontend: board/grid/list views, drag-and-drop, filters/sort.
8. Frontend: settings page wired to `preferences`.
9. Dashboard/stats.
10. Polish: empty/loading/error states everywhere, responsive pass, accessibility (focus states, contrast).

## 12. Quality bar

- Fully responsive, mobile-first.
- Keyboard accessible with visible focus states.
- No blank screens — every async view has a loading, empty, and error state.
- If one external source errors or times out, search still returns whatever the other source found — a single flaky API shouldn't blank the results.
- `README.md` with setup steps, including how to get free TMDB and OMDb keys (Jikan and AniList need none).

## 13. Stretch ideas (skip for v1)

- Custom status columns (rename/add beyond the default five)
- Import from a Letterboxd or MyAnimeList export file
- Shareable, read-only public link for a list
- True field-level mixing in the add form (e.g. keep one source's synopsis but another's genres) — v1 gives you a full source's data bundle plus independent poster/rating swaps, which covers most of this without the extra UI complexity
