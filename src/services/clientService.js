import { apiFetch } from './api.js'

export const clientService = {
  list: (search, page = 0) => apiFetch('/clients', { params: { search, page, size: 20 } }),
  get: (id) => apiFetch(`/clients/${id}`),
  create: (name) => apiFetch('/clients', { method: 'POST', body: { name } }),
  update: (id, name) => apiFetch(`/clients/${id}`, { method: 'PUT', body: { name } }),
  remove: (id) => apiFetch(`/clients/${id}`, { method: 'DELETE' }),
}
