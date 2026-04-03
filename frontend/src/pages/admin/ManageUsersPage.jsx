import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, ToggleLeft, ToggleRight, Shield } from 'lucide-react'
import api from '../../services/api'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { PageLoader, EmptyState, StatusBadge } from '../../components/common'
import toast from 'react-hot-toast'

export default function ManageUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [total, setTotal] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: 50 })
    if (search) params.set('search', search)
    if (role) params.set('role', role)
    api.get(`/admin/users?${params}`).then(({ data }) => {
      setUsers(data.data); setTotal(data.total)
    }).catch(() => toast.error('Failed to load users')).finally(() => setLoading(false))
  }, [search, role])

  useEffect(() => { load() }, [load])

  const toggleUser = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`)
      setUsers(u => u.map(x => x._id === id ? { ...x, isActive: data.data.isActive } : x))
      toast.success('User status updated')
    } catch { toast.error('Failed to update user') }
  }

  const roleColor = { user: 'badge-blue', pharmacy: 'badge-green', admin: 'badge-yellow' }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Manage Users</h1>
            <p className="text-slate-500 text-sm mt-1">{total} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..." className="input pl-9" />
          </div>
          <select value={role} onChange={e => setRole(e.target.value)} className="input w-auto">
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="pharmacy">Pharmacies</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? <PageLoader /> : users.length === 0 ? (
          <EmptyState icon={<Users className="w-8 h-8" />} title="No users found" description="No users match your search." />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['User', 'Email', 'Phone', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(user => (
                    <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                            {user.name[0]}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{user.email}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{user.phone || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${roleColor[user.role]}`}>{user.role}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {user.role !== 'admin' && (
                          <button onClick={() => toggleUser(user._id)}
                            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
                              user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-brand-600 hover:bg-brand-50'
                            }`}>
                            {user.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
