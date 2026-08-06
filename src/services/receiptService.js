import { apiFetch, apiFetchBlob } from './api.js'

export const receiptService = {
  generate: (jobId) => apiFetch(`/jobs/${jobId}/receipts`, { method: 'POST' }),
  // No genera un recibo nuevo: renderiza en PDF el recibo que ya se generó (mismo consecutivo).
  exportPdf: (jobId, receipt) => apiFetchBlob(`/jobs/${jobId}/receipts/pdf`, { method: 'POST', body: receipt }),
}
