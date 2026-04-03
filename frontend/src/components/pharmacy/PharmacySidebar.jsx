import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Package, ClipboardList, FileCheck, Settings, LogOut, Pill } from 'lucide-react'

const links = [
  { to: '/pharmacy', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pharmacy/inventory', icon: Package, label: 'Inventory' },
  { to: '/pharmacy/reservations', icon: ClipboardList, label: 'Reservations' },
  { to: '/pharmacy/prescriptions', icon: FileCheck, label: 'Prescriptions' },
  { to: '/pharmacy/settings', icon: Settings, label: 'Settings' },
]

export default function PharmacySidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 min-h-screen shrink-0">
      <div className="p-5 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-slate-900">Med<span className="text-brand-500">Find</span></span>
        </Link>
        <div className="mt-4 px-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pharmacy Portal</p>
          <p className="text-sm font-semibold text-slate-800 mt-1">{user?.name}</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              location.pathname === to
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}>
            <Icon className="w-4 h-4 shrink-0" />{label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <button onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  )
}
