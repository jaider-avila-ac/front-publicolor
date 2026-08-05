import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react'
import { jobService } from '../../../services/jobService'
import { clientService } from '../../../services/clientService'
import { lookupService } from '../../../services/lookupService'
import { formatCurrency, todayIso } from '../../../utils/format'
import { inputClass } from '../../../components/FormField'
import ConceptoForm from '../components/ConceptoForm'

export default function JobFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [lookups, setLookups] = useState(null)
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '')
  const [title, setTitle] = useState('')
  const [jobDate, setJobDate] = useState(todayIso())
  const [totalAmount, setTotalAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([])
  const [showItemForm, setShowItemForm] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    lookupService.get().then(setLookups)
    clientService.list('').then((p) => setClients(p.content))
  }, [])

  function addItem(payload) {
    setItems((prev) => [...prev, payload])
    setShowItemForm(false)
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function sumItems() {
    const sum = items.reduce((acc, it) => acc + Number(it.totalAmount || 0), 0)
    setTotalAmount(String(sum))
  }

  function productName(id) {
    return lookups?.productTypes.find((p) => p.id === id)?.name || ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (items.length === 0) {
      setError('El trabajo debe tener al menos un concepto.')
      return
    }
    setSaving(true)
    try {
      const job = await jobService.create({
        clientId: Number(clientId),
        title,
        jobDate,
        totalAmount: Number(totalAmount),
        notes: notes || null,
        items,
      })
      navigate(`/trabajos/${job.id}`, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!lookups) return <p className="text-slate-400 text-sm">Cargando…</p>

  return (
    <div className="max-w-2xl space-y-5">
      <button onClick={() => navigate('/trabajos')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Trabajos
      </button>
      <h1 className="text-xl font-bold text-slate-900">Nuevo trabajo</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Cliente *</span>
          <select required value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
            <option value="">Seleccionar…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Título / descripción general *</span>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Fecha *</span>
          <input required type="date" value={jobDate} onChange={(e) => setJobDate(e.target.value)} className={inputClass} />
        </label>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Conceptos *</span>
            {!showItemForm && (
              <button type="button" onClick={() => setShowItemForm(true)} className="flex items-center gap-1 text-sm text-brand font-medium">
                <Plus size={15} /> Agregar concepto
              </button>
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-2 mb-3">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{productName(it.productTypeId)}</p>
                    {it.description && <p className="text-xs text-slate-400 truncate">{it.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">{formatCurrency(it.totalAmount)}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showItemForm && (
            <ConceptoForm
              lookups={lookups}
              onSubmit={addItem}
              onCancel={items.length > 0 ? () => setShowItemForm(false) : undefined}
            />
          )}
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Valor total del trabajo *</span>
          <div className="flex gap-2">
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className={inputClass}
            />
            {items.length > 0 && (
              <button
                type="button"
                onClick={sumItems}
                title="Sumar los conceptos"
                className="shrink-0 px-3 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
              >
                <Calculator size={18} />
              </button>
            )}
          </div>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Observaciones</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={3} />
        </label>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
        >
          {saving ? 'Guardando…' : 'Crear trabajo'}
        </button>
      </form>
    </div>
  )
}
