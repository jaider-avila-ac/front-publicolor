import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
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
  const [clientName, setClientName] = useState(searchParams.get('clientName') || '')
  const [selectedClient, setSelectedClient] = useState(null)
  const [jobDate, setJobDate] = useState(todayIso())
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([])
  const [showItemForm, setShowItemForm] = useState(true)
  const [error, setError] = useState('')
  const [pendingJobId, setPendingJobId] = useState(null)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  const itemsSum = items.reduce((acc, it) => acc + Number(it.totalAmount || 0), 0)

  useEffect(() => {
    lookupService.get().then(setLookups)
    clientService.list('').then((p) => {
      setClients(p.content)
      const match = p.content.find((c) => c.name === clientName)
      if (match) setSelectedClient(match)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClientNameChange(e) {
    const value = e.target.value.toUpperCase()
    setClientName(value)
    const match = clients.find((c) => c.name === value)
    if (match) setSelectedClient(match)
  }

  function clearClientSelection() {
    setSelectedClient(null)
    setClientName('')
  }

  function addItem(payload) {
    setItems((prev) => [...prev, payload])
    setShowItemForm(false)
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function productName(id) {
    return lookups?.productTypes.find((p) => p.id === id)?.name || ''
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (savingRef.current) return
    setError('')
    setPendingJobId(null)
    if (items.length === 0) {
      setError('El trabajo debe tener al menos un concepto.')
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const job = await jobService.create({
        clientId: selectedClient?.id,
        clientName: selectedClient ? undefined : clientName.trim(),
        jobDate,
        totalAmount: itemsSum,
        notes: notes || null,
        items,
      })
      navigate(`/trabajos/${job.id}`, { replace: true })
    } catch (err) {
      if (err.code === 'PENDING_ACCOUNT_EXISTS') {
        setPendingJobId(err.existingJobId)
      }
      setError(err.message)
    } finally {
      savingRef.current = false
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

      {/* No es un <form> real: ConceptoForm ya es un <form> propio y HTML no permite formularios anidados. */}
      <div className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Cliente *</span>
          <div className="relative">
            <input
              required
              list="clientes-existentes"
              value={clientName}
              onChange={handleClientNameChange}
              readOnly={!!selectedClient}
              placeholder="Nombre del cliente"
              className={inputClass + ' uppercase placeholder:normal-case' + (selectedClient ? ' bg-slate-50 pr-9' : '')}
            />
            {selectedClient && (
              <button
                type="button"
                onClick={clearClientSelection}
                title="Cambiar cliente"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <datalist id="clientes-existentes">
            {clients.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <p className="text-xs text-slate-400 mt-1">
            {selectedClient
              ? 'Cliente existente seleccionado. Tocá la X para elegir otro.'
              : 'Si el cliente ya existe se usa; si no, se crea automáticamente con este nombre.'}
          </p>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Fecha *</span>
          <input required type="date" value={jobDate} onChange={(e) => setJobDate(e.target.value)} className={inputClass} />
        </label>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Conceptos *</span>
            {!showItemForm && (
              <button
                type="button"
                onClick={() => setShowItemForm(true)}
                className="flex items-center gap-1 text-sm text-brand font-medium"
              >
                <Plus size={15} /> Agregar concepto
              </button>
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-2 mb-3">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 border border-slate-200 bg-white p-3">
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
            <ConceptoForm lookups={lookups} onSubmit={addItem} onCancel={items.length > 0 ? () => setShowItemForm(false) : undefined} />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-sm font-medium text-slate-700">Total del trabajo</span>
          <span className="text-lg font-bold text-slate-900">{formatCurrency(itemsSum)}</span>
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Observaciones</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={3} />
        </label>

        {error && (
          <p className="text-sm text-rose-600">
            {error}
            {pendingJobId && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={() => navigate(`/trabajos/${pendingJobId}`)}
                  className="underline font-medium"
                >
                  Ir a esa cuenta
                </button>
              </>
            )}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold py-3"
        >
          {saving ? 'Guardando…' : 'Crear trabajo'}
        </button>
      </div>
    </div>
  )
}
