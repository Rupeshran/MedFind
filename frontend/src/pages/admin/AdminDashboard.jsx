import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Store, Package, ClipboardList, ShieldCheck, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../services/api'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { PageLoader } from '../../components/common'

const COLORS = ['#15b36d', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <motion.div whileHover={{ y: -2 }} className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-slate-900">{value ?? '—'}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
    {to && <Link to={to} className="ml-auto text-xs text-brand-600 hover:underline">View →</Link>}
  </motion.div>
)

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setData(data))
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const pieData = data?.reservationsByStatus?.map(s => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
  })) || []

  const monthlyData = data?.monthlyReservations?.map(m => ({
    month: MONTHS[m._id.month - 1],
    reservations: m.count,
  })) || []

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Platform overview and key metrics</p>
        </div>

        {loading ? <PageLoader /> : (
          <>
            {/* Alert cards */}
            {(data?.stats.pendingVerifications > 0 || data?.stats.lowStockCount > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {data.stats.pendingVerifications > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800">{data.stats.pendingVerifications} Pharmacies Pending</p>
                      <p className="text-xs text-amber-600">Awaiting verification</p>
                    </div>
                    <Link to="/admin/verify" className="text-xs font-semibold text-amber-700 hover:underline">Review →</Link>
                  </div>
                )}
                {data.stats.lowStockCount > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">{data.stats.lowStockCount} Low Stock Alerts</p>
                      <p className="text-xs text-red-600">Items below threshold</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard icon={Users} label="Total Users" value={data?.stats.totalUsers} color="bg-blue-500" to="/admin/users" />
              <StatCard icon={Store} label="Pharmacies" value={data?.stats.totalPharmacies} color="bg-brand-500" to="/admin/pharmacies" />
              <StatCard icon={Package} label="Medicines" value={data?.stats.totalMedicines} color="bg-purple-500" />
              <StatCard icon={ClipboardList} label="Total Reservations" value={data?.stats.totalReservations} color="bg-amber-500" />
              <StatCard icon={Activity} label="Pending Requests" value={data?.stats.pendingReservations} color="bg-red-500" />
              <StatCard icon={ShieldCheck} label="Unverified Pharmacies" value={data?.stats.pendingVerifications} color="bg-slate-600" to="/admin/verify" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card p-5">
                <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-500" /> Monthly Reservations
                </h2>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="reservations" fill="#15b36d" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-slate-400 py-10 text-sm">No data yet</p>}
              </div>

              <div className="card p-5">
                <h2 className="font-semibold text-slate-800 mb-4">Reservations by Status</h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-slate-400 py-10 text-sm">No data yet</p>}
              </div>
            </div>

            {/* Top searched medicines */}
            <div className="card p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Top Searched Medicines</h2>
              <div className="space-y-3">
                {data?.topMedicines?.map((med, i) => (
                  <div key={med._id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{med.name}</p>
                      <p className="text-xs text-slate-400">{med.brand}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 bg-brand-500 rounded-full" style={{ width: `${Math.min(100, (med.searchCount / (data.topMedicines[0].searchCount || 1)) * 80 + 20)}px` }} />
                      <span className="text-xs text-slate-500 w-12 text-right">{med.searchCount} searches</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
