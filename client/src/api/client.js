import axios from 'axios'

const api = axios.create({ baseURL: '/api', withCredentials: true })

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''
    if (status === 401 && !url.startsWith('/auth/me')) {
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    const message = err.response?.data?.message || 'Something went wrong'
    return Promise.reject(Object.assign(err, { friendlyMessage: message }))
  }
)

export default api
