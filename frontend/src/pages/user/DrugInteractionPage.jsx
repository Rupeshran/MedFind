import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Shield, ShieldCheck, ShieldX, ShieldAlert, Plus, X, Search, Loader2, Info } from 'lucide-react'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'

const severityConfig = {
  contraindicated: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: ShieldX, label: 'Contraindicated', emoji: '🚫' },
  severe: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', icon: ShieldAlert, label: 'Severe', emoji: '⚠️' },
  moderate: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', icon: AlertTriangle, label: 'Moderate', emoji: '⚡' },
  mild: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', icon: Shield, label: 'Mild', emoji: '💚' },
}

const safetyConfig = {
  safe: { gradient: 'linear-gradient(135deg, #22c55e, #16a34a)', label: 'All Safe', emoji: '✅' },
  generally_safe: { gradient: 'linear-gradient(135deg, #84cc16, #65a30d)', label: 'Generally Safe', emoji: '💚' },
  caution: { gradient: 'linear-gradient(135deg, #eab308, #ca8a04)', label: 'Use with Caution', emoji: '⚡' },
  risky: { gradient: 'linear-gradient(135deg, #f97316, #ea580c)', label: 'Risky Combination', emoji: '⚠️' },
  dangerous: { gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', label: 'Dangerous', emoji: '🚫' },
}

export default function DrugInteractionPage() {
  const { t } = useLanguage()
  const [medicines, setMedicines] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const searchMedicines = async (q) => {
    if (!q || q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const { data } = await api.get(`/medicines?q=${q}&limit=5`)
      setSearchResults(data.data || [])
    } catch { setSearchResults([]) }
    setSearching(false)
  }

  const addMedicine = (med) => {
    if (medicines.find(m => m._id === med._id)) return
    setMedicines(prev => [...prev, med])
    setSearchQuery('')
    setSearchResults([])
    setResult(null)
  }

  const removeMedicine = (id) => {
    setMedicines(prev => prev.filter(m => m._id !== id))
    setResult(null)
  }

  const checkInteractions = async () => {
    if (medicines.length < 2) return
    setChecking(true)
    setError('')
    try {
      const { data } = await api.post('/interactions/check', {
        medicineIds: medicines.map(m => m._id),
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check interactions')
    }
    setChecking(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚠️</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('interactions.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{t('interactions.subtitle')}</p>
        </motion.div>

        {/* Search & Add Medicines */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            <Plus size={18} style={{ display: 'inline', marginRight: 8 }} />{t('interactions.addMedicine')}
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="text" value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); searchMedicines(e.target.value) }}
              placeholder="Type medicine name (e.g., Aspirin, Ibuprofen)..."
              style={{ width: '100%', padding: '12px 16px 12px 44px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
            />
            {searching && <Loader2 size={18} style={{ position: 'absolute', right: 16, top: 14, color: '#818cf8', animation: 'spin 1s linear infinite' }} />}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ marginTop: 8, background: 'rgba(30,27,75,0.95)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                {searchResults.map(med => (
                  <div key={med._id} onClick={() => addMedicine(med)}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{med.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{med.brand} • {med.composition}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Medicines */}
          {medicines.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {medicines.map(med => (
                <motion.div key={med._id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', borderRadius: 20, border: '1px solid rgba(99,102,241,0.3)' }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{med.name}</span>
                  <X size={14} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => removeMedicine(med._id)} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Check Button */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={checkInteractions}
            disabled={medicines.length < 2 || checking}
            style={{
              width: '100%', marginTop: 20, padding: '14px', border: 'none', borderRadius: 12, cursor: medicines.length < 2 ? 'not-allowed' : 'pointer',
              background: medicines.length < 2 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: medicines.length < 2 ? 0.5 : 1,
            }}>
            {checking ? <><Loader2 size={18} className="animate-spin" /> Checking...</> : <><ShieldCheck size={18} /> {t('interactions.checkInteractions')} ({medicines.length} medicines)</>}
          </motion.button>
        </motion.div>

        {/* Error */}
        {error && (
          <div style={{ padding: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#fca5a5', marginBottom: 24 }}>{error}</div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Overall Safety Badge */}
              <div style={{
                textAlign: 'center', padding: '24px', borderRadius: 20, marginBottom: 24,
                background: safetyConfig[result.summary.overallSafety]?.gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}>
                <div style={{ fontSize: 48 }}>{safetyConfig[result.summary.overallSafety]?.emoji}</div>
                <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '8px 0' }}>
                  {safetyConfig[result.summary.overallSafety]?.label}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                  {result.summary.interactionsFound} interaction(s) found across {result.summary.pairsChecked} medicine pairs
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
                  {result.summary.contraindicated > 0 && <span style={{ color: '#fecaca', fontSize: 13 }}>🚫 {result.summary.contraindicated} Contraindicated</span>}
                  {result.summary.severe > 0 && <span style={{ color: '#fed7aa', fontSize: 13 }}>⚠️ {result.summary.severe} Severe</span>}
                  {result.summary.moderate > 0 && <span style={{ color: '#fef08a', fontSize: 13 }}>⚡ {result.summary.moderate} Moderate</span>}
                  {result.summary.mild > 0 && <span style={{ color: '#bbf7d0', fontSize: 13 }}>💚 {result.summary.mild} Mild</span>}
                </div>
              </div>

              {/* Individual Interactions */}
              {result.interactions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {result.interactions.map((interaction, idx) => {
                    const config = severityConfig[interaction.severity]
                    const Icon = config.icon
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                        style={{ background: config.bg, border: `1px solid ${config.border}`, borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: config.color }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <Icon size={20} style={{ color: config.color }} />
                          <span style={{ color: config.color, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                            {config.emoji} {config.label}
                          </span>
                          {interaction.onsetTime && (
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginLeft: 'auto' }}>
                              Onset: {interaction.onsetTime}
                            </span>
                          )}
                        </div>
                        <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                          {interaction.medicine1.name} + {interaction.medicine2.name}
                        </h4>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{interaction.description}</p>
                        {interaction.mechanism && (
                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>
                            <strong>Mechanism:</strong> {interaction.mechanism}
                          </p>
                        )}
                        <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ color: '#818cf8', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>💡 RECOMMENDATION</div>
                          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>{interaction.recommendation}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, background: 'rgba(34,197,94,0.1)', borderRadius: 20, border: '1px solid rgba(34,197,94,0.2)' }}>
                  <ShieldCheck size={48} style={{ color: '#22c55e', marginBottom: 12 }} />
                  <h3 style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>{t('interactions.noInteractions')}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>These medicines appear safe to take together based on our database.</p>
                </div>
              )}

              {/* Disclaimer */}
              {result.disclaimer && (
                <div style={{ marginTop: 24, padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Info size={18} style={{ color: '#818cf8', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{result.disclaimer}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
