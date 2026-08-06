import { Router } from 'express'
import auth from '../middleware/auth.js'
import { search } from '../services/searchAggregator.js'

const router = Router()

router.get('/', auth, async (req, res, next) => {
  try {
    const { type, q, author } = req.query
    if (!['movie', 'tv', 'anime', 'book', 'manga'].includes(type)) {
      return res.status(400).json({ message: 'type must be movie, tv, anime, book, or manga' })
    }
    if (author && !['book', 'manga'].includes(type)) {
      return res.status(400).json({ message: 'author search is only for books and manga' })
    }
    if (!q || !q.trim()) {
      return res.json({ results: [], sourceErrors: [] })
    }
    res.json(await search(type, q.trim(), { author: Boolean(author) }))
  } catch (err) {
    next(err)
  }
})

export default router
