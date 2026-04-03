import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, TrendingDown, MapPin, Star, ExternalLink, ShoppingCart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'

const COLORS = ['#22c55e', '#6366f1', '#818cf8', '#a78bfa', '#c084fc', '#d8b4fe', '#f59e0b', '#ef4444']

export default function PriceComparePage() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedMed, setSelectedMed] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userLoc, setUserLoc] = useState(null)

  const searchMedicines = async (q) => {
    if (!q || q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const { data } = await api.get(`/medicines?q=${q}&limit=6`)
      setSearchResults(data.data || [])
    } catch { setSearchResults([]) }
    setSearching(false)
  }

  const selectMedicine = async (med) => {
    setSelectedMed(med)
    setSearchResults([])
    setQuery(med.name)
    setLoading(true)

    // Get location
    let lat, lng
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }))
        lat = pos.coords.latitude
        lng = pos.coords.longitude
        setUserLoc({ lat, lng })
      } catch { /* no location */ }
    }

    try {
      const params = lat ? `?lat=${lat}&lng=${lng}` : ''
      const { data } = await api.get(`/compare/medicine/${med._id}${params}`)
      
      // Also get smart search for online prices
      const smartParams = `?q=${encodeURIComponent(med.name)}${lat ? `&lat=${lat}&lng=${lng}` : ''}`
      const { data: smartData } = await api.get(`/smart-search${smartParams}`)
      
      setComparison({
        pharmacies: data.data || [],
        stats: data.stats,
        onlinePrices: smartData.results?.[0]?.onlinePrices || [],
        bestDeal: smartData.results?.[0]?.bestDeal,
      })
    } catch { /* error */ }
    setLoading(false)
  }

  const chartData = comparison?.pharmacies?.map(p => ({
    name: p.pharmacy?.name?.substring(0, 15) || 'Pharmacy',
    price: p.price,
    distance: p.distance,
  })) || []

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💰</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('compare.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{t('compare.subtitle')}</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24, marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'rgba(255,255,255,0.4)' }} />
            <input value={query} onChange={e => { setQuery(e.target.value); searchMedicines(e.target.value) }}
              placeholder="Search for a medicine to compare prices..."
              style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
            {searching && <Loader2 size={18} style={{ position: 'absolute', right: 16, top: 14, color: '#818cf8', animation: 'spin 1s linear infinite' }} />}
          </div>

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ marginTop: 8, background: 'rgba(30,27,75,0.95)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                {searchResults.map(med => (
                  <div key={med._id} onClick={() => selectMedicine(med)}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{med.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{med.brand} • {med.composition}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} /></div>
        )}

        {comparison && !loading && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats Banner */}
            {comparison.stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Lowest', value: `₹${comparison.stats.lowest}`, color: '#22c55e' },
                  { label: 'Average', value: `₹${comparison.stats.average}`, color: '#818cf8' },
                  { label: 'Highest', value: `₹${comparison.stats.highest}`, color: '#ef4444' },
                  { label: 'You Save', value: `₹${comparison.stats.savings}`, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ color: s.color, fontSize: 24, fontWeight: 800 }}>{s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Best Deal */}
            {comparison.bestDeal && (
              <div style={{ padding: 20, background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.1))', borderRadius: 16, border: '1px solid rgba(34,197,94,0.3)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 32 }}>🏆</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#22c55e', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Best Deal</div>
                  <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{comparison.bestDeal.platform} — ₹{comparison.bestDeal.price}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{comparison.bestDeal.delivery} • Save ₹{comparison.bestDeal.savings}</div>
                </div>
              </div>
            )}

            {/* Price Chart */}
            {chartData.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24, marginBottom: 24 }}>
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📊 Pharmacy Price Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, idx) => <Cell key={idx} fill={idx === 0 ? '#22c55e' : COLORS[idx % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pharmacy List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16, marginBottom: 24 }}>
              {/* Local Pharmacies */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24 }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🏪 {t('compare.stores')} ({comparison.pharmacies.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {comparison.pharmacies.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: idx === 0 ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: 12, border: idx === 0 ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                      {idx === 0 && <span style={{ fontSize: 16 }}>🥇</span>}
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{item.pharmacy?.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, display: 'flex', gap: 8, marginTop: 2 }}>
                          {item.distance !== null && <span><MapPin size={11} style={{ display: 'inline' }} /> {item.distance} km</span>}
                          {item.pharmacy?.rating > 0 && <span><Star size={11} style={{ display: 'inline' }} /> {item.pharmacy.rating}</span>}
                          <span>Stock: {item.stock}</span>
                        </div>
                      </div>
                      <div style={{ color: idx === 0 ? '#22c55e' : '#fff', fontWeight: 700, fontSize: 18 }}>₹{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Online Prices */}
              {comparison.onlinePrices.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24 }}>
                  <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🌐 Online Prices</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {comparison.onlinePrices.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{item.platform}</div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                            🚚 {item.delivery} • {item.discount}% off
                          </div>
                        </div>
                        <div style={{ color: '#818cf8', fontWeight: 700, fontSize: 18 }}>₹{item.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
