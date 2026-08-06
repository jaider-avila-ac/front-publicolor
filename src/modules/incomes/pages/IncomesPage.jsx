import { useEffect, useRef, useState } from 'react'
import { Plus, XCircle } from 'lucide-react'
import { incomeService } from '../../../services/incomeService'
import { paymentService } from '../../../services/paymentService'
import { lookupService } from '../../../services/lookupService'
import { formatCurrency, formatDate, todayIso } from '../../../utils/format'
import { useCachedData } from '../../../hooks/useCachedData'
import ResponsiveList from '../../../components/ResponsiveList'
import AnnulDialog from '../../../components/AnnulDialog'
import { inputClass } from '../../../components/FormField'

const empty = { concept: '', amount: '', incomeDate: todayIso(), incomeCategoryId: '', notes: '' }

export default function IncomesPage() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [annulItem, setAnnulItem] = useState(null)
  const [filters, setFilters] = useState({ from: '', to: '', categoryId: '' })
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const annullingRef = useRef(false)

  // Al volver a Ingresos dentro de la misma sesión, se ve de una la última lista
  // (sin pantalla de "Cargando…") mientras se trae la versión fresca por detrás.
  const cacheKey = `incomes:${filters.from}:${filters.to}:${filters.categoryId}`
  const { data: items, refetch } = useCachedData(
    cacheKey,
    () =>
      incomeService.listCombined({
        from: filters.from || undefined,
        to: filters.to || undefined,
        categoryId: filters.categoryId || undefined,
      }),
    [filters.from, filters.to, filters.categoryId],
  )

  useEffect(() => {
    lookupService.get().then((l) => setCategories(l.incomeCategories))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setError('')
    try {
      await incomeService.create({
        concept: form.concept,
        amount: Number(form.amount),
        incomeDate: form.incomeDate,
        incomeCategoryId: form.incomeCategoryId ? Number(form.incomeCategoryId) : null,
        notes: form.notes || null,
      })
      setForm(empty)
      setShowForm(false)
      refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  async function submitAnnul(reason) {
    if (!annulItem || annullingRef.current) return
    annullingRef.current = true
    try {
      // Un abono a trabajo se anula por el endpoint de pagos; un ingreso manual, por el de ingresos.
      if (annulItem.source === 'PAGO') {
        await paymentService.annul(annulItem.id, reason)
      } else {
        await incomeService.annul(annulItem.id, reason)
      }
      setAnnulItem(null)
      refetch()
    } catch (err) {
      setError(err.message)
      setAnnulItem(null)
    } finally {
      annullingRef.current = false
    }
  }

  const columns = [
    {
      key: 'concept',
      label: 'Concepto',
      primary: true,
      render: (i) => (
        <div>
          <span className={`font-medium ${i.annulled ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{i.concept}</span>
          <p className="text-xs text-slate-400">
            {i.code}
            {i.source === 'PAGO' && ` · ${i.jobCode}`}
          </p>
          {i.annulled && <p className="text-xs text-rose-600 font-medium">Anulado{i.annulledReason ? `: ${i.annulledReason}` : ''}</p>}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      primary: true,
      render: (i) => (
        <span className={`font-semibold ${i.annulled ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>{formatCurrency(i.amount)}</span>
      ),
    },
    { key: 'date', label: 'Fecha', render: (i) => formatDate(i.date) },
    { key: 'category', label: 'Categoría', render: (i) => (i.source === 'PAGO' ? 'Pago a trabajo' : i.category?.name || '—') },
    {
      key: 'actions',
      label: 'Acciones',
      primary: true,
      render: (i) =>
        i.annulled ? (
          <span className="text-xs text-slate-400">—</span>
        ) : (
          <button
            title="Anular"
            onClick={(e) => {
              e.stopPropagation()
              setAnnulItem(i)
            }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100"
          >
            <XCircle size={17} />
          </button>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Ingresos</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-3.5 py-2"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <p className="text-xs text-slate-400 -mt-2">Incluye los ingresos manuales y los pagos a trabajos.</p>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-4 space-y-3 max-w-md">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">Concepto *</span>
            <input required value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} className={inputClass} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-medium text-slate-600 mb-1">Valor *</span>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={inputClass}
              />
            </label>
            <label>
              <span className="block text-xs font-medium text-slate-600 mb-1">Fecha *</span>
              <input
                required
                type="date"
                value={form.incomeDate}
                onChange={(e) => setForm({ ...form, incomeDate: e.target.value })}
                className={inputClass}
              />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">Categoría</span>
            <select
              value={form.incomeCategoryId}
              onChange={(e) => setForm({ ...form, incomeCategoryId: e.target.value })}
              className={inputClass}
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">Observación</span>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
          </label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold py-2.5 text-sm"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Desde</span>
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className={inputClass} />
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Hasta</span>
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className={inputClass} />
        </label>
        <label className="col-span-2 md:col-span-1">
          <span className="block text-xs font-medium text-slate-600 mb-1">Categoría</span>
          <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })} className={inputClass}>
            <option value="">Todas (incluye pagos)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ResponsiveList columns={columns} rows={items ?? []} keyExtractor={(i) => `${i.source}-${i.id}`} emptyMessage="No hay ingresos registrados." />

      <AnnulDialog
        open={!!annulItem}
        title="Anular este ingreso"
        message={annulItem ? `Se va a anular "${annulItem.concept}" de ${formatCurrency(annulItem.amount)}.` : ''}
        onConfirm={submitAnnul}
        onCancel={() => setAnnulItem(null)}
      />
    </div>
  )
}
