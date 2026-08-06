import mongoose from 'mongoose'

const watchlistItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['movie', 'tv', 'anime', 'book', 'manga'], required: true },
  title: { type: String, required: true, trim: true },
  posterUrl: String,
  overview: String,
  releaseYear: Number,
  genres: [String],
  authors: [String],
  externalRating: Number,
  ratingSource: {
    type: String,
    enum: ['tmdb', 'omdb', 'jikan', 'anilist', 'googlebooks', 'openlibrary', 'manual'],
    default: 'manual',
  },
  status: {
    type: String,
    enum: ['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped'],
    default: 'plan_to_watch',
  },
  notes: String,
  tags: [String],
  source: {
    type: String,
    enum: ['tmdb', 'omdb', 'jikan', 'anilist', 'googlebooks', 'openlibrary', 'manual'],
    default: 'manual',
  },
  externalId: String,
  order: { type: Number, default: 0 },
  dateAdded: { type: Date, default: Date.now },
  dateCompleted: Date,
})

export default mongoose.model('WatchlistItem', watchlistItemSchema)
