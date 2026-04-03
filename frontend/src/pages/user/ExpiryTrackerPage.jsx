import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Trash2, AlertTriangle, Clock, CheckCircle, XCircle, Loader2, Pill, Bell } from 'lucide-react'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'
import toast from 'react-hot-toast'

export default function ExpiryTrackerPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ medicineName: '', brand: '', batchNumber: '', expiryDate: '', quantity: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    try {
      const { data } = await api.get('/expiry-tracker')
      setItems(data.data || [])
    } catch { /* empty */ }
    setLoading(false)
  }

  const addMedicine = async () => {
    if (!form.medicineName || !form.expiryDate) return toast.error('Name and expiry date required')
    setSaving(true)
    try {
      await api.post('/expiry-tracker', form)
      toast.success('Medicine added to tracker')
      setForm({ medicineName: '', brand: '', batchNumber: '', expiryDate: '', quantity: '', notes: '' })
      setShowAdd(false)
      loadItems()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add') }
    setSaving(false)
  }

  const removeMedicine = async (id) => {
    try {
      await api.delete(`/expiry-tracker/${id}`)
      setItems(items.filter(i => i._id !== id))
      toast.success('Removed')
    } catch { toast.error('Failed to remove') }
  }

  const statusIcon = (status) => {
    switch (status) {
      case 'expired': return <XCircle size={20} style={{ color: '#ef4444' }} />
      case 'expiring_soon': return <AlertTriangle size={20} style={{ color: '#ef4444' }} />
      case 'expiring': return <Clock size={20} style={{ color: '#f59e0b' }} />
      default: return <CheckCircle size={20} style={{ color: '#22c55e' }} />
    }
  }

  const statusBg = (status) => {
    switch (status) {
      case 'expired': return 'rgba(239,68,68,0.1)'
      case 'expiring_soon': return 'rgba(239,68,68,0.08)'
      case 'expiring': return 'rgba(245,158,11,0.08)'
      default: return 'rgba(34,197,94,0.05)'
    }
  }

  const statusBorder = (status) => {
    switch (status) {
      case 'expired': return 'rgba(239,68,68,0.3)'
      case 'expiring_soon': return 'rgba(239,68,68,0.2)'
      case 'expiring': return 'rgba(245,158,11,0.2)'
      default: return 'rgba(34,197,94,0.15)'
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
      <Loader2 size={32} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  const expired = items.filter(i => i.status === 'expired')
  const expiringSoon = items.filter(i => i.status === 'expiring_soon' || i.status === 'expiring')
  const good = items.filter(i => i.status === 'good')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⏰</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('expiry.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{t('expiry.subtitle')}</p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: t('expiry.expired'), count: expired.length, color: '#ef4444', emoji: '❌' },
            { label: t('expiry.expiringSoon'), count: expiringSoon.length, color: '#f59e0b', emoji: '⚠️' },
            { label: t('expiry.good'), count: good.length, color: '#22c55e', emoji: '✅' },
          ].map(s => (
            <div key={s.label} style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ color: s.color, fontSize: 28, fontWeight: 800 }}>{s.count}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAdd(!showAdd)}
          style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: 12, cursor: 'pointer', marginBottom: 24,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 16, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          <Plus size={18} /> {t('expiry.addMedicine')}
        </motion.button>

        {/* Add Form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: 20, marginBottom: 24, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4, display: 'block' }}>{t('expiry.medicineName')} *</label>
                  <input value={form.medicineName} onChange={e => setForm(f => ({ ...f, medicineName: e.target.value }))} placeholder="e.g., Paracetamol 650mg"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4, display: 'block' }}>Brand</label>
                  <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g., Dolo"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4, display: 'block' }}>{t('expiry.expiryDate')} *</label>
                  <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4, display: 'block' }}>Batch Number</label>
                  <input value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4, display: 'block' }}>Quantity</label>
                  <input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g., 10 tablets"
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addMedicine} disabled={saving}
                style={{ width: '100%', marginTop: 16, padding: '12px', border: 'none', borderRadius: 10, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />} Add Medicine
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items List */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.5)' }}>
            <Pill size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ fontSize: 16 }}>{t('expiry.noItems')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item, idx) => (
              <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                style={{ background: statusBg(item.status), borderRadius: 16, border: `1px solid ${statusBorder(item.status)}`, padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
                {statusIcon(item.status)}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{item.medicineName}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'flex', gap: 12, marginTop: 4 }}>
                    {item.brand && <span>{item.brand}</span>}
                    <span><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{new Date(item.expiryDate).toLocaleDateString()}</span>
                    {item.quantity && <span>{item.quantity}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{
                    color: item.status === 'expired' || item.status === 'expiring_soon' ? '#ef4444' : item.status === 'expiring' ? '#f59e0b' : '#22c55e',
                    fontWeight: 700, fontSize: 18,
                  }}>
                    {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d ago` : `${item.daysLeft}d`}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{t(`expiry.${item.status === 'expiring_soon' ? 'expiringSoon' : item.status}`, item.status)}</div>
                </div>
                <button onClick={() => removeMedicine(item._id)}
                  style={{ padding: 8, background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444' }}>
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
