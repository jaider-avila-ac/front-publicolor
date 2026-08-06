import { apiFetch } from './api.js'

export const dashboardService = {
  get: () => apiFetch('/dashboard'),
  getIncomeChart: (granularity) => apiFetch('/dashboard/income-chart', { params: { granularity } }),
}
