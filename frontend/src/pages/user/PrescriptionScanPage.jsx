import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, FileText, Loader2, Search, ShoppingCart, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function PrescriptionScanPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [mode, setMode] = useState('upload') // upload | text

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setResult(null)
    }
  }

  const scanPrescription = async () => {
    setScanning(true)
    try {
      if (mode === 'upload' && file) {
        const formData = new FormData()
        formData.append('prescription', file)
        if (textInput) formData.append('text', textInput)
        const { data } = await api.post('/ocr/scan', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        setResult(data)
      } else if (textInput) {
        const { data } = await api.post('/ocr/scan', { text: textInput })
        setResult(data)
      }
    } catch (err) {
      console.error('OCR error:', err)
    }
    setScanning(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('ocr.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{t('ocr.subtitle')}</p>
        </motion.div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
          {[{ key: 'upload', icon: Upload, label: 'Upload Image' }, { key: 'text', icon: FileText, label: 'Type Medicines' }].map(m => (
            <button key={m.key} onClick={() => { setMode(m.key); setResult(null) }}
              style={{
                padding: '10px 24px', border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                background: mode === m.key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)',
                color: '#fff', fontSize: 14, fontWeight: 600,
              }}>
              <m.icon size={16} />{m.label}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 28 }}>

          {mode === 'upload' ? (
            <>
              {/* Upload Area */}
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 16,
                border: '2px dashed rgba(99,102,241,0.4)', background: preview ? 'transparent' : 'rgba(99,102,241,0.05)',
                cursor: 'pointer', minHeight: 200, position: 'relative', overflow: 'hidden',
              }}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                {preview ? (
                  <>
                    <img src={preview} alt="Prescription" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 12, objectFit: 'contain' }} />
                    <button onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); setResult(null) }}
                      style={{ position: 'absolute', top: 12, right: 12, padding: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff' }}>
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <Camera size={40} style={{ color: '#818cf8', marginBottom: 12 }} />
                    <p style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>Click to upload prescription</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>JPG, PNG, WEBP up to 10MB</p>
                  </>
                )}
              </label>

              {/* Optional text helper */}
              <div style={{ marginTop: 16 }}>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, display: 'block' }}>
                  Optionally type medicine names from the prescription:
                </label>
                <textarea value={textInput} onChange={e => setTextInput(e.target.value)} rows={3}
                  placeholder="e.g., Amoxicillin 500mg&#10;Paracetamol 650mg&#10;Omeprazole 20mg"
                  style={{ width: '100%', padding: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </>
          ) : (
            /* Text mode */
            <div>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Enter medicine names from your prescription:
              </label>
              <textarea value={textInput} onChange={e => setTextInput(e.target.value)} rows={6}
                placeholder="Type medicine names, one per line:&#10;&#10;Amoxicillin 500mg&#10;Paracetamol 650mg&#10;Omeprazole 20mg&#10;Cetirizine 10mg"
                style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 15, resize: 'vertical', outline: 'none', lineHeight: 1.8, boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* Scan Button */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={scanPrescription}
            disabled={scanning || (!file && !textInput)}
            style={{
              width: '100%', marginTop: 20, padding: '14px', border: 'none', borderRadius: 12,
              background: (!file && !textInput) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontSize: 16, fontWeight: 700, cursor: (!file && !textInput) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (!file && !textInput) ? 0.5 : 1,
            }}>
            {scanning ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> {t('ocr.scanning')}</> : <><Search size={18} /> Scan & Extract Medicines</>}
          </motion.button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 24 }}>
              {/* Summary */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20,
              }}>
                {[
                  { label: 'Extracted', value: result.totalExtracted, color: '#818cf8' },
                  { label: 'Matched', value: result.matched, color: '#22c55e' },
                  { label: 'Unmatched', value: result.unmatched, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ color: s.color, fontSize: 28, fontWeight: 800 }}>{s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Matched Medicines */}
              {result.medicines && result.medicines.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.medicines.map((item, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                      style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Extracted: </span>
                          <span style={{ color: '#818cf8', fontWeight: 600, fontSize: 14 }}>"{item.extractedName}"</span>
                        </div>
                        <div style={{
                          padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          background: item.confidence > 0.9 ? 'rgba(34,197,94,0.15)' : item.confidence > 0.7 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
                          color: item.confidence > 0.9 ? '#22c55e' : item.confidence > 0.7 ? '#eab308' : '#ef4444',
                        }}>
                          {Math.round(item.confidence * 100)}% {t('ocr.confidence')}
                        </div>
                      </div>
                      {item.matches.map((med, mi) => (
                        <div key={mi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: mi < item.matches.length - 1 ? 8 : 0 }}>
                          <div>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{med.name}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{med.brand} • {med.composition?.substring(0, 40)}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => navigate(`/medicines/${med._id}`)}
                              style={{ padding: '6px 14px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: '#818cf8', fontSize: 12, cursor: 'pointer' }}>
                              View
                            </button>
                            <button onClick={() => navigate(`/search/results?q=${med.name}`)}
                              style={{ padding: '6px 14px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#22c55e', fontSize: 12, cursor: 'pointer' }}>
                              <ShoppingCart size={12} style={{ display: 'inline', marginRight: 4 }} />Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Unmatched */}
              {result.unmatchedNames && result.unmatchedNames.length > 0 && (
                <div style={{ marginTop: 16, padding: 16, background: 'rgba(245,158,11,0.1)', borderRadius: 14, border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ color: '#f59e0b', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                    <AlertCircle size={16} style={{ display: 'inline', marginRight: 6 }} />Unmatched Names
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.unmatchedNames.map((name, idx) => (
                      <span key={idx} style={{ padding: '4px 12px', background: 'rgba(245,158,11,0.15)', borderRadius: 8, color: '#fcd34d', fontSize: 13 }}>{name}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
