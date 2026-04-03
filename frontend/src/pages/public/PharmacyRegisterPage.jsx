import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building, FileText, Phone, MapPin, Clock, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Spinner } from '../../components/common'

export default function PharmacyRegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', registrationNumber: '', email: '', phone: '',
    street: '', city: '', state: '', pincode: '',
    open: '09:00', close: '21:00',
    isOpen24Hours: false, description: '',
    lat: '', lng: '',
  })

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const setCheck = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.checked }))

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        setForm(p => ({ ...p, lat: coords.latitude.toString(), lng: coords.longitude.toString() }))
        toast.success('Location detected!')
      },
      () => toast.error('Could not get location')
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login first'); navigate('/login'); return }
    setLoading(true)
    try {
      await api.post('/pharmacies/register', {
        name: form.name, registrationNumber: form.registrationNumber,
        email: form.email, phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        location: { type: 'Point', coordinates: [parseFloat(form.lng) || 0, parseFloat(form.lat) || 0] },
        timings: { open: form.open, close: form.close },
        isOpen24Hours: form.isOpen24Hours,
        description: form.description,
      })
      toast.success('Pharmacy registered! Pending admin verification.')
      navigate('/pharmacy')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="pt-20 pb-16 bg-gradient-to-br from-slate-50 to-brand-50/20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-brand">
              <Building size={26} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-900 mb-1">Register Your Pharmacy</h1>
            <p className="text-slate-500 text-sm">Join MedFind's verified pharmacy network</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Basic Info */}
              <div className="pb-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><FileText size={16} />Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Pharmacy Name</label>
                    <input value={form.name} onChange={set('name')} className="input" placeholder="e.g. City Medical Store" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Drug License Number</label>
                      <input value={form.registrationNumber} onChange={set('registrationNumber')} className="input" placeholder="PH-XX-YYYY-001" required />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input value={form.phone} onChange={set('phone')} className="input" placeholder="022-XXXXXXXX" required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" value={form.email} onChange={set('email')} className="input" required />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="pb-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><MapPin size={16} />Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Street Address</label>
                    <input value={form.street} onChange={set('street')} className="input" placeholder="123, Main Street" required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="label">City</label>
                      <input value={form.city} onChange={set('city')} className="input" placeholder="Mumbai" required />
                    </div>
                    <div>
                      <label className="label">State</label>
                      <input value={form.state} onChange={set('state')} className="input" placeholder="Maharashtra" required />
                    </div>
                    <div>
                      <label className="label">Pincode</label>
                      <input value={form.pincode} onChange={set('pincode')} className="input" placeholder="400001" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Latitude</label>
                      <input value={form.lat} onChange={set('lat')} className="input" placeholder="19.0760" />
                    </div>
                    <div>
                      <label className="label">Longitude</label>
                      <input value={form.lng} onChange={set('lng')} className="input" placeholder="72.8777" />
                    </div>
                  </div>
                  <button type="button" onClick={getLocation} className="btn-secondary text-sm">
                    <MapPin size={14} /> Use My Location
                  </button>
                </div>
              </div>

              {/* Timings */}
              <div className="pb-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Clock size={16} />Working Hours</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isOpen24Hours} onChange={setCheck('isOpen24Hours')}
                      className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm font-medium text-slate-700">Open 24 Hours</span>
                  </label>
                </div>
                {!form.isOpen24Hours && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="label">Opening Time</label>
                      <input type="time" value={form.open} onChange={set('open')} className="input" />
                    </div>
                    <div>
                      <label className="label">Closing Time</label>
                      <input type="time" value={form.close} onChange={set('close')} className="input" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Description (optional)</label>
                <textarea value={form.description} onChange={set('description')}
                  className="input h-24 resize-none" placeholder="Brief description of your pharmacy..." />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                {loading ? <Spinner size="sm" /> : <>Submit for Verification <ArrowRight size={16} /></>}
              </button>
              <p className="text-xs text-slate-400 text-center">Your pharmacy will be reviewed and verified within 24 hours.</p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
