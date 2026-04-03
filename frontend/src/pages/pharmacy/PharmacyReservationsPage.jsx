import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, CheckCircle, X, Eye } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, EmptyState, StatusBadge, Modal, Spinner } from '../../components/common'
import toast from 'react-hot-toast'

const STATUS_TABS = ['all', 'pending', 'confirmed', 'ready', 'completed', 'rejected']

export default function PharmacyReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    const params = tab !== 'all' ? `?status=${tab}` : ''
    api.get(`/reservations/pharmacy${params}`)
      .then(({ data }) => setReservations(data.data || []))
      .finally(() => setLoading(false))
  }, [tab])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      const { data } = await api.put(`/reservations/${id}/status`, { status, pharmacyNote: note })
      setReservations(prev => prev.map(r => r._id === id ? data.data : r))
      toast.success(`Reservation ${status}`)
      setSelected(null)
    } catch { toast.error('Update failed') }
    finally { setUpdating(null) }
  }

  if (loading) return <div className="pt-16"><PageLoader /></div>

  return (
    <div className="pt-20 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Reservation Management</h1>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setTab(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === s ? 'bg-brand-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {reservations.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No reservations found" />
        ) : (
          <div className="space-y-3">
            {reservations.map((r, i) => (
              <motion.div key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">#{r.reservationId}</span>
                      <StatusBadge status={r.status} />
                      {r.requiresPrescription && <span className="badge badge-yellow">Rx Required</span>}
                    </div>
                    <h3 className="font-semibold text-slate-800">{r.medicine?.name}</h3>
                    <p className="text-sm text-slate-500">{r.user?.name} · {r.user?.phone}</p>
                    <div className="flex gap-4 mt-2 text-sm text-slate-500">
                      <span>Qty: <strong>{r.quantity}</strong></span>
                      <span>Total: <strong className="text-brand-600">₹{r.totalPrice}</strong></span>
                    </div>
                    {r.notes && <p className="text-xs text-slate-500 mt-2 italic">"{r.notes}"</p>}
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setSelected(r); setNote('') }}
                        className="btn-primary text-xs py-2"><Eye size={13} /> Review</button>
                    </div>
                  )}
                  {r.status === 'confirmed' && (
                    <button onClick={() => updateStatus(r._id, 'ready')} disabled={updating === r._id}
                      className="btn-primary text-xs py-2 shrink-0">
                      {updating === r._id ? <Spinner size="sm" /> : <><CheckCircle size={13} /> Mark Ready</>}
                    </button>
                  )}
                  {r.status === 'ready' && (
                    <button onClick={() => updateStatus(r._id, 'completed')} disabled={updating === r._id}
                      className="btn-primary text-xs py-2 shrink-0">
                      {updating === r._id ? <Spinner size="sm" /> : <><CheckCircle size={13} /> Complete</>}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Review Reservation">
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 space-y-1 text-sm">
              <p><strong>Medicine:</strong> {selected.medicine?.name} (Qty: {selected.quantity})</p>
              <p><strong>Patient:</strong> {selected.user?.name}</p>
              <p><strong>Phone:</strong> {selected.user?.phone}</p>
              <p><strong>Total:</strong> ₹{selected.totalPrice}</p>
              {selected.notes && <p><strong>Notes:</strong> {selected.notes}</p>}
            </div>
            <div>
              <label className="label">Add Note (optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                className="input h-20 resize-none" placeholder="Note to patient..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => updateStatus(selected._id, 'rejected')} disabled={!!updating}
                className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm font-medium flex-1 justify-center">
                <X size={14} /> Reject
              </button>
              <button onClick={() => updateStatus(selected._id, 'confirmed')} disabled={!!updating}
                className="btn-primary flex-1 justify-center">
                {updating ? <Spinner size="sm" /> : <><CheckCircle size={14} /> Confirm</>}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
