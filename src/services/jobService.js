import { apiFetch } from './api.js'

export const jobService = {
  list: (filters = {}, page = 0) => apiFetch('/jobs', { params: { ...filters, page, size: 20 } }),
  get: (id) => apiFetch(`/jobs/${id}`),
  create: (payload) => apiFetch('/jobs', { method: 'POST', body: payload }),
  update: (id, payload) => apiFetch(`/jobs/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => apiFetch(`/jobs/${id}`, { method: 'DELETE' }),
  cancel: (id, force = false) => apiFetch(`/jobs/${id}/cancel`, { method: 'PATCH', body: { force } }),
  addItem: (jobId, item) => apiFetch(`/jobs/${jobId}/items`, { method: 'POST', body: item }),
  updateItem: (jobId, itemId, item) => apiFetch(`/jobs/${jobId}/items/${itemId}`, { method: 'PUT', body: item }),
  removeItem: (jobId, itemId) => apiFetch(`/jobs/${jobId}/items/${itemId}`, { method: 'DELETE' }),
}
