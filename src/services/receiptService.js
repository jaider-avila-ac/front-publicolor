import { apiFetch } from './api.js'

export const receiptService = {
  generate: (jobId) => apiFetch(`/jobs/${jobId}/receipts`, { method: 'POST' }),
}
