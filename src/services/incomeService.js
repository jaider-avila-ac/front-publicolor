import { apiFetch } from './api.js'

export const incomeService = {
  list: (filters = {}, page = 0) => apiFetch('/incomes', { params: { ...filters, page, size: 20 } }),
  // Ingresos manuales + abonos a trabajos, juntos y ordenados por fecha.
  listCombined: (filters = {}) => apiFetch('/incomes/combined', { params: filters }),
  create: (payload) => apiFetch('/incomes', { method: 'POST', body: payload }),
  annul: (id, reason) => apiFetch(`/incomes/${id}/annul`, { method: 'POST', body: { reason } }),
}
