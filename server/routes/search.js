import { Router } from 'express'
import auth from '../middleware/auth.js'
import { search } from '../services/searchAggregator.js'

const router = Router()

router.get('/', auth, async (req, res, next) => {
  try {
    const { type, q } = req.query
    if (!['movie', 'tv', 'anime'].includes(type)) {
      return res.status(400).json({ message: 'type must be movie, tv, or anime' })
    }
    if (!q || !q.trim()) {
      return res.json({ results: [], sourceErrors: [] })
    }
    res.json(await search(type, q.trim()))
  } catch (err) {
    next(err)
  }
})

export default router
