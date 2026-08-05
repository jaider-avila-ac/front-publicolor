import { apiFetch } from './api.js'

export const dashboardService = {
  get: () => apiFetch('/dashboard'),
}
