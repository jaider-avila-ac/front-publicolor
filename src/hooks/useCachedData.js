import { useCallback, useEffect, useRef, useState } from 'react'

// Caché en memoria compartida entre todas las pantallas — vive mientras dure la pestaña.
// No es un caché "persistente" (se pierde al recargar la página a propósito, F5),
// pero evita el parpadeo de "Cargando…" al volver a una sección ya visitada
// dentro de la misma sesión de navegación (ej. ir de Trabajos a Clientes y volver).
const cache = new Map()

/**
 * Igual que hacer fetch + useState + useEffect, pero con caché: si ya existe un
 * valor en caché para esta `key`, se muestra de una (sin pantalla de carga) mientras
 * se pide la versión fresca en segundo plano; cuando llega, se actualiza sola sin
 * volver a mostrar "Cargando…".
 *
 * @param {string|null} key - identifica qué se está pidiendo (incluye filtros/params
 *   si los hay, ej. `clientes:${search}`). Si es null, no cachea (siempre carga fresco).
 * @param {() => Promise<any>} fetcher - la función que trae los datos.
 * @param {any[]} deps - cuándo volver a pedir (normalmente las variables que arma `key`).
 */
export function useCachedData(key, fetcher, deps) {
  const hasCache = key != null && cache.has(key)
  const [data, setData] = useState(hasCache ? cache.get(key) : null)
  const [loading, setLoading] = useState(!hasCache)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelado = false
    const yaEnCache = key != null && cache.has(key)
    setData(yaEnCache ? cache.get(key) : null)
    setLoading(!yaEnCache)
    setError('')

    fetcherRef
      .current()
      .then((resultado) => {
        if (cancelado) return
        if (key != null) cache.set(key, resultado)
        setData(resultado)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err.message || 'Ocurrió un error inesperado.')
        setLoading(false)
      })

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  // Para pedir de nuevo después de un cambio (crear/editar/borrar algo en esta pantalla):
  // muestra lo que ya había mientras llega lo fresco, sin parpadeo.
  const refetch = useCallback(() => setTick((t) => t + 1), [])

  return { data, loading, error, setData, refetch }
}

/** Por si algún flujo necesita invalidar/limpiar el caché a mano (ej. después de un cambio grande). */
export function clearCachedData(key) {
  if (key == null) {
    cache.clear()
  } else {
    cache.delete(key)
  }
}
