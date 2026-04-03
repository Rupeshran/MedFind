import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, MapPin, Star, Phone, CheckCircle, XCircle, Search } from 'lucide-react'
import api from '../../services/api'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { PageLoader, EmptyState } from '../../components/common'
import toast from 'react-hot-toast'

export default function ManagePharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: 50 })
    if (filter !== '') params.set('verified', filter)
    api.get(`/admin/pharmacies?${params}`).then(({ data }) => {
      setPharmacies(data.data); setTotal(data.total)
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [filter])

  const toggleVerify = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await api.put(`/admin/pharmacies/${id}/reject`)
        toast.success('Pharmacy deactivated')
      } else {
        await api.put(`/admin/pharmacies/${id}/verify`)
        toast.success('Pharmacy verified!')
      }
      setPharmacies(p => p.map(x => x._id === id ? { ...x, isVerified: !currentStatus, isActive: !currentStatus } : x))
    } catch { toast.error('Action failed') }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Manage Pharmacies</h1>
            <p className="text-slate-500 text-sm mt-1">{total} pharmacies registered</p>
          </div>
        </div>

        <div className="card p-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            {[['','All'],['true','Verified'],['false','Pending']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                  filter === val ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>{label}</button>
            ))}
          </div>
        </div>

        {loading ? <PageLoader /> : pharmacies.length === 0 ? (
          <EmptyState icon={<Store className="w-8 h-8" />} title="No pharmacies" description="No pharmacies found." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pharmacies.map(ph => (
              <motion.div key={ph._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{ph.name}</h3>
                      <span className={`badge ${ph.isVerified ? 'badge-green' : 'badge-yellow'}`}>
                        {ph.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Reg: {ph.registrationNumber}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {ph.rating || 'N/A'}
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3 h-3 text-brand-500" />
                    {ph.address?.street}, {ph.address?.city}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone className="w-3 h-3 text-brand-500" />
                    {ph.phone}
                  </div>
                  {ph.owner && (
                    <p className="text-xs text-slate-400">Owner: {ph.owner.name} ({ph.owner.email})</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => toggleVerify(ph._id, ph.isVerified)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      ph.isVerified
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                    }`}>
                    {ph.isVerified ? <><XCircle className="w-3.5 h-3.5" /> Revoke</> : <><CheckCircle className="w-3.5 h-3.5" /> Verify</>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
