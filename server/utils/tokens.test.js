import { describe, expect, it } from 'vitest'
import jwt from 'jsonwebtoken'
import { signPurposeToken, verifyPurposeToken, signSessionToken } from './tokens.js'

process.env.JWT_SECRET = 'test-secret-for-unit-tests'

describe('purpose tokens', () => {
  it('verifies a token signed for the same purpose', () => {
    const token = signPurposeToken('user123', 'verify', '1h')
    expect(verifyPurposeToken(token, 'verify')).toBe('user123')
  })

  it('rejects a token used with the wrong purpose', () => {
    const token = signPurposeToken('user123', 'verify', '1h')
    expect(() => verifyPurposeToken(token, 'reset')).toThrow('Wrong token purpose')
  })

  it('rejects a tampered token', () => {
    const token = signPurposeToken('user123', 'reset', '1h')
    const tampered = token.slice(0, -4) + 'AAAA'
    expect(() => verifyPurposeToken(tampered, 'reset')).toThrow()
  })
})

describe('session tokens', () => {
  it('embeds the token version', () => {
    const token = signSessionToken('user123', 3)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    expect(payload.userId).toBe('user123')
    expect(payload.tv).toBe(3)
  })

  it('defaults the token version to 0', () => {
    const token = signSessionToken('user123')
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    expect(payload.tv).toBe(0)
  })
})
