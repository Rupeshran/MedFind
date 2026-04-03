import { motion } from 'framer-motion'
import { Loader2, AlertCircle, Package } from 'lucide-react'

// ── Loading Spinner ────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }
  return <div className={`${sizes[size]} border-[3px] border-brand-200 border-t-brand-500 rounded-full animate-spin ${className}`} />
}

// ── Page Loader ────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />
}

// ── Empty State ────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = Package, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="font-display font-semibold text-slate-700 text-lg mb-1">{title}</h3>
      {description && <p className="text-slate-400 text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── Error Box ──────────────────────────────────────────────────────
export function ErrorBox({ message }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
      <AlertCircle size={18} className="text-red-500 shrink-0" />
      <p className="text-red-700 text-sm">{message}</p>
    </div>
  )
}

// ── Status Badge ───────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending:   'badge-yellow',
    confirmed: 'badge-blue',
    ready:     'badge-green',
    completed: 'bg-green-100 text-green-800 badge',
    cancelled: 'badge-gray',
    rejected:  'badge-red',
    verified:  'badge-green',
    active:    'badge-green',
    inactive:  'badge-gray',
  }
  return <span className={map[status] || 'badge-gray'}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>
}

// ── Stock Badge ────────────────────────────────────────────────────
export function StockBadge({ stock }) {
  if (stock === 0) return <span className="badge badge-red">Out of Stock</span>
  if (stock <= 10) return <span className="badge badge-yellow">Low Stock ({stock})</span>
  return <span className="badge badge-green">In Stock ({stock})</span>
}

// ── Stat Card ──────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, color = 'brand', trend }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
          <p className="font-display font-bold text-2xl text-slate-900">{value}</p>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-display font-semibold text-slate-800">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  )
}

// ── Medicine Card ──────────────────────────────────────────────────
export function MedicineCard({ medicine, onClick }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card card-hover cursor-pointer p-4" onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <span className="text-2xl">💊</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-800 truncate">{medicine.name}</h3>
              <p className="text-sm text-slate-500">{medicine.brand} · {medicine.strength}</p>
            </div>
            {medicine.requiresPrescription && (
              <span className="badge badge-yellow shrink-0">Rx</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{medicine.composition}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge-gray">{medicine.dosageForm}</span>
            {medicine.category && (
              <span className="text-xs text-slate-400">{medicine.category.name}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
