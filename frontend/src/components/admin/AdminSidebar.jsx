import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Users, Store, ShieldCheck, BarChart2, LogOut, Pill } from 'lucide-react'

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/pharmacies', icon: Store, label: 'Pharmacies' },
  { to: '/admin/verify', icon: ShieldCheck, label: 'Verify Pharmacies' },
  { to: '/admin/reports', icon: BarChart2, label: 'Reports & Analytics' },
]

export default function AdminSidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-slate-900 min-h-screen shrink-0">
      <div className="p-5 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white">Med<span className="text-brand-400">Find</span></span>
        </Link>
        <div className="mt-4 px-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Panel</p>
          <p className="text-sm font-semibold text-slate-200 mt-1">{user?.name}</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              location.pathname === to
                ? 'bg-brand-500 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}>
            <Icon className="w-4 h-4 shrink-0" />{label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <button onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 transition-all">
          <LogOut className="w-4 h-4" />Logout
        </button>
      </div>
    </aside>
  )
}
