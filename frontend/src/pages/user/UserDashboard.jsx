import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ClipboardList, FileText, Bell, TrendingUp, Package, Clock, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { StatCard, StatusBadge, EmptyState, PageLoader } from '../../components/common'

export default function UserDashboard() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reservations/my?limit=5'),
      api.get('/notifications'),
    ]).then(([res, notif]) => {
      setReservations(res.data.data || [])
      setNotifications(notif.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    completed: reservations.filter(r => r.status === 'completed').length,
  }

  if (loading) return <PageLoader />

  return (
    <div className="pt-20 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display font-bold text-2xl text-slate-900 mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : 'evening'}, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm">Here's your MedFind overview</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: ClipboardList, label: 'Total Reservations', value: stats.total, color: 'brand' },
            { icon: Clock, label: 'Pending', value: stats.pending, color: 'amber' },
            { icon: CheckCircle, label: 'Completed', value: stats.completed, color: 'blue' },
            { icon: Bell, label: 'Notifications', value: notifications.filter(n => !n.isRead).length, color: 'red' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Search, label: 'Search Medicine', to: '/search', color: 'from-brand-500 to-brand-600', desc: 'Find by name or brand' },
            { icon: ClipboardList, label: 'My Reservations', to: '/reservations', color: 'from-blue-500 to-blue-600', desc: 'Track your orders' },
            { icon: FileText, label: 'Prescriptions', to: '/prescriptions', color: 'from-purple-500 to-purple-600', desc: 'Upload & manage' },
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
              <Link to="/reservations" className="text-xs text-brand-600 font-medium hover:underline">View all</Link>
            </div>
            {reservations.length === 0 ? (
              <EmptyState icon={Package} title="No reservations yet" description="Search for a medicine and make your first reservation." />
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 4).map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{r.medicine?.name}</p>
                      <p className="text-xs text-slate-400">{r.pharmacy?.name}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-slate-800">Notifications</h3>
              {notifications.some(n => !n.isRead) && (
                <span className="badge badge-red">{notifications.filter(n => !n.isRead).length} new</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <EmptyState icon={Bell} title="No notifications" />
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n._id} className={`p-3 rounded-xl text-sm ${!n.isRead ? 'bg-brand-50 border border-brand-100' : 'bg-slate-50'}`}>
                    <p className="font-semibold text-slate-700">{n.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{n.message}</p>
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
