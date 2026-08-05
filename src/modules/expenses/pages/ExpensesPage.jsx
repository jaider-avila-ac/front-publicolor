import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { expenseService } from '../../../services/expenseService'
import { lookupService } from '../../../services/lookupService'
import { formatCurrency, formatDate, todayIso } from '../../../utils/format'
import ResponsiveList from '../../../components/ResponsiveList'
import { inputClass } from '../../../components/FormField'

const empty = { concept: '', amount: '', expenseDate: todayIso(), expenseCategoryId: '', notes: '' }

export default function ExpensesPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  function load() {
    expenseService.list().then((p) => setItems(p.content))
  }

  useEffect(() => {
    load()
    lookupService.get().then((l) => setCategories(l.expenseCategories))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      await expenseService.create({
        concept: form.concept,
        amount: Number(form.amount),
        expenseDate: form.expenseDate,
        expenseCategoryId: form.expenseCategoryId ? Number(form.expenseCategoryId) : null,
        notes: form.notes || null,
      })
      setForm(empty)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const columns = [
    { key: 'concept', label: 'Concepto', primary: true, render: (i) => <span className="font-medium text-slate-800">{i.concept}</span> },
    { key: 'amount', label: 'Valor', primary: true, render: (i) => <span className="font-semibold text-rose-600">{formatCurrency(i.amount)}</span> },
    { key: 'date', label: 'Fecha', render: (i) => formatDate(i.expenseDate) },
    { key: 'category', label: 'Categoría', render: (i) => i.category?.name || '—' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Egresos</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-3.5 py-2 rounded-lg"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 max-w-md">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">Concepto *</span>
            <input required value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} className={inputClass} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-medium text-slate-600 mb-1">Valor *</span>
              <input required type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} />
            </label>
            <label>
              <span className="block text-xs font-medium text-slate-600 mb-1">Fecha *</span>
              <input required type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} className={inputClass} />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">Categoría</span>
            <select value={form.expenseCategoryId} onChange={(e) => setForm({ ...form, expenseCategoryId: e.target.value })} className={inputClass}>
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1">Observación</span>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
          </label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-2.5 rounded-lg text-sm">
            Guardar
          </button>
        </form>
      )}

      <ResponsiveList columns={columns} rows={items} keyExtractor={(i) => i.id} emptyMessage="No hay egresos registrados." />
    </div>
  )
}
