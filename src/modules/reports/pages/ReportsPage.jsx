import { useEffect, useState } from 'react'
import { reportService } from '../../../services/reportService'
import { clientService } from '../../../services/clientService'
import { formatCurrency } from '../../../utils/format'
import { inputClass } from '../../../components/FormField'
import ResponsiveList from '../../../components/ResponsiveList'

const STATUSES = [
  { value: '', label: 'Todos los estados' },
  { value: 'ABIERTA', label: 'Abierta' },
  { value: 'PARCIALMENTE_PAGADA', label: 'Parcialmente pagada' },
  { value: 'PAGADA', label: 'Pagada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

export default function ReportsPage() {
  const [filters, setFilters] = useState({ from: '', to: '', clientId: '', status: '' })
  const [clients, setClients] = useState([])
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    clientService.list('').then((p) => setClients(p.content))
  }, [])

  function runReport(e) {
    if (e) e.preventDefault()
    setError('')
    reportService
      .get({
        from: filters.from || undefined,
        to: filters.to || undefined,
        clientId: filters.clientId || undefined,
        status: filters.status || undefined,
      })
      .then(setReport)
      .catch((err) => setError(err.message))
  }

  useEffect(runReport, []) // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    { key: 'client', label: 'Cliente', primary: true, render: (c) => <span className="font-medium text-slate-800">{c.clientName}</span> },
    { key: 'sold', label: 'Vendido', primary: true, render: (c) => formatCurrency(c.totalSold) },
    {
      key: 'pending',
      label: 'Pendiente',
      render: (c) => (
        <span className={Number(c.totalPending) > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'}>{formatCurrency(c.totalPending)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Reportes</h1>

      <form onSubmit={runReport} className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Desde</span>
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className={inputClass} />
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Hasta</span>
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className={inputClass} />
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Cliente</span>
          <select value={filters.clientId} onChange={(e) => setFilters({ ...filters, clientId: e.target.value })} className={inputClass}>
            <option value="">Todos</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Estado</span>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="col-span-2 md:col-span-4 bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg text-sm">
          Consultar
        </button>
      </form>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Total vendido</p>
              <p className="font-bold text-slate-900">{formatCurrency(report.totalSold)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Total recibido</p>
              <p className="font-bold text-emerald-600">{formatCurrency(report.totalReceived)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Total pendiente</p>
              <p className="font-bold text-rose-600">{formatCurrency(report.totalPending)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Ingresos manuales</p>
              <p className="font-bold text-slate-900">{formatCurrency(report.totalManualIncomes)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Egresos</p>
              <p className="font-bold text-slate-900">{formatCurrency(report.totalExpenses)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Balance</p>
              <p className="font-bold text-slate-900">{formatCurrency(report.balance)}</p>
            </div>
          </div>

          <section>
            <h2 className="text-sm font-semibold text-slate-500 mb-2">Por cliente</h2>
            <ResponsiveList columns={columns} rows={report.byClient} keyExtractor={(c) => c.clientId} emptyMessage="Sin movimientos en el rango seleccionado." />
          </section>
        </>
      )}
    </div>
  )
}
