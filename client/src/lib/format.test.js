import { describe, expect, it } from 'vitest'
import { formatDate } from './format.js'

describe('formatDate', () => {
  it('returns an em dash for missing input', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('formats an ISO date', () => {
    expect(formatDate('2024-07-15T12:00:00.000Z')).toBe('Jul 15, 2024')
  })
})
