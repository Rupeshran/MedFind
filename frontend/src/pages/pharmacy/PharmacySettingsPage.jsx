import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, MapPin, Clock, Save, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import { PageLoader } from '../../components/common'
import toast from 'react-hot-toast'
import PharmacySidebar from '../../components/pharmacy/PharmacySidebar'

export default function PharmacySettingsPage() {
  const [pharmacy, setPharmacy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', description: '',
    address: { street: '', city: '', state: '', pincode: '' },
    timings: { open: '09:00', close: '21:00', days: [] },
    isOpen24Hours: false,
    location: { coordinates: [0, 0] },
  })

  useEffect(() => {
    api.get('/pharmacies/my/dashboard').then(({ data }) => {
      const p = data.pharmacy
      setPharmacy(p)
      setForm({
        name: p.name || '', email: p.email || '', phone: p.phone || '',
        description: p.description || '',
        address: p.address || { street: '', city: '', state: '', pincode: '' },
        timings: p.timings || { open: '09:00', close: '21:00', days: [] },
        isOpen24Hours: p.isOpen24Hours || false,
        location: p.location || { coordinates: [0, 0] },
      })
    }).catch(() => toast.error('Failed to load pharmacy'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/pharmacies/${pharmacy._id}`, form)
      toast.success('Settings saved successfully!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setForm(f => ({ ...f, location: { type: 'Point', coordinates: [coords.longitude, coords.latitude] } }))
      toast.success('Location updated!')
    }, () => toast.error('Could not get location'))
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  if (loading) return <div className="flex"><PharmacySidebar /><div className="flex-1"><PageLoader /></div></div>

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PharmacySidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-slate-900">Store Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Update your pharmacy profile and operating details</p>
          </div>

          {!pharmacy?.isVerified && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Pending Verification</p>
                <p className="text-xs text-amber-600 mt-0.5">Your pharmacy is under review. You can still update your profile.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Store className="w-4 h-4 text-brand-500" /> Basic Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['name','Pharmacy Name','City Medical Store'],['email','Email','store@email.com'],['phone','Phone Number','022-11223344']].map(([key,label,ph]) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={ph} className="input" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Brief description of your pharmacy..." className="input resize-none" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" /> Address & Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['street','Street Address','12, MG Road'],['city','City','Mumbai'],['state','State','Maharashtra'],['pincode','Pincode','400001']].map(([key,label,ph]) => (
                  <div key={key} className={key === 'street' ? 'sm:col-span-2' : ''}>
                    <label className="label">{label}</label>
                    <input value={form.address[key]} onChange={e => setForm(f => ({ ...f, address: { ...f.address, [key]: e.target.value } }))}
                      placeholder={ph} className="input" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-700">GPS Coordinates</p>
                  <p className="text-xs text-slate-400">{form.location.coordinates[1].toFixed(4)}, {form.location.coordinates[0].toFixed(4)}</p>
                </div>
                <button type="button" onClick={useCurrentLocation} className="btn-secondary text-xs py-1.5">
                  Use My Location
                </button>
              </div>
            </div>

            {/* Timings */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-500" /> Operating Hours
              </h2>
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input type="checkbox" checked={form.isOpen24Hours}
                  onChange={e => setForm(f => ({ ...f, isOpen24Hours: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500" />
                <span className="text-sm font-medium text-slate-700">Open 24 Hours</span>
              </label>
              {!form.isOpen24Hours && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[['open','Opening Time'],['close','Closing Time']].map(([key,label]) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input type="time" value={form.timings[key]}
                        onChange={e => setForm(f => ({ ...f, timings: { ...f.timings, [key]: e.target.value } }))}
                        className="input" />
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="label">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {days.map(day => (
                    <button key={day} type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        timings: {
                          ...f.timings,
                          days: f.timings.days.includes(day)
                            ? f.timings.days.filter(d => d !== day)
                            : [...f.timings.days, day]
                        }
                      }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                        form.timings.days.includes(day)
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>{day}</button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
