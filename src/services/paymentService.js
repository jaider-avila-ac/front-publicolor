import { apiFetch } from './api.js'

export const paymentService = {
  create: (payload) => apiFetch('/payments', { method: 'POST', body: payload }),
  listByJob: (jobId) => apiFetch(`/jobs/${jobId}/payments`),
}
