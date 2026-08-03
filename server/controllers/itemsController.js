import WatchlistItem from '../models/WatchlistItem.js'

const SORT_MAP = {
  dateAdded: { dateAdded: -1 },
  releaseYear: { releaseYear: -1 },
  rating: { externalRating: -1 },
  title: { title: 1 },
  order: { order: 1, dateAdded: 1 },
}

export async function listItems(req, res, next) {
  try {
    const { status, type, genre, tag, sort } = req.query
    const filter = { userId: req.userId }
    if (status) filter.status = status
    if (type) filter.type = type
    if (genre) filter.genres = genre
    if (tag) filter.tags = tag
    const items = await WatchlistItem.find(filter).sort(SORT_MAP[sort] || SORT_MAP.order)
    res.json({ items })
  } catch (err) {
    next(err)
  }
}

export async function createItem(req, res, next) {
  try {
    const {
      type,
      title,
      posterUrl,
      overview,
      releaseYear,
      genres,
      externalRating,
      ratingSource,
      status,
      notes,
      tags,
      source,
      externalId,
    } = req.body
    const last = await WatchlistItem.findOne({ userId: req.userId }).sort({ order: -1 })
    const item = await WatchlistItem.create({
      userId: req.userId,
      type,
      title,
      posterUrl,
      overview,
      releaseYear: releaseYear || undefined,
      genres,
      externalRating: externalRating ?? undefined,
      ratingSource,
      status,
      notes,
      tags,
      source,
      externalId,
      order: (last?.order ?? 0) + 10,
    })
    res.status(201).json({ item })
  } catch (err) {
    next(err)
  }
}

const EDITABLE = [
  'title',
  'posterUrl',
  'overview',
  'releaseYear',
  'genres',
  'externalRating',
  'ratingSource',
  'status',
  'notes',
  'tags',
  'source',
  'externalId',
  'order',
]

export async function updateItem(req, res, next) {
  try {
    const item = await WatchlistItem.findOne({ _id: req.params.id, userId: req.userId })
    if (!item) return res.status(404).json({ message: 'Item not found' })

    for (const field of EDITABLE) {
      if (req.body[field] !== undefined) item[field] = req.body[field]
    }
    if (item.status === 'completed' && !item.dateCompleted) {
      item.dateCompleted = new Date()
    } else if (item.status !== 'completed') {
      item.dateCompleted = undefined
    }
    await item.save()
    res.json({ item })
  } catch (err) {
    next(err)
  }
}

export async function deleteItem(req, res, next) {
  try {
    const item = await WatchlistItem.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.json({ message: 'Removed from watchlist' })
  } catch (err) {
    next(err)
  }
}

export async function reorderItems(req, res, next) {
  try {
    const updates = req.body.items
    if (!Array.isArray(updates) || !updates.length) {
      return res.status(400).json({ message: 'Send an items array' })
    }
    const ids = updates.map((u) => u.id)
    const existing = await WatchlistItem.find({ _id: { $in: ids }, userId: req.userId })
    const owned = new Set(existing.map((e) => String(e._id)))
    const foreign = updates.filter((u) => !owned.has(String(u.id)))
    if (foreign.length) {
      return res.status(403).json({ message: 'One or more items are not yours' })
    }
    await Promise.all(
      updates.map((u) =>
        WatchlistItem.updateOne(
          { _id: u.id, userId: req.userId },
          { $set: { status: u.status ?? undefined, order: u.order } }
        )
      )
    )
    res.json({ message: 'Order saved' })
  } catch (err) {
    next(err)
  }
}
