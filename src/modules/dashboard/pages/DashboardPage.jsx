import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../../../services/dashboardService'
import { formatCurrency } from '../../../utils/format'
import { useCachedData } from '../../../hooks/useCachedData'
import StatTile from '../components/StatTile'
import StatusBadge from '../../../components/StatusBadge'
import IncomeBarChart from '../components/IncomeBarChart'

export default function DashboardPage() {
  const [granularity, setGranularity] = useState('day')
  const navigate = useNavigate()

  // Al volver al Panel dentro de la misma sesión, se ve de una lo último que había
  // (sin pantalla de "Cargando…") mientras se trae la versión fresca por detrás.
  const { data, error } = useCachedData('dashboard', () => dashboardService.get(), [])
  const { data: chartPoints } = useCachedData(
    `income-chart:${granularity}`,
    () => dashboardService.getIncomeChart(granularity),
    [granularity],
  )

  if (error) return <p className="text-rose-600 text-sm">{error}</p>
  if (!data) return <p className="text-slate-400 text-sm">Cargando…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Panel</h1>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Ventas</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Vendido hoy" value={formatCurrency(data.soldToday)} />
          <StatTile label="Vendido este mes" value={formatCurrency(data.soldMonth)} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Cobros y pendientes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatTile label="Recibido hoy" value={formatCurrency(data.receivedToday)} tone="positive" />
          <StatTile label="Recibido este mes" value={formatCurrency(data.receivedMonth)} tone="positive" />
          <StatTile label="Total pendiente por cobrar" value={formatCurrency(data.pendingTotal)} tone="negative" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-500">Ingresos</h2>
          <div className="flex border border-slate-200">
            <button
              onClick={() => setGranularity('day')}
              className={`px-3 py-1 text-xs font-medium ${granularity === 'day' ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Por día
            </button>
            <button
              onClick={() => setGranularity('month')}
              className={`px-3 py-1 text-xs font-medium ${granularity === 'month' ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Por mes
            </button>
          </div>
        </div>
        {chartPoints ? <IncomeBarChart points={chartPoints} granularity={granularity} /> : <p className="text-slate-400 text-sm">Cargando…</p>}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Egresos y balance</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatTile label="Egresos hoy" value={formatCurrency(data.expensesToday)} tone="negative" />
          <StatTile label="Egresos este mes" value={formatCurrency(data.expensesMonth)} tone="negative" />
          <StatTile label="Balance hoy" value={formatCurrency(data.balanceToday)} />
          <StatTile label="Balance del mes" value={formatCurrency(data.balanceMonth)} />
          <StatTile label="Cuentas abiertas" value={data.openAccounts} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Trabajos recientes</h2>
        {data.recentJobs.length === 0 ? (
          <p className="text-slate-400 text-sm">Todavía no hay trabajos registrados.</p>
        ) : (
          <div className="space-y-2">
            {data.recentJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/trabajos/${job.id}`)}
                className=" border border-slate-200 bg-white p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{job.client.name}</p>
                  <p className="text-xs text-slate-400 truncate">{job.code}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-slate-800">{formatCurrency(job.totalAmount)}</p>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
