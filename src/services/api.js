// El proxy de Vite (vite.config.js) reenvía /api al backend en desarrollo.
// En producción, VITE_API_URL debe apuntar a la URL pública del backend.
export const API_BASE = import.meta.env.VITE_API_URL ?? ''

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('auth'))?.token ?? null
  } catch {
    return null
  }
}

/** Envoltorio de fetch: agrega el token, arma JSON, y dispara auth:expired en 401. */
export async function apiFetch(path, { method = 'GET', body, params } = {}) {
  let url = `${API_BASE}/api/v1${path}`
  if (params) {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
    if (query) url += `?${query}`
  }

  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:expired'))
    throw new Error('Sesión expirada')
  }

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.message || 'Ocurrió un error inesperado.')
    err.status = res.status
    err.code = data.code
    err.existingJobId = data.existingJobId
    throw err
  }

  return data
}

/** Igual que apiFetch, pero para respuestas binarias (ej. PDF) — devuelve un Blob. */
export async function apiFetchBlob(path, { params, method = 'GET', body } = {}) {
  let url = `${API_BASE}/api/v1${path}`
  if (params) {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
    if (query) url += `?${query}`
  }

  const token = getToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:expired'))
    throw new Error('Sesión expirada')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'No se pudo generar el archivo.')
  }

  return res.blob()
}
