import api from './client.js'

export const fetchMe = () => api.get('/auth/me').then((r) => r.data.user)
export const login = (identifier, password) =>
  api.post('/auth/login', { identifier, password }).then((r) => r.data.user)
export const register = (username, email, password) =>
  api.post('/auth/register', { username, email, password }).then((r) => r.data.user)
export const logout = () => api.post('/auth/logout').then((r) => r.data)
export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email }).then((r) => r.data)
export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, newPassword }).then((r) => r.data)
export const verifyEmail = (token) => api.post('/auth/verify-email', { token }).then((r) => r.data)
export const resendVerification = () => api.post('/auth/resend-verification').then((r) => r.data)
