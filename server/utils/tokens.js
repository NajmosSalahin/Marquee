import jwt from 'jsonwebtoken'

export function signSessionToken(userId, tokenVersion) {
  return jwt.sign({ userId, tv: tokenVersion ?? 0 }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function signPurposeToken(userId, purpose, expiresIn) {
  return jwt.sign({ userId, purpose }, process.env.JWT_SECRET, { expiresIn })
}

export function verifyPurposeToken(token, purpose) {
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  if (payload.purpose !== purpose) throw new Error('Wrong token purpose')
  return payload.userId
}
