/**
 * Lista de datos que se muestra como tabla en escritorio y como tarjetas
 * apilables en móvil (con detalle desplegable), evitando scroll horizontal.
 *
 * columns: [{ key, label, render(row), primary?, mobileHidden? }]
 * - primary: hasta 2 columnas marcadas como primary se muestran siempre en la tarjeta móvil.
 * - el resto queda dentro de un <details> "Ver más".
 */
export default function ResponsiveList({ columns, rows, keyExtractor, onRowClick, emptyMessage = 'No hay registros.' }) {
  if (!rows || rows.length === 0) {
    return <p className="text-slate-400 text-sm py-8 text-center">{emptyMessage}</p>
  }

  const primaryCols = columns.filter((c) => c.primary)
  const restCols = columns.filter((c) => !c.primary)

  return (
    <>
      {/* Escritorio */}
      <div className="hidden md:block overflow-x-auto border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((c) => (
                <th key={c.key} className="text-left font-medium text-slate-500 px-4 py-3">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-slate-100 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-slate-700">
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="md:hidden space-y-2">
        {rows.map((row) => (
          <div
            key={keyExtractor(row)}
            className=" border border-slate-200 bg-white p-3"
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            <div className={`flex items-center justify-between gap-3 ${onRowClick ? 'cursor-pointer' : ''}`}>
              {primaryCols.map((c) => (
                <div key={c.key} className="min-w-0">
                  {c.render(row)}
                </div>
              ))}
            </div>
            {restCols.length > 0 && (
              <details className="mt-2" onClick={(e) => e.stopPropagation()}>
                <summary className="text-xs text-brand font-medium cursor-pointer select-none">Ver más</summary>
                <div className="mt-2 space-y-1.5 text-sm">
                  {restCols.map((c) => (
                    <div key={c.key} className="flex justify-between gap-3">
                      <span className="text-slate-400">{c.label}</span>
                      <span className="text-slate-700 text-right">{c.render(row)}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
