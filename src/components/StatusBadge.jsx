const STYLES = {
  ABIERTA: 'bg-amber-50 text-amber-700',
  PARCIALMENTE_PAGADA: 'bg-blue-50 text-blue-700',
  PAGADA: 'bg-emerald-50 text-emerald-700',
  CANCELADA: 'bg-slate-100 text-slate-500',
}

const LABELS = {
  ABIERTA: 'Abierta',
  PARCIALMENTE_PAGADA: 'Parcial',
  PAGADA: 'Pagada',
  CANCELADA: 'Cancelada',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[status] || 'bg-slate-100 text-slate-500'}`}>
      {LABELS[status] || status}
    </span>
  )
}
