import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, HandCoins, Receipt } from 'lucide-react'
import { jobService } from '../../../services/jobService'
import { lookupService } from '../../../services/lookupService'
import { formatCurrency, formatDate } from '../../../utils/format'
import { useCachedData } from '../../../hooks/useCachedData'
import ResponsiveList from '../../../components/ResponsiveList'
import StatusBadge from '../../../components/StatusBadge'
import PendingAmount from '../../../components/PendingAmount'
import { inputClass } from '../../../components/FormField'
import PagoModal from '../components/PagoModal'

const STATUSES = [
  { value: '', label: 'Todos los estados' },
  { value: 'ABIERTA', label: 'Abierta' },
  { value: 'PARCIALMENTE_PAGADA', label: 'Parcialmente pagada' },
  { value: 'PAGADA', label: 'Pagada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

const PAGABLE = ['ABIERTA', 'PARCIALMENTE_PAGADA']

export default function JobsPage() {
  const [status, setStatus] = useState('')
  const [payModalJob, setPayModalJob] = useState(null)
  const [lookups, setLookups] = useState(null)
  const navigate = useNavigate()

  // Al volver a Trabajos dentro de la misma sesión, se ve de una la última lista
  // (sin pantalla de "Cargando…") mientras se trae la versión fresca por detrás.
  const { data, refetch } = useCachedData(`jobs:${status}`, () => jobService.list({ status: status || undefined }), [status])
  const jobs = data?.content ?? []

  useEffect(() => {
    lookupService.get().then(setLookups)
  }, [])

  const columns = [
    {
      key: 'client',
      label: 'Cliente',
      primary: true,
      render: (j) => (
        <div>
          <p className="font-medium text-slate-800">
            {j.client.name} <span className="text-slate-400 font-normal">{j.code}</span>
          </p>
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
    { key: 'pending', label: 'Pendiente', render: (j) => <PendingAmount amount={j.pendingAmount} /> },
    {
      key: 'actions',
      label: 'Acciones',
      primary: true,
      render: (j) => (
        <div className="flex items-center gap-1 shrink-0">
          {PAGABLE.includes(j.status) && (
            <button
              title="Registrar pago"
              onClick={(e) => {
                e.stopPropagation()
                setPayModalJob(j)
              }}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
            >
              <HandCoins size={17} />
            </button>
          )}
          <button
            title="Generar recibo de cobro"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/trabajos/${j.id}/recibo`)
            }}
            className="p-2 text-slate-400 hover:text-brand hover:bg-slate-100"
          >
            <Receipt size={17} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Trabajos</h1>
        <button
          onClick={() => navigate('/trabajos/nuevo')}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-3.5 py-2"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass + ' max-w-xs'}>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <ResponsiveList
        columns={columns}
        rows={jobs}
        keyExtractor={(j) => j.id}
        onRowClick={(j) => navigate(`/trabajos/${j.id}`)}
        emptyMessage="No hay trabajos registrados todavía."
      />

      {payModalJob && lookups && (
        <PagoModal
          job={payModalJob}
          lookups={lookups}
          onClose={() => setPayModalJob(null)}
          onSuccess={() => {
            setPayModalJob(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}
