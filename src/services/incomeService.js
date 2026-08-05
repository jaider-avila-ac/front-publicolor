import { apiFetch } from './api.js'

export const incomeService = {
  list: (filters = {}, page = 0) => apiFetch('/incomes', { params: { ...filters, page, size: 20 } }),
  create: (payload) => apiFetch('/incomes', { method: 'POST', body: payload }),
}
