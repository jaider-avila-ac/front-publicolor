import { forwardRef } from 'react'
import { formatCurrency, formatDateTime } from '../../../utils/format'
import logo from '../../../assets/logo-publicolor.png'

const ReceiptCard = forwardRef(function ReceiptCard({ receipt }, ref) {
  return (
    <div ref={ref} className="bg-white p-6" style={{ fontFamily: 'Arial, sans-serif', width: 480 }}>
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
        <img src={logo} alt={receipt.businessName} className="h-10 mx-auto mb-1" />
        <p className="text-sm font-semibold tracking-wide text-slate-700 mt-1">RECIBO DE COBRO</p>
      </div>

      <div className="flex justify-between text-sm text-slate-600 mb-4">
        <span>Recibo N.º {receipt.consecutiveNumber}</span>
        <span>{formatDateTime(receipt.generatedAt)}</span>
      </div>

      <div className="flex justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-slate-400">Cliente</p>
          <p className="font-semibold text-slate-900">{receipt.clientName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Trabajo</p>
          <p className="font-semibold text-slate-900">{receipt.jobCode}</p>
        </div>
      </div>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-slate-300 text-left text-slate-500">
            <th className="py-1.5 font-medium">Concepto</th>
            <th className="py-1.5 font-medium text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((it, idx) => {
            const detalles = [...(it.finishes || []), ...(it.laminations || [])]
            return (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-1.5 text-slate-700">
                  {it.productType}
                  {it.description ? ` — ${it.description}` : ''}
                  {detalles.length > 0 && <div className="text-xs text-slate-400">{detalles.join(' · ')}</div>}
                  {it.notes && <div className="text-xs text-slate-400 italic">{it.notes}</div>}
                </td>
                <td className="py-1.5 text-right text-slate-700">{formatCurrency(it.totalAmount)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="space-y-1 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-slate-500">Valor total</span>
          <span className="font-semibold text-slate-900">{formatCurrency(receipt.totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total abonado</span>
          <span className="font-semibold text-emerald-600">{formatCurrency(receipt.totalPaid)}</span>
        </div>
        {Number(receipt.creditApplied) > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">Saldo a favor aplicado</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(receipt.creditApplied)}</span>
          </div>
        )}
        <div className="flex justify-between text-base border-t border-slate-200 pt-1.5 mt-1.5">
          <span className="font-semibold text-slate-900">Saldo pendiente</span>
          <span className="font-bold text-rose-600">{formatCurrency(receipt.pendingAmount)}</span>
        </div>
        {Number(receipt.remainingCredit) > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">Saldo a favor disponible</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(receipt.remainingCredit)}</span>
          </div>
        )}
      </div>

      {receipt.notes && (
        <div className="mb-4">
          <p className="text-xs text-slate-400">Observaciones</p>
          <p className="text-sm text-slate-600">{receipt.notes}</p>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center border-t border-slate-200 pt-3">{receipt.disclaimer}</p>
    </div>
  )
})

export default ReceiptCard
