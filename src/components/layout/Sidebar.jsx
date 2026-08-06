import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Briefcase, TrendingUp, TrendingDown, BarChart3, ListTree, LogOut, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Panel', end: true },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/trabajos', icon: Briefcase, label: 'Trabajos' },
  { to: '/ingresos', icon: TrendingUp, label: 'Ingresos' },
  { to: '/egresos', icon: TrendingDown, label: 'Egresos' },
  { to: '/reportes', icon: BarChart3, label: 'Reportes' },
  { to: '/catalogos', icon: ListTree, label: 'Catálogos' },
]

export default function Sidebar({ mobileOpen = false, onMobileClose = () => {} }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onMobileClose} />}

      <aside
        className={[
          'flex flex-col h-full bg-white border-r border-slate-200',
          'fixed inset-y-0 left-0 z-50 w-64',
          'transition-transform duration-200 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:inset-auto md:z-auto md:translate-x-0 md:w-60 md:shrink-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 shrink-0">
          <span className="text-xl font-bold tracking-tight text-brand">Publicolor</span>
          <button onClick={onMobileClose} className="md:hidden p-1.5 text-slate-400 hover:text-slate-600" aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onMobileClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 text-[15px] transition-colors',
                  isActive ? 'bg-brand text-white font-semibold' : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 bg-brand text-white flex items-center justify-center text-sm font-bold shrink-0">
              {(user?.name || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium py-2 transition-colors"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
