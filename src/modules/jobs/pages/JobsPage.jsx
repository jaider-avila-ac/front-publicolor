import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { jobService } from '../../../services/jobService'
import { formatCurrency, formatDate } from '../../../utils/format'
import ResponsiveList from '../../../components/ResponsiveList'
import StatusBadge from '../../../components/StatusBadge'
import { inputClass } from '../../../components/FormField'

const STATUSES = [
  { value: '', label: 'Todos los estados' },
  { value: 'ABIERTA', label: 'Abierta' },
  { value: 'PARCIALMENTE_PAGADA', label: 'Parcialmente pagada' },
  { value: 'PAGADA', label: 'Pagada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [status, setStatus] = useState('')
  const navigate = useNavigate()

  function load() {
    jobService.list({ status: status || undefined }).then((page) => setJobs(page.content))
  }

  useEffect(load, [status])

  const columns = [
    {
      key: 'title',
      label: 'Trabajo',
      primary: true,
      render: (j) => (
        <div>
          <p className="font-medium text-slate-800">{j.title}</p>
          <p className="text-xs text-slate-400">{j.client.name} · #{j.consecutiveNumber}</p>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      primary: true,
      render: (j) => (
        <div className="text-right">
          <p className="font-semibold text-slate-800">{formatCurrency(j.totalAmount)}</p>
          <StatusBadge status={j.status} />
        </div>
      ),
    },
    { key: 'date', label: 'Fecha', render: (j) => formatDate(j.jobDate) },
    {
      key: 'pending',
      label: 'Pendiente',
      render: (j) => (
        <span className={Number(j.pendingAmount) > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'}>
          {formatCurrency(j.pendingAmount)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Trabajos</h1>
        <button
          onClick={() => navigate('/trabajos/nuevo')}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-3.5 py-2 rounded-lg"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass + ' max-w-xs'}>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <ResponsiveList
        columns={columns}
        rows={jobs}
        keyExtractor={(j) => j.id}
        onRowClick={(j) => navigate(`/trabajos/${j.id}`)}
        emptyMessage="No hay trabajos registrados todavía."
      />
    </div>
  )
}
