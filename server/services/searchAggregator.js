import { searchTmdb } from './tmdb.js';
import { searchOmdb } from './omdb.js';
import { searchJikan } from './jikan.js';
import { searchAnilist } from './anilist.js';
import { getCached, setCached } from '../utils/cache.js';

export async function search(type, query) {
  const cacheKey = `search:${type}:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const sources = type === 'anime' ? [searchJikan, searchAnilist] : [searchTmdb, searchOmdb];
  const settled = await Promise.allSettled(sources.map((fn) => fn(type, query)));

  const sourceErrors = settled
    .map((r, i) => (r.status === 'rejected' ? `${r.reason?.message || 'source failed'}` : null))
    .filter(Boolean);

  const found = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  const results = found.map((result) => ({
    ...result,
    alternates: found.filter(
      (o) =>
        o.source !== result.source &&
        o.title.toLowerCase() === result.title.toLowerCase() &&
        (o.year === result.year || !o.year || !result.year)
    ),
  }));

  const payload = { results, sourceErrors };
  setCached(cacheKey, payload);
  return payload;
}
