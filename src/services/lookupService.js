import { apiFetch } from './api.js'

export const lookupService = {
  get: () => apiFetch('/lookups'),
}
