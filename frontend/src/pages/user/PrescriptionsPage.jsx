import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Eye } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, EmptyState, StatusBadge, Modal, Spinner } from '../../components/common'
import toast from 'react-hot-toast'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadModal, setUploadModal] = useState(false)
  const [file, setFile] = useState(null)
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [viewImg, setViewImg] = useState(null)

  useEffect(() => {
    api.get('/prescriptions/my').then(({ data }) => setPrescriptions(data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file')
    setUploading(true)
    const fd = new FormData()
    fd.append('prescription', file)
    fd.append('notes', notes)
    try {
      const { data } = await api.post('/prescriptions/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setPrescriptions(prev => [data.data, ...prev])
      toast.success('Prescription uploaded!')
      setUploadModal(false)
      setFile(null)
      setNotes('')
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') }
    finally { setUploading(false) }
  }

  if (loading) return <div className="pt-16"><PageLoader /></div>

  return (
    <div className="pt-20 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">My Prescriptions</h1>
            <p className="text-slate-500 text-sm mt-1">{prescriptions.length} uploaded</p>
          </div>
          <button onClick={() => setUploadModal(true)} className="btn-primary">
            <Upload size={16} /> Upload Prescription
          </button>
        </div>

        {prescriptions.length === 0 ? (
          <EmptyState icon={FileText} title="No prescriptions uploaded"
            description="Upload your prescription to share with pharmacies for regulated medicines."
            action={<button onClick={() => setUploadModal(true)} className="btn-primary">Upload Now</button>} />
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                className="card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                      <FileText size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm">Prescription</p>
                        <StatusBadge status={p.status} />
                      </div>
                      {p.pharmacy && <p className="text-xs text-slate-400">{p.pharmacy.name}</p>}
                      {p.notes && <p className="text-xs text-slate-500 mt-0.5">{p.notes}</p>}
                      <p className="text-xs text-slate-400 mt-1">{new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewImg(p.imageUrl)}
                    className="btn-ghost text-xs"><Eye size={14} /> View</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Prescription">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="label">Prescription Image / PDF</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 transition-colors"
              onClick={() => document.getElementById('presc-file').click()}>
              {file ? (
                <p className="text-sm text-brand-600 font-medium">{file.name}</p>
              ) : (
                <>
                  <Upload size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">Click to select image or PDF (max 5MB)</p>
                </>
              )}
              <input id="presc-file" type="file" className="hidden" accept="image/*,.pdf"
                onChange={e => setFile(e.target.files[0])} />
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="input h-20 resize-none" placeholder="Doctor's name, date, etc." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setUploadModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={uploading} className="btn-primary flex-1 justify-center">
              {uploading ? <Spinner size="sm" /> : <><Upload size={15} /> Upload</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* View image modal */}
      <Modal open={!!viewImg} onClose={() => setViewImg(null)} title="Prescription" width="max-w-2xl">
        {viewImg && (
          <img src={viewImg.startsWith('http') ? viewImg : `http://localhost:5000${viewImg}`}
            alt="Prescription" className="w-full rounded-xl" />
        )}
      </Modal>
    </div>
  )
}
