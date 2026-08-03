const store = new Map()

export function getCached(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value
}

export function setCached(key, value, ttlMs = 10 * 60 * 1000) {
  if (store.size > 500) store.clear()
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}
