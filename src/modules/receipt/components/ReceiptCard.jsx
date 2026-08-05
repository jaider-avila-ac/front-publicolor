import { forwardRef } from 'react'
import { formatCurrency, formatDateTime } from '../../../utils/format'

const ReceiptCard = forwardRef(function ReceiptCard({ receipt }, ref) {
  return (
    <div ref={ref} className="bg-white w-full max-w-md mx-auto p-6" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
        <p className="text-2xl font-bold text-brand">{receipt.businessName}</p>
        <p className="text-sm font-semibold tracking-wide text-slate-700 mt-1">RECIBO DE COBRO</p>
      </div>

      <div className="flex justify-between text-sm text-slate-600 mb-4">
        <span>Recibo N.º {receipt.consecutiveNumber}</span>
        <span>{formatDateTime(receipt.generatedAt)}</span>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-400">Cliente</p>
        <p className="font-semibold text-slate-900">{receipt.clientName}</p>
        <p className="text-sm text-slate-600">{receipt.jobTitle}</p>
      </div>

      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-slate-300 text-left text-slate-500">
            <th className="py-1.5 font-medium">Concepto</th>
            <th className="py-1.5 font-medium text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((it, idx) => (
            <tr key={idx} className="border-b border-slate-100">
              <td className="py-1.5 text-slate-700">
                {it.productType}
                {it.description ? ` — ${it.description}` : ''}
              </td>
              <td className="py-1.5 text-right text-slate-700">{formatCurrency(it.totalAmount)}</td>
            </tr>
          ))}
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
        <div className="flex justify-between text-base border-t border-slate-200 pt-1.5 mt-1.5">
          <span className="font-semibold text-slate-900">Saldo pendiente</span>
          <span className="font-bold text-rose-600">{formatCurrency(receipt.pendingAmount)}</span>
        </div>
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
