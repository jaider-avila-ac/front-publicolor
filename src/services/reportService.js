import { apiFetch } from './api.js'

export const reportService = {
  get: (filters = {}) => apiFetch('/reports', { params: filters }),
}
