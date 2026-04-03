import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, Clock, Star, ShieldCheck, AlertCircle, BookmarkPlus } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, StockBadge, StatusBadge, Modal, Spinner } from '../../components/common'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function MedicineDetailPage() {
  const { id } = useParams()
  const { user } = useNavigate()
  const navigate = useNavigate()
  const { user: authUser } = useAuth() || {}
  const [medicine, setMedicine] = useState(null)
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [reserveModal, setReserveModal] = useState(null)
  const [reserveForm, setReserveForm] = useState({ quantity: 1, notes: '' })
  const [reserving, setReserving] = useState(false)

  useEffect(() => {
    api.get(`/medicines/${id}`).then(({ data }) => {
      setMedicine(data.data)
      setAvailability(data.availability || [])
    }).catch(() => toast.error('Failed to load medicine'))
      .finally(() => setLoading(false))
  }, [id])

  const handleReserve = async () => {
    if (!authUser) { toast.error('Please login to reserve'); navigate('/login'); return }
    setReserving(true)
    try {
      await api.post('/reservations', {
        pharmacy: reserveModal.pharmacy._id,
        medicine: medicine._id,
        quantity: reserveForm.quantity,
        notes: reserveForm.notes,
      })
      toast.success('Reservation placed successfully!')
      setReserveModal(null)
      navigate('/reservations')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reservation failed')
    } finally { setReserving(false) }
  }

  const isOpen = (timings) => {
    if (!timings) return false
    const now = new Date()
    const [oh, om] = timings.open.split(':').map(Number)
    const [ch, cm] = timings.close.split(':').map(Number)
    const cur = now.getHours() * 60 + now.getMinutes()
    return cur >= oh * 60 + om && cur <= ch * 60 + cm
  }

  if (loading) return <div className="pt-16"><PageLoader /></div>
  if (!medicine) return <div className="pt-24 text-center text-slate-500">Medicine not found</div>

  return (
    <div className="pt-20 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to results
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Medicine Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">💊</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="font-display font-bold text-2xl text-slate-900">{medicine.name}</h1>
                      <p className="text-slate-500">{medicine.brand} · {medicine.manufacturer}</p>
                    </div>
                    {medicine.requiresPrescription && (
                      <span className="badge badge-yellow flex items-center gap-1.5 shrink-0">
                        <AlertCircle size={12} /> Prescription Required
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="badge badge-gray">{medicine.dosageForm}</span>
                    <span className="badge badge-blue">{medicine.strength}</span>
                    {medicine.category && <span className="badge bg-purple-50 text-purple-700">{medicine.category.name}</span>}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-50 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Composition</p>
                  <p className="text-slate-700 font-medium">{medicine.composition}</p>
                </div>
                {medicine.description && (
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">About</p>
                    <p className="text-slate-600 leading-relaxed">{medicine.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Substitutes */}
            {medicine.substitutes?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-slate-700 mb-3">Available Substitutes</h3>
                <div className="space-y-2">
                  {medicine.substitutes.map((sub) => (
                    <button key={sub._id} onClick={() => navigate(`/medicines/${sub._id}`)}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-brand-50 transition-colors text-left">
                      <div>
                        <p className="font-medium text-slate-700 text-sm">{sub.name}</p>
                        <p className="text-xs text-slate-400">{sub.brand} · {sub.strength}</p>
                      </div>
                      <span className="text-xs text-brand-600 font-medium">View →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pharmacy Availability */}
            <div>
              <h2 className="font-display font-semibold text-lg text-slate-800 mb-3">
                Available at {availability.length} Pharmacies
              </h2>
              {availability.length === 0 ? (
                <div className="card p-8 text-center text-slate-400">
                  <p className="font-medium">No nearby pharmacies have this medicine in stock</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availability.map((item) => {
                    const open = item.pharmacy.isOpen24Hours || isOpen(item.pharmacy.timings)
                    return (
                      <motion.div key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="card p-5 card-hover">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-800">{item.pharmacy.name}</h4>
                              {item.pharmacy.isVerified && <ShieldCheck size={14} className="text-brand-500" />}
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${open ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {open ? 'Open' : 'Closed'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 flex items-center gap-1.5">
                              <MapPin size={13} /> {item.pharmacy.address?.street}, {item.pharmacy.address?.city}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                              <Phone size={13} /> {item.pharmacy.phone}
                            </p>
                            {item.pharmacy.timings && (
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                <Clock size={12} /> {item.pharmacy.timings.open} – {item.pharmacy.timings.close}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-2xl text-brand-600">₹{item.price}</p>
                            <StockBadge stock={item.stock} />
                            <button
                              onClick={() => { setReserveModal(item); setReserveForm({ quantity: 1, notes: '' }) }}
                              className="btn-primary mt-3 text-xs py-2">
                              <BookmarkPlus size={14} /> Reserve
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — Quick info */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">Quick Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Form</span><span className="font-medium">{medicine.dosageForm}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Strength</span><span className="font-medium">{medicine.strength}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Prescription</span><span className={medicine.requiresPrescription ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'}>{medicine.requiresPrescription ? 'Required' : 'Not Required'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Available at</span><span className="font-medium text-brand-600">{availability.length} pharmacies</span></div>
              </div>
            </div>

            <div className="card p-5 bg-amber-50 border-amber-100">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Disclaimer:</strong> MedFind provides information for locating medicines only. Always consult your doctor or pharmacist before taking any medication.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
      <Modal open={!!reserveModal} onClose={() => setReserveModal(null)} title="Reserve Medicine">
        {reserveModal && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="font-semibold text-slate-800">{medicine.name}</p>
              <p className="text-sm text-slate-500">{reserveModal.pharmacy.name}</p>
              <p className="text-brand-600 font-bold mt-1">₹{reserveModal.price} / unit</p>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input type="number" min={1} max={reserveModal.stock}
                value={reserveForm.quantity}
                onChange={e => setReserveForm(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                className="input" />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea value={reserveForm.notes}
                onChange={e => setReserveForm(p => ({ ...p, notes: e.target.value }))}
                className="input h-20 resize-none" placeholder="Any special instructions..." />
            </div>
            <div className="flex items-center justify-between bg-brand-50 rounded-xl p-3">
              <span className="text-sm text-slate-600">Total</span>
              <span className="font-bold text-brand-700 text-lg">₹{reserveModal.price * reserveForm.quantity}</span>
            </div>
            {medicine.requiresPrescription && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                <AlertCircle size={14} /> You can upload a prescription from your dashboard after reserving.
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setReserveModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleReserve} disabled={reserving} className="btn-primary flex-1 justify-center">
                {reserving ? <Spinner size="sm" /> : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
