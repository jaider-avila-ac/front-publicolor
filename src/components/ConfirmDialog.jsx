export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-5">
        <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-600 mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-brand text-white hover:bg-brand-dark">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
