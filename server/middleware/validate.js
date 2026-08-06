import { body, validationResult } from 'express-validator'

export function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}

export const itemValidation = [
  body('type').optional().isIn(['movie', 'tv', 'anime', 'book', 'manga']).withMessage('Pick a type'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('status')
    .optional()
    .isIn(['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped'])
    .withMessage('Invalid status'),
  body('ratingSource')
    .optional()
    .isIn(['tmdb', 'omdb', 'jikan', 'anilist', 'kitsu', 'googlebooks', 'openlibrary', 'manual'])
    .withMessage('Invalid rating source'),
  body('source')
    .optional()
    .isIn(['tmdb', 'omdb', 'jikan', 'anilist', 'kitsu', 'googlebooks', 'openlibrary', 'manual'])
    .withMessage('Invalid source'),
  body('releaseYear')
    .optional({ nullable: true })
    .isInt({ min: 1800, max: 2200 })
    .withMessage('Invalid year'),
  body('externalRating')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be 0–10'),
  body('genres').optional().isArray().withMessage('Genres must be a list'),
  body('authors').optional().isArray().withMessage('Authors must be a list'),
  body('directors').optional().isArray().withMessage('Directors must be a list'),
  body('studios').optional().isArray().withMessage('Studios must be a list'),
  body('publisher').optional().isString().withMessage('Publisher must be text'),
  body('cast')
    .optional()
    .isArray()
    .withMessage('Cast must be a list')
    .custom((arr) => arr.every((c) => c && typeof c.name === 'string'))
    .withMessage('Each cast entry needs a name'),
  body('tags').optional().isArray().withMessage('Tags must be a list'),
]

export const createItemValidation = [
  body('type').isIn(['movie', 'tv', 'anime', 'book', 'manga']).withMessage('Pick a type'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  ...itemValidation,
]
