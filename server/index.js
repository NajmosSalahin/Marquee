import { config as loadEnv } from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDb } from './config/db.js'
import authRoutes from './routes/auth.js'
import itemsRoutes from './routes/items.js'
import searchRoutes from './routes/search.js'
import usersRoutes from './routes/users.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

loadEnv({ path: path.join(__dirname, '.env') })

app.set('trust proxy', 1)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        // Posters come from TMDB/OMDb/MAL/AniList over https; keep the rest of the defaults.
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
)
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/users', usersRoutes)

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'client', 'dist')
  app.use(express.static(dist))
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000

connectDb()
  .then(() => {
    app.listen(port, () => console.log(`Marquee server on http://localhost:${port}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
