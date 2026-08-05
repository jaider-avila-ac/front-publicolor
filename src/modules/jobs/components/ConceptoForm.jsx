import { useState } from 'react'
import { inputClass } from '../../../components/FormField'

const empty = {
  productTypeId: '',
  description: '',
  quantity: '',
  width: '',
  height: '',
  finishId: '',
  laminationId: '',
  unitPrice: '',
  totalAmount: '',
  notes: '',
}

function toPayload(form) {
  const num = (v) => (v === '' || v === null ? null : Number(v))
  return {
    productTypeId: Number(form.productTypeId),
    description: form.description || null,
    quantity: num(form.quantity),
    width: num(form.width),
    height: num(form.height),
    finishId: form.finishId ? Number(form.finishId) : null,
    laminationId: form.laminationId ? Number(form.laminationId) : null,
    unitPrice: num(form.unitPrice),
    totalAmount: Number(form.totalAmount),
    notes: form.notes || null,
  }
}

export default function ConceptoForm({ lookups, initialValue, onSubmit, onCancel }) {
  const [form, setForm] = useState(() =>
    initialValue
      ? {
          productTypeId: initialValue.productType?.id ?? '',
          description: initialValue.description ?? '',
          quantity: initialValue.quantity ?? '',
          width: initialValue.width ?? '',
          height: initialValue.height ?? '',
          finishId: initialValue.finish?.id ?? '',
          laminationId: initialValue.lamination?.id ?? '',
          unitPrice: initialValue.unitPrice ?? '',
          totalAmount: initialValue.totalAmount ?? '',
          notes: initialValue.notes ?? '',
        }
      : empty,
  )

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(toPayload(form))
  }

  return (
    <form onSubmit={handleSubmit} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 sm:col-span-1">
          <span className="block text-xs font-medium text-slate-600 mb-1">Producto *</span>
          <select required value={form.productTypeId} onChange={set('productTypeId')} className={inputClass}>
            <option value="">Seleccionar…</option>
            {lookups.productTypes.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="col-span-2 sm:col-span-1">
          <span className="block text-xs font-medium text-slate-600 mb-1">Descripción</span>
          <input value={form.description} onChange={set('description')} className={inputClass} />
        </label>

        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Cantidad</span>
          <input type="number" step="0.01" min="0" value={form.quantity} onChange={set('quantity')} className={inputClass} />
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Ancho</span>
          <input type="number" step="0.01" min="0" value={form.width} onChange={set('width')} className={inputClass} />
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Alto</span>
          <input type="number" step="0.01" min="0" value={form.height} onChange={set('height')} className={inputClass} />
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Precio unitario</span>
          <input type="number" step="0.01" min="0" value={form.unitPrice} onChange={set('unitPrice')} className={inputClass} />
        </label>

        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Acabado</span>
          <select value={form.finishId} onChange={set('finishId')} className={inputClass}>
            <option value="">No aplica</option>
            {lookups.finishes.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Laminado</span>
          <select value={form.laminationId} onChange={set('laminationId')} className={inputClass}>
            <option value="">Sin laminado</option>
            {lookups.laminations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>

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
          <button type="button" onClick={onCancel} className="px-3 py-2 text-sm text-slate-600">
            Cancelar
          </button>
        )}
        <button type="submit" className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-lg">
          Guardar concepto
        </button>
      </div>
    </form>
  )
}
