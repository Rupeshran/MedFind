import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Eye, CheckCircle, X } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, EmptyState, StatusBadge, Modal, Spinner } from '../../components/common'
import toast from 'react-hot-toast'

export function PrescriptionVerificationPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewImg, setViewImg] = useState(null)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    api.get('/prescriptions/pharmacy').then(({ data }) => setItems(data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const verify = async (id, status) => {
    setUpdating(id)
    try {
      const { data } = await api.put(`/prescriptions/${id}/verify`, { status })
      setItems(prev => prev.map(p => p._id === id ? data.data : p))
      toast.success(`Prescription ${status}`)
    } catch { toast.error('Failed') }
    finally { setUpdating(null) }
  }

  if (loading) return <div className="pt-16"><PageLoader /></div>

  return (
    <div className="pt-20 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Prescription Verification</h1>
        {items.length === 0 ? (
          <EmptyState icon={FileText} title="No prescriptions to verify" />
        ) : (
          <div className="space-y-3">
            {items.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="card p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800">{p.user?.name}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-sm text-slate-500">{p.user?.email} · {p.user?.phone}</p>
                    {p.notes && <p className="text-xs text-slate-400 mt-1 italic">"{p.notes}"</p>}
                    <p className="text-xs text-slate-400 mt-1">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setViewImg(`${import.meta.env.VITE_API_URL}${p.imageUrl}`)}
                      className="btn-ghost text-xs py-2"><Eye size={13} /> View</button>
                    {p.status === 'pending' && (
                      <>
                        <button onClick={() => verify(p._id, 'rejected')} disabled={updating === p._id}
                          className="text-xs px-3 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50">
                          <X size={13} />
                        </button>
                        <button onClick={() => verify(p._id, 'verified')} disabled={updating === p._id}
                          className="btn-primary text-xs py-2">
                          {updating === p._id ? <Spinner size="sm" /> : <><CheckCircle size={13} /> Verify</>}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Modal open={!!viewImg} onClose={() => setViewImg(null)} title="Prescription" width="max-w-2xl">
        {viewImg && <img src={viewImg} alt="Prescription" className="w-full rounded-xl" />}
      </Modal>
    </div>
  )
}

export function PharmacySettingsPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', description: '', open: '', close: '', isOpen24Hours: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pharmacyId, setPharmacyId] = useState(null)

  useEffect(() => {
    api.get('/pharmacies/my/dashboard').then(({ data }) => {
      const p = data.pharmacy
      setPharmacyId(p._id)
      setForm({ name: p.name, phone: p.phone, email: p.email, description: p.description || '', open: p.timings?.open || '09:00', close: p.timings?.close || '21:00', isOpen24Hours: p.isOpen24Hours })
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/pharmacies/${pharmacyId}`, { name: form.name, phone: form.phone, email: form.email, description: form.description, timings: { open: form.open, close: form.close }, isOpen24Hours: form.isOpen24Hours })
      toast.success('Pharmacy settings updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="pt-16"><PageLoader /></div>

  return (
    <div className="pt-20 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-8">Pharmacy Settings</h1>
        <div className="card p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="label">Pharmacy Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Phone</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input" /></div>
              <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input" /></div>
            </div>
            <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input h-24 resize-none" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is24" checked={form.isOpen24Hours} onChange={e => setForm(p => ({ ...p, isOpen24Hours: e.target.checked }))} className="w-4 h-4 accent-brand-500" />
              <label htmlFor="is24" className="text-sm font-medium text-slate-700">Open 24 Hours</label>
            </div>
            {!form.isOpen24Hours && (
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Opening</label><input type="time" value={form.open} onChange={e => setForm(p => ({ ...p, open: e.target.value }))} className="input" /></div>
                <div><label className="label">Closing</label><input type="time" value={form.close} onChange={e => setForm(p => ({ ...p, close: e.target.value }))} className="input" /></div>
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionVerificationPage
