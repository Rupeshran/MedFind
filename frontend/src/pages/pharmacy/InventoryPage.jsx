import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, AlertTriangle } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, EmptyState, StockBadge, Modal, Spinner } from '../../components/common'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const { pharmacy } = useAuth()
  const [items, setItems] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // 'add' | 'edit'
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ medicine: '', stock: '', price: '', expiryDate: '', lowStockThreshold: 10 })
  const [saving, setSaving] = useState(false)
  const [pharmacyId, setPharmacyId] = useState(null)

  useEffect(() => {
    api.get('/pharmacies/my/dashboard').then(({ data }) => {
      setPharmacyId(data.pharmacy._id)
      return api.get(`/inventory/pharmacy/${data.pharmacy._id}`)
    }).then(({ data }) => setItems(data.data || []))
      .finally(() => setLoading(false))

    api.get('/medicines?limit=100').then(({ data }) => setMedicines(data.data || []))
  }, [])

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const openAdd = () => {
    setForm({ medicine: '', stock: '', price: '', expiryDate: '', lowStockThreshold: 10 })
    setEditItem(null)
    setModal('add')
  }

  const openEdit = (item) => {
    setForm({
      medicine: item.medicine._id,
      stock: item.stock,
      price: item.price,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      lowStockThreshold: item.lowStockThreshold,
    })
    setEditItem(item)
    setModal('edit')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'add') {
        const { data } = await api.post('/inventory', { ...form, stock: Number(form.stock), price: Number(form.price), lowStockThreshold: Number(form.lowStockThreshold) })
        setItems(prev => [data.data, ...prev])
        toast.success('Medicine added to inventory')
      } else {
        const { data } = await api.put(`/inventory/${editItem._id}`, { stock: Number(form.stock), price: Number(form.price), expiryDate: form.expiryDate, lowStockThreshold: Number(form.lowStockThreshold), isAvailable: Number(form.stock) > 0 })
        setItems(prev => prev.map(i => i._id === editItem._id ? data.data : i))
        toast.success('Inventory updated')
      }
      setModal(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item from inventory?')) return
    try {
      await api.delete(`/inventory/${id}`)
      setItems(prev => prev.filter(i => i._id !== id))
      toast.success('Item removed')
    } catch { toast.error('Failed to remove') }
  }

  const filtered = items.filter(i =>
    i.medicine?.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.medicine?.brand?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="pt-16"><PageLoader /></div>

  return (
    <div className="pt-20 pb-16 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Inventory Management</h1>
            <p className="text-slate-500 text-sm mt-1">{items.length} medicines in stock</p>
          </div>
          <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Medicine</button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10" placeholder="Search inventory..." />
        </div>

        {/* Low stock banner */}
        {items.some(i => i.stock <= i.lowStockThreshold) && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5 text-sm">
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <span className="text-amber-700">{items.filter(i => i.stock <= i.lowStockThreshold).length} items are running low on stock.</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={Plus} title="No inventory items" description="Start by adding medicines to your inventory."
            action={<button onClick={openAdd} className="btn-primary">Add Medicine</button>} />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Medicine', 'Brand', 'Stock', 'Price', 'Expiry', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((item, i) => (
                    <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className={`hover:bg-slate-50 transition-colors ${item.stock <= item.lowStockThreshold ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3 font-medium text-slate-800">{item.medicine?.name}</td>
                      <td className="px-4 py-3 text-slate-500">{item.medicine?.brand}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${item.stock <= item.lowStockThreshold ? 'text-amber-600' : 'text-brand-600'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">₹{item.price}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StockBadge stock={item.stock} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Medicine to Inventory' : 'Update Stock'}>
        <form onSubmit={handleSave} className="space-y-4">
          {modal === 'add' && (
            <div>
              <label className="label">Select Medicine</label>
              <select value={form.medicine} onChange={set('medicine')} className="input" required>
                <option value="">Choose medicine...</option>
                {medicines.map(m => (
                  <option key={m._id} value={m._id}>{m.name} — {m.brand} ({m.strength})</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stock Quantity</label>
              <input type="number" min={0} value={form.stock} onChange={set('stock')} className="input" required />
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input type="number" min={0} step="0.01" value={form.price} onChange={set('price')} className="input" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={set('expiryDate')} className="input" />
            </div>
            <div>
              <label className="label">Low Stock Alert at</label>
              <input type="number" min={1} value={form.lowStockThreshold} onChange={set('lowStockThreshold')} className="input" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Spinner size="sm" /> : modal === 'add' ? 'Add to Inventory' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
