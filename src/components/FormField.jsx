/** Envoltorio label + control, para formularios de una sola columna. */
export default function FormField({ label, required, error, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-rose-600 mt-1">{error}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[15px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'
