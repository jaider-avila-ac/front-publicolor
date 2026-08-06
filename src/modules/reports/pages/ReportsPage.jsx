import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { reportService } from '../../../services/reportService'
import { clientService } from '../../../services/clientService'
import { formatCurrency, formatDate, todayIso } from '../../../utils/format'
import { inputClass } from '../../../components/FormField'
import ResponsiveList from '../../../components/ResponsiveList'
import StatusBadge from '../../../components/StatusBadge'

const PDF_TYPES = [
  { value: 'BOTH', label: 'Ingresos y egresos' },
  { value: 'INCOMES', label: 'Solo ingresos' },
  { value: 'EXPENSES', label: 'Solo egresos' },
]

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

  const [pdfType, setPdfType] = useState('BOTH')
  const [pdfFrom, setPdfFrom] = useState(todayIso())
  const [pdfTo, setPdfTo] = useState(todayIso())
  const [pdfError, setPdfError] = useState('')
  const [pdfBusy, setPdfBusy] = useState(false)

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

  async function handleExportPdf(e) {
    e.preventDefault()
    setPdfError('')
    setPdfBusy(true)
    try {
      const blob = await reportService.exportPdf(pdfType, pdfFrom, pdfTo)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `publicolor-${pdfType.toLowerCase()}-${pdfFrom}_${pdfTo}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setPdfError(err.message)
    } finally {
      setPdfBusy(false)
    }
  }

  const columns = [
    { key: 'client', label: 'Cliente', primary: true, render: (c) => <span className="font-medium text-slate-800">{c.clientName}</span> },
    { key: 'sold', label: 'Vendido', primary: true, render: (c) => formatCurrency(c.totalSold) },
    {
      key: 'pending',
      label: 'Pendiente',
      render: (c) => (
        <span className={Number(c.totalPending) > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'}>
          {formatCurrency(c.totalPending)}
        </span>
      ),
    },
  ]

  const jobColumns = [
    {
      key: 'code',
      label: 'Trabajo',
      primary: true,
      render: (j) => (
        <div>
          <p className="font-medium text-slate-800">{j.code}</p>
          <p className="text-xs text-slate-400 truncate">{j.clientName}</p>
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
        <span className={Number(j.totalPending) > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'}>
          {formatCurrency(j.totalPending)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Reportes</h1>

      <section className="bg-white border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Exportar PDF de ingresos / egresos</h2>
        <form onSubmit={handleExportPdf} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <label>
            <span className="block text-xs font-medium text-slate-600 mb-1">Qué incluir</span>
            <select value={pdfType} onChange={(e) => setPdfType(e.target.value)} className={inputClass}>
              {PDF_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-xs font-medium text-slate-600 mb-1">Desde</span>
            <input required type="date" value={pdfFrom} onChange={(e) => setPdfFrom(e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className="block text-xs font-medium text-slate-600 mb-1">Hasta</span>
            <input required type="date" value={pdfTo} onChange={(e) => setPdfTo(e.target.value)} className={inputClass} />
          </label>
          <button
            type="submit"
            disabled={pdfBusy}
            className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold py-2.5 text-sm"
          >
            <Download size={16} /> {pdfBusy ? 'Generando…' : 'Descargar PDF'}
          </button>
        </form>
        {pdfError && <p className="text-sm text-rose-600 mt-2">{pdfError}</p>}
      </section>

      <form onSubmit={runReport} className="bg-white border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Desde</span>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className={inputClass}
          />
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
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Estado</span>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="col-span-2 md:col-span-4 bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 text-sm">
          Consultar
        </button>
      </form>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className=" border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Total vendido</p>
              <p className="font-bold text-slate-900">{formatCurrency(report.totalSold)}</p>
            </div>
            <div className=" border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Total recibido</p>
              <p className="font-bold text-emerald-600">{formatCurrency(report.totalReceived)}</p>
            </div>
            <div className=" border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Total pendiente</p>
              <p className="font-bold text-rose-600">{formatCurrency(report.totalPending)}</p>
            </div>
            <div className=" border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Ingresos manuales</p>
              <p className="font-bold text-slate-900">{formatCurrency(report.totalManualIncomes)}</p>
            </div>
            <div className=" border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Egresos</p>
              <p className="font-bold text-slate-900">{formatCurrency(report.totalExpenses)}</p>
            </div>
            <div className=" border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500 mb-1">Balance</p>
              <p className="font-bold text-slate-900">{formatCurrency(report.balance)}</p>
            </div>
          </div>

          <section>
            <h2 className="text-sm font-semibold text-slate-500 mb-2">Por cliente</h2>
            <ResponsiveList
              columns={columns}
              rows={report.byClient}
              keyExtractor={(c) => c.clientId}
              emptyMessage="Sin movimientos en el rango seleccionado."
            />
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-500 mb-2">Trabajos</h2>
            <ResponsiveList
              columns={jobColumns}
              rows={report.jobs}
              keyExtractor={(j) => j.jobId}
              emptyMessage="Sin trabajos en el rango seleccionado."
            />
          </section>
        </>
      )}
    </div>
  )
}
