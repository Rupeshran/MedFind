import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ClipboardList, AlertTriangle, CheckCircle, Clock, ShieldCheck, Store } from 'lucide-react'
import api from '../../services/api'
import { StatCard, StatusBadge, EmptyState, PageLoader } from '../../components/common'

export default function PharmacyDashboard() {
  const [data, setData] = useState(null)
  const [reservations, setReservations] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/pharmacies/my/dashboard'),
      api.get('/reservations/pharmacy?limit=5'),
      api.get('/inventory/low-stock'),
    ]).then(([dash, res, ls]) => {
      setData(dash.data)
      setReservations(res.data.data || [])
      setLowStock(ls.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="pt-16"><PageLoader /></div>

  const { pharmacy, stats } = data || {}

  return (
    <div className="pt-20 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display font-bold text-2xl text-slate-900">{pharmacy?.name}</h1>
              {pharmacy?.isVerified ? (
                <span className="badge badge-green flex items-center gap-1"><ShieldCheck size={12} /> Verified</span>
              ) : (
                <span className="badge badge-yellow">Pending Verification</span>
              )}
            </div>
            <p className="text-slate-500 text-sm">{pharmacy?.address?.street}, {pharmacy?.address?.city}</p>
          </div>
          <Link to="/pharmacy/settings" className="btn-secondary text-sm">
            <Store size={15} /> Edit Store
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, label: 'Total Medicines', value: stats?.totalInventory || 0, color: 'brand' },
            { icon: AlertTriangle, label: 'Low Stock', value: stats?.lowStock || 0, color: 'amber' },
            { icon: Clock, label: 'Pending Orders', value: stats?.pendingReservations || 0, color: 'blue' },
            { icon: CheckCircle, label: 'Total Orders', value: stats?.totalReservations || 0, color: 'purple' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Package, label: 'Manage Inventory', to: '/pharmacy/inventory', color: 'from-brand-500 to-brand-600', desc: 'Add & update stock' },
            { icon: ClipboardList, label: 'Reservations', to: '/pharmacy/reservations', color: 'from-blue-500 to-blue-600', desc: 'Approve or reject' },
            { icon: CheckCircle, label: 'Prescriptions', to: '/pharmacy/prescriptions', color: 'from-purple-500 to-purple-600', desc: 'Verify uploaded docs' },
          ].map(({ icon: Icon, label, to, color, desc }) => (
            <Link key={to} to={to}>
              <motion.div whileHover={{ y: -2 }}
                className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
                <Icon size={24} className="mb-3 opacity-90" />
                <p className="font-semibold">{label}</p>
                <p className="text-xs opacity-75 mt-0.5">{desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Reservations */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-slate-800">Recent Reservations</h3>
              <Link to="/pharmacy/reservations" className="text-xs text-brand-600 font-medium hover:underline">View all</Link>
            </div>
            {reservations.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No reservations yet" />
            ) : (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{r.medicine?.name}</p>
                      <p className="text-xs text-slate-400">{r.user?.name} · Qty {r.quantity}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-slate-800">Low Stock Alerts</h3>
              {lowStock.length > 0 && <span className="badge badge-yellow">{lowStock.length} items</span>}
            </div>
            {lowStock.length === 0 ? (
              <EmptyState icon={Package} title="All stock levels are healthy" />
            ) : (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{item.medicine?.name}</p>
                      <p className="text-xs text-slate-400">{item.medicine?.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-600">{item.stock} left</p>
                      <p className="text-xs text-slate-400">min: {item.lowStockThreshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
