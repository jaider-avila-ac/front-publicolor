import { formatCurrency } from '../utils/format'

/**
 * Muestra un saldo pendiente: rojo si el cliente/trabajo debe, gris si está en cero,
 * y "A favor" en verde si pagó de más (para dejarlo aplicado a una próxima compra).
 */
export default function PendingAmount({ amount }) {
  const value = Number(amount)

  if (value < 0) {
    return <span className="text-emerald-600 font-medium">A favor: {formatCurrency(Math.abs(value))}</span>
  }
  if (value > 0) {
    return <span className="text-rose-600 font-medium">{formatCurrency(value)}</span>
  }
  return <span className="text-slate-500">{formatCurrency(value)}</span>
}
