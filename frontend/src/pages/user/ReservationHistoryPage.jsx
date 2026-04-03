import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, X, Download } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, EmptyState, StatusBadge, Modal, Spinner } from '../../components/common'
import toast from 'react-hot-toast'

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'ready', 'completed', 'cancelled', 'rejected']

export default function ReservationHistoryPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    const params = filter !== 'all' ? `?status=${filter}` : ''
    api.get(`/reservations/my${params}`)
      .then(({ data }) => setReservations(data.data || []))
      .catch(() => toast.error('Failed to load reservations'))
      .finally(() => setLoading(false))
  }, [filter])

  const cancelReservation = async (id) => {
    setCancelling(id)
    try {
      await api.put(`/reservations/${id}/cancel`)
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status: 'cancelled' } : r))
      toast.success('Reservation cancelled')
    } catch { toast.error('Could not cancel') }
    finally { setCancelling(null) }
  }

  if (loading) return <div className="pt-16"><PageLoader /></div>

  return (
    <div className="pt-20 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">My Reservations</h1>
            <p className="text-slate-500 text-sm mt-1">{reservations.length} reservations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-brand-500 text-white shadow-brand' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {reservations.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No reservations found" description="Your reservation history will appear here." />
        ) : (
          <div className="space-y-4">
            {reservations.map((r, i) => (
              <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">#{r.reservationId}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <h3 className="font-semibold text-slate-800">{r.medicine?.name}</h3>
                    <p className="text-sm text-slate-500">{r.pharmacy?.name} · {r.pharmacy?.address?.city}</p>
                    <div className="flex gap-4 mt-2 text-sm text-slate-500">
                      <span>Qty: <strong className="text-slate-700">{r.quantity}</strong></span>
                      <span>Total: <strong className="text-brand-600">₹{r.totalPrice}</strong></span>
                    </div>
                    {r.pharmacyNote && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg">Note: {r.pharmacyNote}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {['pending', 'confirmed'].includes(r.status) && (
                      <button onClick={() => cancelReservation(r._id)} disabled={cancelling === r._id}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-100">
                        {cancelling === r._id ? <Spinner size="sm" /> : <X size={13} />} Cancel
                      </button>
                    )}
                    {r.status === 'completed' && (
                      <button className="flex items-center gap-1.5 text-xs text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg transition-colors border border-brand-100">
                        <Download size={13} /> Receipt
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
