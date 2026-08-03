import { create } from 'zustand';

export const useUiStore = create((set) => ({
  view: null,
  filters: {
    type: 'all',
    status: 'all',
    genre: 'all',
    tag: 'all',
    sort: 'dateAdded',
    q: '',
  },
  setView: (view) => set({ view }),
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () =>
    set({ filters: { type: 'all', status: 'all', genre: 'all', tag: 'all', sort: 'dateAdded', q: '' } }),
}));
