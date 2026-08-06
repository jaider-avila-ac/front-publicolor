const DOT_COLOR = {
  ABIERTA: 'bg-amber-500',
  PARCIALMENTE_PAGADA: 'bg-blue-600',
  PAGADA: 'bg-emerald-600',
  CANCELADA: 'bg-slate-400',
}

const LABELS = {
  ABIERTA: 'Abierta',
  PARCIALMENTE_PAGADA: 'Parcial',
  PAGADA: 'Pagada',
  CANCELADA: 'Cancelada',
}

export default function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
      <span className={`w-1.5 h-1.5 ${DOT_COLOR[status] || 'bg-slate-400'}`} />
      {LABELS[status] || status}
    </span>
  )
}
