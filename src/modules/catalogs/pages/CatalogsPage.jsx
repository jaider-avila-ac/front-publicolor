import CatalogSection from '../components/CatalogSection'

const SECTIONS = [
  { type: 'productTypes', title: 'Tipos de producto' },
  { type: 'finishes', title: 'Acabados' },
  { type: 'laminations', title: 'Laminados' },
  { type: 'paymentMethods', title: 'Métodos de pago' },
  { type: 'incomeCategories', title: 'Categorías de ingreso' },
  { type: 'expenseCategories', title: 'Categorías de egreso' },
]

export default function CatalogsPage() {
  return (
    <div className="space-y-4">
      <h1 className="page-title">Catálogos</h1>
      <p className="text-sm text-slate-500">
        Estos valores se usan en los formularios de trabajos, pagos, ingresos y egresos. Desactivar uno no borra el historial ya
        registrado con él.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <CatalogSection key={s.type} type={s.type} title={s.title} />
        ))}
      </div>
    </div>
  )
}
