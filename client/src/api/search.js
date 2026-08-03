import api from './client.js';

export const searchTitle = (type, query) =>
  api.get('/search', { params: { type, q: query } }).then((r) => r.data);
