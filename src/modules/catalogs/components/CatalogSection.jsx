import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Check, X } from 'lucide-react'
import { catalogAdminService } from '../../../services/catalogAdminService'
import { inputClass } from '../../../components/FormField'

export default function CatalogSection({ type, title }) {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const editingRef = useRef(false)
  const togglingRef = useRef(false)

  function load() {
    catalogAdminService.list(type).then(setItems).catch((e) => setError(e.message))
  }

  useEffect(load, [type]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e) {
    e.preventDefault()
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setError('')
    try {
      await catalogAdminService.create(type, newName.trim())
      setNewName('')
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  async function saveEdit(item) {
    if (editingRef.current) return
    editingRef.current = true
    setError('')
    try {
      await catalogAdminService.update(type, item.id, { name: editingName.trim(), active: item.active })
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      editingRef.current = false
    }
  }

  async function toggleActive(item) {
    if (togglingRef.current) return
    togglingRef.current = true
    setError('')
    try {
      await catalogAdminService.update(type, item.id, { name: item.name, active: !item.active })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      togglingRef.current = false
    }
  }

  return (
    <div className="section-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 text-xs text-brand font-semibold">
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="flex gap-2 mb-3">
          <input
            autoFocus
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={inputClass + ' text-sm py-1.5'}
            placeholder="Nombre"
          />
          <button type="submit" disabled={saving} className="btn-primary py-1.5 px-3 text-xs disabled:opacity-60">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}

      {error && <p className="text-xs text-rose-600 mb-2">{error}</p>}

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 py-2">
            {editingId === item.id ? (
              <>
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className={inputClass + ' text-sm py-1 flex-1'}
                />
                <button onClick={() => saveEdit(item)} className="text-emerald-600 hover:text-emerald-700 shrink-0">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className={`text-sm flex-1 truncate ${item.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                  {item.name}
                </span>
                <button onClick={() => startEdit(item)} className="text-slate-400 hover:text-brand shrink-0">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => toggleActive(item)}
                  className={`text-xs font-medium px-2 py-1 border shrink-0 ${
                    item.active ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-brand text-brand hover:bg-brand hover:text-white'
                  }`}
                >
                  {item.active ? 'Desactivar' : 'Activar'}
                </button>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-slate-400 py-2">Sin elementos.</p>}
      </div>
    </div>
  )
}
