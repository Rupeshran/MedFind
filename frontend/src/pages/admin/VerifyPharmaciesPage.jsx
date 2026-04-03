import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, MapPin, Phone, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import api from '../../services/api'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { PageLoader, EmptyState } from '../../components/common'
import toast from 'react-hot-toast'

export default function VerifyPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/pharmacies?verified=false&limit=50').then(({ data }) => setPharmacies(data.data))
      .catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [])

  const verify = async (id) => {
    try {
      await api.put(`/admin/pharmacies/${id}/verify`)
      setPharmacies(p => p.filter(x => x._id !== id))
      toast.success('Pharmacy verified and approved!')
    } catch { toast.error('Verification failed') }
  }

  const reject = async (id) => {
    try {
      await api.put(`/admin/pharmacies/${id}/reject`)
      setPharmacies(p => p.filter(x => x._id !== id))
      toast.success('Pharmacy rejected')
    } catch { toast.error('Action failed') }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-slate-900">Verify Pharmacies</h1>
          <p className="text-slate-500 text-sm mt-1">{pharmacies.length} pharmacy registration{pharmacies.length !== 1 ? 's' : ''} pending review</p>
        </div>

        {loading ? <PageLoader /> : pharmacies.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">All caught up!</h3>
            <p className="text-slate-400 text-sm">No pharmacies pending verification.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pharmacies.map((ph, i) => (
              <motion.div key={ph._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-slate-900">{ph.name}</h3>
                        <span className="badge badge-yellow flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Reg No: {ph.registrationNumber}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                        {ph.address?.street}, {ph.address?.city}, {ph.address?.state} – {ph.address?.pincode}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                        {ph.phone}
                      </div>
                      {ph.owner && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          {ph.owner.name} — {ph.owner.email}
                        </div>
                      )}
                    </div>

                    {ph.description && (
                      <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">{ph.description}</p>
                    )}

                    <p className="text-xs text-slate-400">
                      Submitted: {new Date(ph.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0">
                    <button onClick={() => verify(ph._id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-all shadow-brand">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => reject(ph._id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-all">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
