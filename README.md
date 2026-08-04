# Marquee.

A personal watchlist for movies, TV, and anime — dark, cinematic, and fast. Multi-user: every account keeps its own private collection, adding titles by searching two free APIs per category side by side (TMDB + OMDb for movies/TV, Jikan + AniList for anime) or typing them in manually.

Built with React 18 + Vite + Tailwind + TanStack Query on the client, Node/Express + MongoDB on the server.

## Setup

### 1. Get the free API keys

| Service          | Needed for                                            | How to get one                                                                                                                                                                                      |
| ---------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TMDB             | Movies & TV search, posters                           | Register at [themoviedb.org](https://www.themoviedb.org/settings/api) → "Developer" → request an API key (free, instant). Take both the API key and the "API Read Access Token" from your settings. |
| OMDb             | Movies & TV second source, IMDb/RT/Metacritic ratings | [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) — request by email, key arrives within the hour. Free tier: 1,000 requests/day.                                                      |
| Jikan + AniList  | Anime (both sources)                                  | None — fully open, no keys.                                                                                                                                                                         |
| Brevo (optional) | Password reset + email verification                   | Free account at [brevo.com](https://www.brevo.com) → SMTP & API → API keys. Verify a sender email (Settings → Senders) and use that for `BREVO_FROM_EMAIL`.                                         |

### 2. MongoDB

Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), add your current IP to **Network Access** (or use `0.0.0.0/0` for development), create a database user, and copy the connection string.

### 3. Configure environment

```bash
cp .env.example server/.env
```

Then fill in `server/.env`:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.../marquee
JWT_SECRET=some-long-random-string
TMDB_API_KEY=...
TMDB_ACCESS_TOKEN=...
OMDB_API_KEY=...
BREVO_API_KEY=xkeysib-...          # optional
BREVO_FROM_EMAIL=you@verified-sender.com  # must be verified in Brevo
CLIENT_URL=http://localhost:5173
PORT=5000
```

### 4. Install & run

```bash
npm install          # root
npm install --prefix server
npm install --prefix client
npm run dev          # starts server (:5000) and client (:5173) together
```

Open http://localhost:5173, register an account, and add your first title.

## Features

- **Multi-source search** — every query fans out to two APIs server-side and shows the results side by side with source badges, so a title missing from one source still turns up. One flaky API never blanks the results.
- **Poster + rating pickers** — the add form shows every poster found across both sources (TMDB's full image set included) and every rating, swappable independently of the card you clicked.
- **Three views** — Board (drag cards between statuses), Grid (poster wall), List (sortable table).
- **Detail drawer** — full synopsis, editable status/notes/tags, and the same poster/rating pickers so you can swap to a better option later.
- **Customization** — five accent colors (Marquee Amber, Velvet Crimson, Dusk Violet, Reel Emerald, Screening Azure), density, and default view — all saved to your account, synced across devices.
- **Dashboard** — status counts, top genres, completed this month, Continue Watching, Recently Added.
- **Auth** — httpOnly JWT cookies, bcrypt(12), rate-limited login/register, password reset and email verification via Brevo (soft verification — login is never blocked).

## Scripts

| Command                             | What it does                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                       | Server + client together (concurrently)                                                                                  |
| `npm run server` / `npm run client` | Either one alone                                                                                                         |
| `npm run build`                     | Production build of the client                                                                                           |
| `npm start`                         | Production server: builds nothing — run `npm run build` first, then this serves the built client from Express on `:5000` |

## Deploy

```bash
npm run build          # client/dist
npm start              # NODE_ENV=production — Express serves client/dist + the API on :5000
```

Open `http://localhost:5000`. Notes:

- The whole app runs from one origin in production, so the built client and all `/api` calls share the server (the Vite dev proxy is not involved).
- Set `NODE_ENV=production` and `CLIENT_URL=https://your-domain` in `server/.env`. Session cookies are marked `secure` in production, so serve over HTTPS (a reverse proxy like Caddy/Nginx or any PaaS works).
- Poster images load over https — the server's CSP is configured to allow them (see `server/index.js`).
- For a dev-only preview of the production client, keep the API server running (`npm run server`) and use `npm run build --prefix client && npm run preview --prefix client` (Vite preview proxies `/api` to `:5000`).

### Render

The repo includes a `render.yaml` blueprint (free web service, auto-deploys on push to `master`). To set it up:

1. Push the repo to GitHub, then in Render: **New → Blueprint** and point it at the `Marquee` repo.
2. Fill in the secret env vars it asks for (they are never committed):
   | Variable            | Value                                                                  |
   | ------------------- | ---------------------------------------------------------------------- |
   | `MONGODB_URI`       | Your MongoDB Atlas connection string                                   |
   | `JWT_SECRET`        | Long random string (same one you use locally)                          |
   | `TMDB_ACCESS_TOKEN` | TMDB API v4 token (fallback `TMDB_API_KEY` also works)                 |
   | `OMDB_API_KEY`      | OMDb API key                                                           |
   | `BREVO_API_KEY`     | Brevo SMTP API key                                                     |
   | `BREVO_FROM_EMAIL`  | Brevo sender — must be a **verified sender** in Brevo or emails bounce |
3. MongoDB Atlas: **Network Access → Add IP → Allow access from anywhere** (`0.0.0.0/0`), otherwise Render's servers can't connect. Keep the DB user password strong.
4. The app appears at `https://marquee-8sxr.onrender.com` once the build finishes.

The mailer only logs links in development — on Render, reset/verify emails go out through Brevo (or log a `skipped` warning if the keys are missing).

## Notes

- In development, email links are also written to `server/mailer.log` so you can test reset/verify flows without waiting for mail delivery.
- All external API calls go through the Express server — no keys ever reach the browser.
