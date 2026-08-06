import { apiFetch } from './api.js'

export const expenseService = {
  list: (filters = {}, page = 0) => apiFetch('/expenses', { params: { ...filters, page, size: 20 } }),
  create: (payload) => apiFetch('/expenses', { method: 'POST', body: payload }),
  annul: (id, reason) => apiFetch(`/expenses/${id}/annul`, { method: 'POST', body: { reason } }),
}
