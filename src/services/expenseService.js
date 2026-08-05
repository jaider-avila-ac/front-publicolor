import { apiFetch } from './api.js'

export const expenseService = {
  list: (filters = {}, page = 0) => apiFetch('/expenses', { params: { ...filters, page, size: 20 } }),
  create: (payload) => apiFetch('/expenses', { method: 'POST', body: payload }),
}
