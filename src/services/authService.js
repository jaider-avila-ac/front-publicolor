import { apiFetch } from './api.js'

export const authService = {
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: { email, password } }),
}
