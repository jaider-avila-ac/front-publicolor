import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Pencil, Receipt, Ban, XCircle } from 'lucide-react'
import { jobService } from '../../../services/jobService'
import { paymentService } from '../../../services/paymentService'
import { lookupService } from '../../../services/lookupService'
import { formatCurrency, formatDate, todayIso } from '../../../utils/format'
import { inputClass } from '../../../components/FormField'
import StatusBadge from '../../../components/StatusBadge'
import ConfirmDialog from '../../../components/ConfirmDialog'
import AnnulDialog from '../../../components/AnnulDialog'
import ConceptoForm from '../components/ConceptoForm'

const EDITABLE = ['ABIERTA', 'PARCIALMENTE_PAGADA']

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [payments, setPayments] = useState([])
  const [lookups, setLookups] = useState(null)
  const [error, setError] = useState('')

  const [editingMeta, setEditingMeta] = useState(false)
  const [metaForm, setMetaForm] = useState(null)

  const [itemMode, setItemMode] = useState(null) // 'new' | itemId | null

  const [payForm, setPayForm] = useState({ amount: '', paymentDate: todayIso(), paymentMethodId: '', notes: '' })
  const [payError, setPayError] = useState('')
  const [overpayConfirm, setOverpayConfirm] = useState(null)
  const [paying, setPaying] = useState(false)
  const payingRef = useRef(false)

  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [cancelNeedsForce, setCancelNeedsForce] = useState(false)
  const cancellingRef = useRef(false)

  const [annulPayment, setAnnulPayment] = useState(null)
  const annullingRef = useRef(false)

  const [savingMeta, setSavingMeta] = useState(false)
  const savingMetaRef = useRef(false)
  const removingItemRef = useRef(false)

  function buildTotal(conceptos) {
    return conceptos.reduce((acc, it) => acc + Number(it.totalAmount || 0), 0)
  }

  async function load() {
    const fresh = await jobService.get(id)
    const expectedTotal = buildTotal(fresh.items)
    // El valor total se arma solo a partir de los conceptos — se resincroniza mientras el trabajo siga editable.
    const needsSync = EDITABLE.includes(fresh.status) && expectedTotal !== Number(fresh.totalAmount)
    if (needsSync) {
      const updated = await jobService.update(id, {
        jobDate: fresh.jobDate,
        totalAmount: expectedTotal,
        notes: fresh.notes,
      })
      setJob(updated)
    } else {
      setJob(fresh)
    }
    paymentService.listByJob(id).then(setPayments)
  }

  useEffect(() => {
    load()
    lookupService.get().then(setLookups)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!job || !lookups) return <p className="text-slate-400 text-sm">Cargando…</p>

  const editable = EDITABLE.includes(job.status)

  function startEditMeta() {
    setMetaForm({ jobDate: job.jobDate, notes: job.notes || '' })
    setEditingMeta(true)
  }

  async function saveMeta(e) {
    e.preventDefault()
    if (savingMetaRef.current) return
    savingMetaRef.current = true
    setSavingMeta(true)
    setError('')
    try {
      await jobService.update(id, {
        jobDate: metaForm.jobDate,
        totalAmount: job.totalAmount,
        notes: metaForm.notes || null,
      })
      setEditingMeta(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      savingMetaRef.current = false
      setSavingMeta(false)
    }
  }

  async function handleAddItem(payload) {
    await jobService.addItem(id, payload)
    setItemMode(null)
    load()
  }

  async function handleUpdateItem(itemId, payload) {
    await jobService.updateItem(id, itemId, payload)
    setItemMode(null)
    load()
  }

  async function handleRemoveItem(itemId) {
    if (removingItemRef.current) return
    removingItemRef.current = true
    try {
      await jobService.removeItem(id, itemId)
      load()
    } finally {
      removingItemRef.current = false
    }
  }

  async function submitPayment(e, force = false) {
    if (e) e.preventDefault()
    if (payingRef.current) return
    payingRef.current = true
    setPaying(true)
    setPayError('')
    try {
      await paymentService.create({
        jobId: Number(id),
        amount: Number(payForm.amount),
        paymentDate: payForm.paymentDate,
        paymentMethodId: payForm.paymentMethodId ? Number(payForm.paymentMethodId) : null,
        notes: payForm.notes || null,
        forceOverpay: force,
      })
      setPayForm({ amount: '', paymentDate: todayIso(), paymentMethodId: '', notes: '' })
      setOverpayConfirm(null)
      load()
    } catch (err) {
      if (err.code === 'CONFIRMATION_REQUIRED') {
        setOverpayConfirm(err.message)
      } else {
        setPayError(err.message)
      }
    } finally {
      payingRef.current = false
      setPaying(false)
    }
  }

  async function submitAnnulPayment(reason) {
    if (!annulPayment || annullingRef.current) return
    annullingRef.current = true
    try {
      await paymentService.annul(annulPayment.id, reason)
      setAnnulPayment(null)
      load()
    } catch (err) {
      setError(err.message)
      setAnnulPayment(null)
    } finally {
      annullingRef.current = false
    }
  }

  async function submitCancel(force = false) {
    if (cancellingRef.current) return
    cancellingRef.current = true
    try {
      await jobService.cancel(id, force)
      setCancelConfirm(false)
      setCancelNeedsForce(false)
      load()
    } catch (err) {
      if (err.code === 'CONFIRMATION_REQUIRED') {
        setCancelNeedsForce(true)
      } else {
        setError(err.message)
      }
    } finally {
      cancellingRef.current = false
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => navigate('/trabajos')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Trabajos
      </button>

      {/* Encabezado */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">{job.code}</p>
            <h1 className="text-xl font-bold text-slate-900">{job.client.name}</h1>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {editingMeta ? (
          <form onSubmit={saveMeta} className="space-y-3 bg-white border border-slate-200 p-4">
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1">Fecha</span>
              <input
                required
                type="date"
                value={metaForm.jobDate}
                onChange={(e) => setMetaForm({ ...metaForm, jobDate: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1">Observaciones</span>
              <textarea
                value={metaForm.notes}
                onChange={(e) => setMetaForm({ ...metaForm, notes: e.target.value })}
                className={inputClass}
                rows={2}
              />
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditingMeta(false)} disabled={savingMeta} className="px-3 py-2 text-sm text-slate-600">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingMeta}
                className="bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-semibold px-4 py-2"
              >
                {savingMeta ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-sm text-slate-500">{formatDate(job.jobDate)}</p>
            {job.notes && <p className="text-sm text-slate-600">{job.notes}</p>}
            {editable && (
              <button onClick={startEditMeta} className="flex items-center gap-1 text-sm text-brand font-medium">
                <Pencil size={14} /> Editar
              </button>
            )}
          </>
        )}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {/* Totales */}
      <div className="grid grid-cols-3 gap-3">
        <div className=" border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500 mb-1">Total</p>
          <p className="font-bold text-slate-900">{formatCurrency(job.totalAmount)}</p>
        </div>
        <div className=" border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500 mb-1">Abonado</p>
          <p className="font-bold text-emerald-600">{formatCurrency(job.totalPaid)}</p>
        </div>
        <div className=" border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500 mb-1">Pendiente</p>
          <p className="font-bold text-rose-600">{formatCurrency(job.pendingAmount)}</p>
        </div>
      </div>

      {Number(job.creditApplied) > 0 && (
        <p className="text-sm text-emerald-700 border border-emerald-600 px-3 py-2 font-medium">
          Se aplicó automáticamente {formatCurrency(job.creditApplied)} de saldo a favor de este cliente.
        </p>
      )}

      {/* Acciones principales */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate(`/trabajos/${id}/recibo`)}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-3.5 py-2"
        >
          <Receipt size={16} /> Generar recibo de cobro
        </button>
        {job.status !== 'CANCELADA' && (
          <button
            onClick={() => setCancelConfirm(true)}
            className="flex items-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium px-3.5 py-2"
          >
            <Ban size={16} /> Cancelar cuenta
          </button>
        )}
      </div>

      {/* Conceptos */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-500">Conceptos</h2>
          {editable && itemMode === null && (
            <button onClick={() => setItemMode('new')} className="flex items-center gap-1 text-sm text-brand font-medium">
              <Plus size={15} /> Agregar
            </button>
          )}
        </div>

        <div className="space-y-2">
          {job.items.map((it) =>
            itemMode === it.id ? (
              <ConceptoForm
                key={it.id}
                lookups={lookups}
                initialValue={it}
                onSubmit={(payload) => handleUpdateItem(it.id, payload)}
                onCancel={() => setItemMode(null)}
              />
            ) : (
              <div key={it.id} className="flex items-center justify-between gap-3 border border-slate-200 bg-white p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{it.productType.name}</p>
                  {it.description && <p className="text-xs text-slate-400 truncate">{it.description}</p>}
                  {(it.finishes.length > 0 || it.laminations.length > 0) && (
                    <p className="text-xs text-slate-400 truncate">
                      {[...it.finishes.map((f) => f.name), ...it.laminations.map((l) => l.name)].join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold">{formatCurrency(it.totalAmount)}</span>
                  {editable && (
                    <>
                      <button onClick={() => setItemMode(it.id)} className="text-slate-400 hover:text-brand">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleRemoveItem(it.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        {itemMode === 'new' && (
          <div className="mt-2">
            <ConceptoForm lookups={lookups} onSubmit={handleAddItem} onCancel={() => setItemMode(null)} />
          </div>
        )}
      </section>

      {/* Pagos */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Pagos</h2>

        {payments.length > 0 && (
          <div className="space-y-2 mb-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-3 border border-slate-200 bg-white p-3 ${p.annulled ? 'opacity-60' : ''}`}
              >
                <div>
                  <p className={`text-sm ${p.annulled ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{formatDate(p.paymentDate)}</p>
                  <p className="text-xs text-slate-400">{p.code}</p>
                  {p.paymentMethod && <p className="text-xs text-slate-400">{p.paymentMethod.name}</p>}
                  {p.origin === 'CREDIT_APPLIED' && !p.annulled && (
                    <p className="text-xs text-emerald-600 font-medium">Saldo a favor aplicado</p>
                  )}
                  {p.annulled && (
                    <p className="text-xs text-rose-600 font-medium">
                      Anulado{p.annulledReason ? `: ${p.annulledReason}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-semibold ${p.annulled ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                    {formatCurrency(p.amount)}
                  </span>
                  {!p.annulled && (
                    <button title="Anular pago" onClick={() => setAnnulPayment(p)} className="text-slate-400 hover:text-rose-600">
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {job.status !== 'CANCELADA' && (
          <form onSubmit={(e) => submitPayment(e, false)} className="space-y-3 bg-white border border-slate-200 p-4">
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="block text-xs font-medium text-slate-600 mb-1">Valor *</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="block text-xs font-medium text-slate-600 mb-1">Fecha *</span>
                <input
                  required
                  type="date"
                  value={payForm.paymentDate}
                  onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="col-span-2">
                <span className="block text-xs font-medium text-slate-600 mb-1">Método de pago</span>
                <select
                  value={payForm.paymentMethodId}
                  onChange={(e) => setPayForm({ ...payForm, paymentMethodId: e.target.value })}
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
                <input value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} className={inputClass} />
              </label>
            </div>
            {payError && <p className="text-sm text-rose-600">{payError}</p>}
            <button
              type="submit"
              disabled={paying}
              className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-semibold py-2.5 text-sm"
            >
              {paying ? 'Registrando…' : 'Registrar pago'}
            </button>
          </form>
        )}
      </section>

      <ConfirmDialog
        open={!!overpayConfirm}
        title="El pago supera el saldo pendiente"
        message={overpayConfirm}
        confirmLabel="Registrar de todas formas"
        onConfirm={() => submitPayment(null, true)}
        onCancel={() => setOverpayConfirm(null)}
      />

      <AnnulDialog
        open={!!annulPayment}
        title="Anular este pago"
        message={
          annulPayment
            ? `Se va a anular el pago de ${formatCurrency(annulPayment.amount)} del ${formatDate(annulPayment.paymentDate)}. El trabajo va a volver a mostrar ese valor como pendiente.`
            : ''
        }
        onConfirm={submitAnnulPayment}
        onCancel={() => setAnnulPayment(null)}
      />

      <ConfirmDialog
        open={cancelConfirm}
        title="Cancelar esta cuenta"
        message={
          cancelNeedsForce
            ? 'Este trabajo ya tiene pagos registrados. ¿Confirmás que querés cancelarlo de todas formas?'
            : '¿Seguro que querés cancelar esta cuenta?'
        }
        confirmLabel="Sí, cancelar"
        onConfirm={() => submitCancel(cancelNeedsForce)}
        onCancel={() => {
          setCancelConfirm(false)
          setCancelNeedsForce(false)
        }}
      />
    </div>
  )
}
