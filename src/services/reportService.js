import { apiFetch, apiFetchBlob } from './api.js'

export const reportService = {
  get: (filters = {}) => apiFetch('/reports', { params: filters }), // filters puede incluir type: BOTH|INCOMES|EXPENSES
  exportPdf: (type, from, to) => apiFetchBlob('/reports/export', { params: { type, from, to } }),
}
