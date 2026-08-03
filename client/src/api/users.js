import api from './client.js';

export const updatePreferences = (preferences) =>
  api.patch('/users/preferences', preferences).then((r) => r.data.user);
