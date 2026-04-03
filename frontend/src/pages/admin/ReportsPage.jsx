import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts'
import { TrendingUp, Package, AlertTriangle, Activity } from 'lucide-react'
import api from '../../services/api'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { PageLoader } from '../../components/common'

const COLORS = ['#15b36d', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ReportsPage() {
  const [data, setData] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/low-stock'),
    ]).then(([stats, ls]) => {
      setData(stats.data)
      setLowStock(ls.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const pieData = data?.reservationsByStatus?.map(s => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
  })) || []

  const monthlyData = data?.monthlyReservations?.map(m => ({
    month: MONTHS[m._id.month - 1],
    count: m.count,
  })) || []

  if (loading) return <div className="flex"><AdminSidebar /><div className="flex-1"><PageLoader /></div></div>

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Platform-wide performance and insights</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Reservations', value: data?.stats.totalReservations, icon: Activity, color: 'text-brand-500 bg-brand-50' },
            { label: 'Active Users', value: data?.stats.totalUsers, icon: TrendingUp, color: 'text-blue-500 bg-blue-50' },
            { label: 'Verified Pharmacies', value: data?.stats.totalPharmacies, icon: Package, color: 'text-purple-500 bg-purple-50' },
            { label: 'Low Stock Alerts', value: lowStock.length, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-slate-900">{value ?? 0}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly trend */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" /> Reservation Trend (6 Months)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#15b36d" strokeWidth={2.5} dot={{ fill: '#15b36d', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status distribution */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Reservation Status Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top medicines bar chart */}
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Top Searched Medicines</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.topMedicines?.map(m => ({ name: m.name.split(' ')[0], searches: m.searchCount })) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="searches" fill="#15b36d" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-slate-800">Low Stock Alerts ({lowStock.length})</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">No low stock alerts</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    {['Medicine','Pharmacy','Current Stock','Threshold'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lowStock.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-sm font-medium text-slate-800">{item.medicine?.name}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{item.pharmacy?.name}</td>
                      <td className="px-5 py-3">
                        <span className="badge badge-red">{item.stock} units</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-400">{item.lowStockThreshold} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
