import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Search, BarChart3, Loader2, Sun, Cloud, Snowflake, Droplets } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c084fc', '#d8b4fe', '#818cf8', '#6d28d9', '#4f46e5', '#4338ca', '#3730a3']

export default function TrendingPage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [predictions, setPredictions] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [trendRes, predRes] = await Promise.all([
        api.get('/demand/trending?days=30&limit=10'),
        api.get('/demand/predictions?limit=10'),
      ])
      setData(trendRes.data.data)
      setPredictions(predRes.data.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
      <Loader2 size={32} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  const trendIcon = (trend) => {
    if (trend === 'rising') return <TrendingUp size={16} style={{ color: '#22c55e' }} />
    if (trend === 'declining') return <TrendingDown size={16} style={{ color: '#ef4444' }} />
    return <Minus size={16} style={{ color: '#f59e0b' }} />
  }

  const seasonIcon = (reason) => {
    if (reason.includes('Monsoon') || reason.includes('rain') || reason.includes('Water')) return <Droplets size={16} style={{ color: '#3b82f6' }} />
    if (reason.includes('Winter') || reason.includes('Cold') || reason.includes('cold')) return <Snowflake size={16} style={{ color: '#93c5fd' }} />
    if (reason.includes('Heat') || reason.includes('Sun') || reason.includes('Summer')) return <Sun size={16} style={{ color: '#fbbf24' }} />
    return <Cloud size={16} style={{ color: '#94a3b8' }} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📈</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('trending.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{t('trending.subtitle')}</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
          {/* Top Searched Medicines */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24 }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={18} style={{ color: '#818cf8' }} />{t('trending.topSearched')}
            </h3>
            {data?.topMedicines?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.topMedicines.map((med, idx) => (
                  <div key={med._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: idx < 3 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: 12, fontWeight: 800,
                    }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{med.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{med.brand} • {med.category?.name || ''}</div>
                    </div>
                    <div style={{ color: '#818cf8', fontWeight: 700, fontSize: 14 }}>{med.searchCount}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 20 }}>No search data yet</p>
            )}
          </motion.div>

          {/* Category Demand Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24 }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} style={{ color: '#818cf8' }} />Category-wise Demand
            </h3>
            {data?.categoryDemand?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.categoryDemand} dataKey="totalSearches" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                    {data.categoryDemand.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 60 }}>No category data yet</p>
            )}
          </motion.div>

          {/* Demand Predictions */}
          {predictions?.predictions?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24 }}>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} style={{ color: '#22c55e' }} />{t('trending.risingDemand')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {predictions.predictions.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    {trendIcon(p.trend)}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{p.query}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{p.recentSearches} searches (was {p.previousSearches})</div>
                    </div>
                    <div style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      color: p.growthPercent > 0 ? '#22c55e' : '#ef4444',
                      background: p.growthPercent > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    }}>
                      {p.growthPercent > 0 ? '+' : ''}{p.growthPercent}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Seasonal Predictions */}
          {predictions?.seasonalPredictions?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24 }}>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                🌤️ {t('trending.seasonal')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {predictions.seasonalPredictions.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    {seasonIcon(p.reason)}
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{p.medicine}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{p.reason}</div>
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: p.expectedDemand === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: p.expectedDemand === 'high' ? '#fca5a5' : '#fcd34d',
                    }}>
                      {p.expectedDemand === 'high' ? '🔥 High' : '📊 Moderate'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
