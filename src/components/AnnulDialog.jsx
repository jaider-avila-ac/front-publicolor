import { useState } from 'react'
import { inputClass } from './FormField'

export default function AnnulDialog({ open, title, message, onConfirm, onCancel }) {
  const [reason, setReason] = useState('')

  if (!open) return null

  function handleConfirm() {
    onConfirm(reason || null)
    setReason('')
  }

  function handleCancel() {
    setReason('')
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-600 mb-3">{message}</p>
        <label className="block mb-4">
          <span className="block text-xs font-medium text-slate-600 mb-1">Motivo (opcional)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={inputClass}
            rows={2}
            placeholder="Ej: se registró por error"
          />
        </label>
        <div className="flex gap-2 justify-end">
          <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 text-sm font-medium bg-rose-600 text-white hover:bg-rose-700">
            Sí, anular
          </button>
        </div>
      </div>
    </div>
  )
}
