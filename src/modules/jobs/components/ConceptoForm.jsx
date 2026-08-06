import { useRef, useState } from 'react'
import { inputClass } from '../../../components/FormField'

const empty = {
  productTypeId: '',
  description: '',
  finishIds: [],
  laminationIds: [],
  totalAmount: '',
  notes: '',
}

function toPayload(form) {
  return {
    productTypeId: Number(form.productTypeId),
    description: form.description || null,
    quantity: null,
    width: null,
    height: null,
    finishIds: form.finishIds,
    laminationIds: form.laminationIds,
    unitPrice: null,
    totalAmount: Number(form.totalAmount),
    notes: form.notes || null,
  }
}

function toggleId(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

export default function ConceptoForm({ lookups, initialValue, onSubmit, onCancel }) {
  const [form, setForm] = useState(() =>
    initialValue
      ? {
          productTypeId: initialValue.productType?.id ?? '',
          description: initialValue.description ?? '',
          finishIds: (initialValue.finishes ?? []).map((f) => f.id),
          laminationIds: (initialValue.laminations ?? []).map((l) => l.id),
          totalAmount: initialValue.totalAmount ?? '',
          notes: initialValue.notes ?? '',
        }
      : empty,
  )
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      await onSubmit(toPayload(form))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-slate-200 p-4 space-y-3 bg-slate-50">
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 sm:col-span-1">
          <span className="block text-xs font-medium text-slate-600 mb-1">Producto *</span>
          <select required value={form.productTypeId} onChange={set('productTypeId')} className={inputClass}>
            <option value="">Seleccionar…</option>
            {lookups.productTypes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-2 sm:col-span-1">
          <span className="block text-xs font-medium text-slate-600 mb-1">Descripción</span>
          <input value={form.description} onChange={set('description')} placeholder="Ej: 2m x 1m" className={inputClass} />
        </label>

        <div className="col-span-2 sm:col-span-1">
          <details open={form.finishIds.length > 0}>
            <summary className="text-xs font-medium text-slate-600 cursor-pointer select-none">
              Acabado{form.finishIds.length > 0 ? ` (${form.finishIds.length})` : ''}
            </summary>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
              {lookups.finishes.map((f) => (
                <label key={f.id} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.finishIds.includes(f.id)}
                    onChange={() => setForm((prev) => ({ ...prev, finishIds: toggleId(prev.finishIds, f.id) }))}
                    className="accent-brand"
                  />
                  {f.name}
                </label>
              ))}
            </div>
          </details>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <details open={form.laminationIds.length > 0}>
            <summary className="text-xs font-medium text-slate-600 cursor-pointer select-none">
              Laminado{form.laminationIds.length > 0 ? ` (${form.laminationIds.length})` : ''}
            </summary>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
              {lookups.laminations.map((l) => (
                <label key={l.id} className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.laminationIds.includes(l.id)}
                    onChange={() => setForm((prev) => ({ ...prev, laminationIds: toggleId(prev.laminationIds, l.id) }))}
                    className="accent-brand"
                  />
                  {l.name}
                </label>
              ))}
            </div>
          </details>
        </div>

        <label className="col-span-2">
          <span className="block text-xs font-medium text-slate-600 mb-1">Valor del concepto *</span>
          <input required type="number" step="0.01" min="0" value={form.totalAmount} onChange={set('totalAmount')} className={inputClass} />
        </label>
        <label className="col-span-2">
          <span className="block text-xs font-medium text-slate-600 mb-1">Observaciones</span>
          <textarea value={form.notes} onChange={set('notes')} className={inputClass} rows={2} />
        </label>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting} className="px-3 py-2 text-sm text-slate-600">
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-semibold px-4 py-2"
        >
          {submitting ? 'Guardando…' : 'Guardar concepto'}
        </button>
      </div>
    </form>
  )
}
