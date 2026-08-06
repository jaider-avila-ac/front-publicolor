import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, ArrowLeft, XCircle } from 'lucide-react'
import { clientService } from '../../../services/clientService'
import { paymentService } from '../../../services/paymentService'
import { formatCurrency, formatDate } from '../../../utils/format'
import StatusBadge from '../../../components/StatusBadge'
import AnnulDialog from '../../../components/AnnulDialog'
import { inputClass } from '../../../components/FormField'

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [annulPayment, setAnnulPayment] = useState(null)

  function load() {
    clientService.get(id).then((c) => {
      setClient(c)
      setName(c.name)
    })
  }

  useEffect(load, [id])

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    try {
      await clientService.update(id, name)
      setEditing(false)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function submitAnnulPayment(reason) {
    if (!annulPayment) return
    try {
      await paymentService.annul(annulPayment.id, reason)
      setAnnulPayment(null)
      load()
    } catch (err) {
      setError(err.message)
      setAnnulPayment(null)
    }
  }

  if (!client) return <p className="text-slate-400 text-sm">Cargando…</p>

  return (
    <div className="space-y-5 max-w-2xl">
      <button onClick={() => navigate('/clientes')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Clientes
      </button>

      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            className={inputClass + ' flex-1 uppercase'}
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-brand hover:bg-brand-dark text-white font-semibold px-4 py-2.5 text-sm">
              Guardar
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 text-sm text-slate-600">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
          <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-slate-600">
            <Pencil size={16} />
          </button>
        </div>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid grid-cols-3 gap-3">
        <div className=" border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500 mb-1">Comprado</p>
          <p className="font-bold text-slate-900">{formatCurrency(client.totalPurchased)}</p>
        </div>
        <div className=" border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500 mb-1">Pagado</p>
          <p className="font-bold text-emerald-600">{formatCurrency(client.totalPaid)}</p>
        </div>
        <div className=" border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500 mb-1">{Number(client.totalPending) < 0 ? 'Saldo a favor' : 'Pendiente'}</p>
          <p className={`font-bold ${Number(client.totalPending) < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(Math.abs(client.totalPending))}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Trabajos</h2>
        {client.jobs.length === 0 ? (
          <p className="text-slate-400 text-sm">Sin trabajos registrados.</p>
        ) : (
          <div className="space-y-2">
            {client.jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/trabajos/${job.id}`)}
                className=" border border-slate-200 bg-white p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 truncate">{job.code}</p>
                  <p className="text-xs text-slate-400">{formatDate(job.jobDate)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-slate-800">{formatCurrency(job.totalAmount)}</p>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">Pagos anteriores</h2>
        {client.payments.length === 0 ? (
          <p className="text-slate-400 text-sm">Sin pagos registrados.</p>
        ) : (
          <div className="space-y-2">
            {client.payments.map((p) => (
              <div
                key={p.id}
                className={`border border-slate-200 bg-white p-3 flex items-center justify-between gap-3 ${p.annulled ? 'opacity-60' : ''}`}
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
                  <p className={`font-semibold ${p.annulled ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                    {formatCurrency(p.amount)}
                  </p>
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
      </section>

      <AnnulDialog
        open={!!annulPayment}
        title="Anular este pago"
        message={
          annulPayment
            ? `Se va a anular el pago de ${formatCurrency(annulPayment.amount)} del ${formatDate(annulPayment.paymentDate)}.`
            : ''
        }
        onConfirm={submitAnnulPayment}
        onCancel={() => setAnnulPayment(null)}
      />
    </div>
  )
}
