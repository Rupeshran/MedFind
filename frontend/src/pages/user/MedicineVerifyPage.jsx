import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ShieldX, ShieldAlert, QrCode, Package, Search, Loader2, Calendar, MapPin, Phone, Star } from 'lucide-react'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function MedicineVerifyPage() {
  const { t } = useLanguage()
  const [mode, setMode] = useState('batch') // batch | code
  const [batchNumber, setBatchNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const verify = async () => {
    setLoading(true)
    setResult(null)
    try {
      const body = mode === 'code' ? { verificationCode } : { batchNumber }
      const { data } = await api.post('/verify/medicine', body)
      setResult(data)
    } catch (err) {
      setResult({ verified: false, status: 'error', message: 'Failed to verify. Please try again.' })
    }
    setLoading(false)
  }

  const statusConfig = {
    genuine: { gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', icon: ShieldCheck, glow: 'rgba(34,197,94,0.3)' },
    unverified: { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: ShieldAlert, glow: 'rgba(245,158,11,0.3)' },
    unverified_pharmacy: { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: ShieldAlert, glow: 'rgba(245,158,11,0.3)' },
    expired: { gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: ShieldX, glow: 'rgba(239,68,68,0.3)' },
    error: { gradient: 'linear-gradient(135deg, #6b7280, #4b5563)', icon: ShieldAlert, glow: 'rgba(107,114,128,0.3)' },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔍</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('verify.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{t('verify.subtitle')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 28 }}>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[{ key: 'batch', icon: Package, label: t('verify.enterBatch') }, { key: 'code', icon: QrCode, label: t('verify.enterCode') }].map(m => (
              <button key={m.key} onClick={() => { setMode(m.key); setResult(null) }}
                style={{
                  flex: 1, padding: '12px', border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: mode === m.key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                }}>
                <m.icon size={16} />{m.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'rgba(255,255,255,0.4)' }} />
            <input
              value={mode === 'code' ? verificationCode : batchNumber}
              onChange={e => mode === 'code' ? setVerificationCode(e.target.value) : setBatchNumber(e.target.value)}
              placeholder={mode === 'code' ? 'e.g., MF-A1B2C3D4E5F6' : 'e.g., BATCH-2024-001'}
              style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 16, outline: 'none', boxSizing: 'border-box', letterSpacing: 1 }}
            />
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={verify}
            disabled={loading || (!batchNumber && !verificationCode)}
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: 12, cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: (!batchNumber && !verificationCode) ? 0.5 : 1,
            }}>
            {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</> : <><ShieldCheck size={18} /> {t('verify.verify')}</>}
          </motion.button>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ marginTop: 24 }}>
              {/* Status Badge */}
              {(() => {
                const config = statusConfig[result.status] || statusConfig.error
                const Icon = config.icon
                return (
                  <div style={{ textAlign: 'center', padding: 32, borderRadius: 20, background: config.gradient, boxShadow: `0 8px 32px ${config.glow}`, marginBottom: 20 }}>
                    <Icon size={56} style={{ color: '#fff', marginBottom: 12 }} />
                    <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{result.icon} {result.status === 'genuine' ? t('verify.genuine') : result.status === 'expired' ? 'EXPIRED' : t('verify.unverified')}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{result.message}</p>
                  </div>
                )
              })()}

              {/* Medicine Details */}
              {result.medicine && (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: 20, marginBottom: 16 }}>
                  <h3 style={{ color: '#818cf8', fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>💊 Medicine Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[{ l: 'Name', v: result.medicine.name }, { l: 'Brand', v: result.medicine.brand }, { l: 'Composition', v: result.medicine.composition }, { l: 'Manufacturer', v: result.medicine.manufacturer }, { l: 'Form', v: result.medicine.dosageForm }, { l: 'Strength', v: result.medicine.strength }].map(i => (
                      <div key={i.l}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{i.l}</div>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{i.v || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pharmacy Details */}
              {result.pharmacy && (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: 20, marginBottom: 16 }}>
                  <h3 style={{ color: '#818cf8', fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>🏪 Pharmacy</h3>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{result.pharmacy.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <MapPin size={14} />{result.pharmacy.address?.street}, {result.pharmacy.address?.city}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    {result.pharmacy.phone && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={13} />{result.pharmacy.phone}</span>}
                    {result.pharmacy.rating > 0 && <span style={{ color: '#fbbf24', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Star size={13} />{result.pharmacy.rating}</span>}
                    {result.pharmacy.isVerified && <span style={{ color: '#22c55e', fontSize: 13 }}>✅ Verified</span>}
                  </div>
                </div>
              )}

              {/* Batch Details */}
              {result.batch && (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: 20 }}>
                  <h3 style={{ color: '#818cf8', fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>📦 Batch Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {result.batch.batchNumber && <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Batch #</div><div style={{ color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>{result.batch.batchNumber}</div></div>}
                    {result.batch.verificationCode && <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Verification Code</div><div style={{ color: '#22c55e', fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>{result.batch.verificationCode}</div></div>}
                    {result.batch.expiryDate && <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Expiry Date</div><div style={{ color: result.batch.isExpired ? '#ef4444' : '#22c55e', fontSize: 14, fontWeight: 600 }}><Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />{new Date(result.batch.expiryDate).toLocaleDateString()}</div></div>}
                    {result.batch.daysToExpiry !== null && <div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Days to Expiry</div><div style={{ color: result.batch.daysToExpiry < 0 ? '#ef4444' : result.batch.daysToExpiry < 30 ? '#f59e0b' : '#22c55e', fontSize: 14, fontWeight: 600 }}>{result.batch.daysToExpiry < 0 ? `Expired ${Math.abs(result.batch.daysToExpiry)} days ago` : `${result.batch.daysToExpiry} days`}</div></div>}
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
