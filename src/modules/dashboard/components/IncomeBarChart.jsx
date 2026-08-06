import { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '../../../utils/format'

const CHART_HEIGHT = 140
const BAR_GAP = 10
const DESKTOP_BAR_WIDTH = 28
const MOBILE_BREAKPOINT = 768
const CONTAINER_PADDING = 32 // p-4 = 16px por lado

function dayLabel(period) {
  // period viene como "2026-08-06"
  const [, month, day] = period.split('-')
  return `${day}/${month}`
}

function monthLabel(period) {
  // period viene como "2026-08"
  const [year, month] = period.split('-')
  const nombres = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${nombres[Number(month) - 1]} ${year.slice(2)}`
}

export default function IncomeBarChart({ points, granularity }) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const scrollRef = useRef(null)
  const [barWidth, setBarWidth] = useState(DESKTOP_BAR_WIDTH)

  // En móvil cada barra ocupa el ancho visible completo (se ve una sola a la vez,
  // se desliza para ver la siguiente). En escritorio queda un ancho fijo chico
  // para que entren varias juntas.
  useEffect(() => {
    function recalcular() {
      const esMovil = window.innerWidth < MOBILE_BREAKPOINT
      if (esMovil && scrollRef.current) {
        setBarWidth(Math.max(scrollRef.current.clientWidth - CONTAINER_PADDING, 80))
      } else {
        setBarWidth(DESKTOP_BAR_WIDTH)
      }
    }
    recalcular()
    window.addEventListener('resize', recalcular)
    return () => window.removeEventListener('resize', recalcular)
  }, [])

  // Arranca mostrando el extremo derecho — hoy, o el mes actual — en vez de
  // dejar al usuario en el día 1 y obligarlo a scrollear para llegar a hoy.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [points, barWidth])

  if (!points || points.length === 0) {
    return <p className="text-slate-400 text-sm">Sin datos todavía.</p>
  }

  const max = Math.max(...points.map((p) => Number(p.amount)), 1)
  const label = granularity === 'month' ? monthLabel : dayLabel

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto border border-slate-200 bg-white px-4 pb-4 pt-10"
      style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
    >
      <div
        className="flex items-end gap-[10px]"
        style={{ height: CHART_HEIGHT + 28, minWidth: points.length * (barWidth + BAR_GAP) }}
      >
        {points.map((p, idx) => {
          const amount = Number(p.amount)
          const barHeight = amount <= 0 ? 0 : Math.max((amount / max) * CHART_HEIGHT, 3)
          return (
            <div
              key={p.period}
              className="relative flex flex-col items-center justify-end shrink-0"
              style={{ width: barWidth, height: CHART_HEIGHT + 28, scrollSnapAlign: 'start' }}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx((v) => (v === idx ? null : v))}
            >
              {hoverIdx === idx && (
                <div className="absolute bottom-full mb-1.5 z-10 whitespace-nowrap bg-slate-900 text-white text-xs px-2 py-1 shadow">
                  {formatCurrency(amount)}
                </div>
              )}
              <div
                className={`w-full ${amount > 0 ? 'bg-brand' : 'bg-slate-100'}`}
                style={{ height: barHeight || 1 }}
              />
              <span className="mt-1.5 text-[10px] text-slate-400 whitespace-nowrap">{label(p.period)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
