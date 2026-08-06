import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { paymentService } from '../../../services/paymentService'
import { inputClass } from '../../../components/FormField'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { todayIso } from '../../../utils/format'

const empty = { amount: '', paymentDate: todayIso(), paymentMethodId: '', notes: '' }

export default function PagoModal({ job, lookups, onClose, onSuccess }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [overpayConfirm, setOverpayConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  async function submit(e, force = false) {
    if (e) e.preventDefault()
    if (savingRef.current) return
    savingRef.current = true
    setError('')
    setSaving(true)
    try {
      await paymentService.create({
        jobId: job.id,
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
        paymentMethodId: form.paymentMethodId ? Number(form.paymentMethodId) : null,
        notes: form.notes || null,
        forceOverpay: force,
      })
      setOverpayConfirm(null)
      onSuccess()
    } catch (err) {
      if (err.code === 'CONFIRMATION_REQUIRED') {
        setOverpayConfirm(err.message)
      } else {
        setError(err.message)
      }
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900">Registrar pago</h3>
            <p className="text-xs text-slate-400 truncate">
              {job.client.name} · {job.code}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => submit(e, false)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="block text-xs font-medium text-slate-600 mb-1">Valor *</span>
              <input
                required
                autoFocus
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
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="col-span-2">
              <span className="block text-xs font-medium text-slate-600 mb-1">Método de pago</span>
              <select
                value={form.paymentMethodId}
                onChange={(e) => setForm({ ...form, paymentMethodId: e.target.value })}
                className={inputClass}
              >
                <option value="">Sin especificar</option>
                {lookups.paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="col-span-2">
              <span className="block text-xs font-medium text-slate-600 mb-1">Nota</span>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
            </label>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold py-2.5 text-sm"
          >
            {saving ? 'Guardando…' : 'Registrar pago'}
          </button>
        </form>
      </div>

      <ConfirmDialog
        open={!!overpayConfirm}
        title="El abono supera el saldo pendiente"
        message={overpayConfirm}
        confirmLabel="Registrar de todas formas"
        onConfirm={() => submit(null, true)}
        onCancel={() => setOverpayConfirm(null)}
      />
    </div>
  )
}
