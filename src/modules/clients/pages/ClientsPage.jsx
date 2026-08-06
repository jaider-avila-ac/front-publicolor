import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { clientService } from '../../../services/clientService'
import { formatCurrency } from '../../../utils/format'
import ResponsiveList from '../../../components/ResponsiveList'
import PendingAmount from '../../../components/PendingAmount'
import { inputClass } from '../../../components/FormField'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const navigate = useNavigate()

  function load(q) {
    clientService.list(q).then((page) => setClients(page.content))
  }

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 250)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleCreate(e) {
    e.preventDefault()
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setError('')
    try {
      await clientService.create(name)
      setName('')
      setShowForm(false)
      load(search)
    } catch (err) {
      setError(err.message)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Cliente', primary: true, render: (c) => <span className="font-medium text-slate-800">{c.name}</span> },
    {
      key: 'purchased',
      label: 'Comprado',
      primary: true,
      render: (c) => <span className="font-semibold">{formatCurrency(c.totalPurchased)}</span>,
    },
    { key: 'paid', label: 'Pagado', render: (c) => formatCurrency(c.totalPaid) },
    { key: 'pending', label: 'Pendiente', render: (c) => <PendingAmount amount={c.totalPending} /> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-3.5 py-2"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
          <input
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="Nombre del cliente"
            className={inputClass + ' flex-1 uppercase placeholder:normal-case'}
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold px-4 py-2.5 text-sm"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente por nombre…" className={inputClass} />

      <ResponsiveList
        columns={columns}
        rows={clients}
        keyExtractor={(c) => c.id}
        onRowClick={(c) => navigate(`/clientes/${c.id}`)}
        emptyMessage="No hay clientes registrados todavía."
      />
    </div>
  )
}
