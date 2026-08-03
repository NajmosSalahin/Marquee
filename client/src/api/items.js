import api from './client.js';

export const fetchItems = () => api.get('/items').then((r) => r.data.items);
export const createItem = (payload) => api.post('/items', payload).then((r) => r.data.item);
export const updateItem = (id, payload) => api.patch(`/items/${id}`, payload).then((r) => r.data.item);
export const deleteItem = (id) => api.delete(`/items/${id}`).then((r) => r.data);
export const reorderItems = (items) => api.patch('/items/reorder', { items }).then((r) => r.data);
