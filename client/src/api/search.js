import api from './client.js'

export const searchTitle = (type, query, author = false) =>
  api
    .get('/search', { params: { type, q: query, ...(author ? { author: 1 } : {}) } })
    .then((r) => r.data)
