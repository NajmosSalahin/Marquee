import { describe, expect, it } from 'vitest'
import {
  ACCENTS,
  SOURCE_LABELS,
  STATUSES,
  STATUS_LABELS,
  TYPES,
  TYPE_LABELS,
  READING_STATUS_LABELS,
  statusLabel,
} from './constants.js'

describe('constants', () => {
  it('has five statuses and a label map covering each', () => {
    expect(STATUSES).toHaveLength(5)
    for (const s of STATUSES) {
      expect(STATUS_LABELS[s.id]).toBe(s.label)
    }
  })

  it('has five title types with labels', () => {
    expect(TYPES.map((t) => t.id)).toEqual(['movie', 'tv', 'anime', 'book', 'manga'])
    for (const t of TYPES) {
      expect(TYPE_LABELS[t.id]).toBe(t.label)
    }
  })

  it('has five accent colors with distinct hex values', () => {
    expect(ACCENTS).toHaveLength(5)
    expect(new Set(ACCENTS.map((a) => a.color)).size).toBe(5)
  })

  it('labels every known source', () => {
    for (const s of ['tmdb', 'omdb', 'jikan', 'anilist', 'kitsu', 'googlebooks', 'openlibrary', 'manual']) {
      expect(SOURCE_LABELS[s]).toBeTruthy()
    }
  })

  it('maps reading statuses for books and manga', () => {
    expect(READING_STATUS_LABELS.plan_to_watch).toBe('Plan to Read')
    expect(READING_STATUS_LABELS.watching).toBe('Reading')
    expect(statusLabel('book', 'watching')).toBe('Reading')
    expect(statusLabel('manga', 'plan_to_watch')).toBe('Plan to Read')
    expect(statusLabel('movie', 'watching')).toBe('Watching')
  })
})
