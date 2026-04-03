import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Star, Clock, Navigation, ExternalLink, Loader2, ShieldCheck } from 'lucide-react'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function PharmacyMapPage() {
  const { t } = useLanguage()
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLoc, setUserLoc] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadPharmacies()
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}, { timeout: 5000 }
      )
    }
  }, [])

  const loadPharmacies = async () => {
    try {
      const { data } = await api.get('/pharmacies')
      setPharmacies(data.data || [])
    } catch { /* empty */ }
    setLoading(false)
  }

  const getDistance = (coords) => {
    if (!userLoc || !coords || coords[0] === 0) return null
    const R = 6371
    const dLat = ((coords[1] - userLoc.lat) * Math.PI) / 180
    const dLon = ((coords[0] - userLoc.lng) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((userLoc.lat * Math.PI) / 180) * Math.cos((coords[1] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
  }

  const isOpen = (pharmacy) => {
    if (pharmacy.isOpen24Hours) return true
    if (!pharmacy.timings) return false
    const now = new Date()
    const [oh, om] = (pharmacy.timings.open || '09:00').split(':').map(Number)
    const [ch, cm] = (pharmacy.timings.close || '21:00').split(':').map(Number)
    const cur = now.getHours() * 60 + now.getMinutes()
    return cur >= oh * 60 + om && cur <= ch * 60 + cm
  }

  const getMapsUrl = (pharmacy) => {
    if (pharmacy.location?.coordinates && pharmacy.location.coordinates[0] !== 0) {
      return `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.coordinates[1]},${pharmacy.location.coordinates[0]}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name + ' ' + (pharmacy.address?.city || ''))}`
  }

  const sortedPharmacies = [...pharmacies].sort((a, b) => {
    const dA = getDistance(a.location?.coordinates)
    const dB = getDistance(b.location?.coordinates)
    if (dA !== null && dB !== null) return dA - dB
    if (dA !== null) return -1
    if (dB !== null) return 1
    return 0
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
      <Loader2 size={32} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🗺️</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('nav.pharmacyMap')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
            {pharmacies.length} pharmacies found {userLoc ? '• Location detected ✅' : '• Enable location for distance'}
          </p>
        </motion.div>

        {/* Embedded Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 24, border: '1px solid rgba(255,255,255,0.1)', height: 350 }}>
          <iframe
            width="100%" height="350" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=pharmacy+near+${userLoc ? `${userLoc.lat},${userLoc.lng}` : 'India'}&zoom=${userLoc ? 14 : 5}`}
          />
        </motion.div>

        {/* Pharmacy List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
          {sortedPharmacies.map((pharmacy, idx) => {
            const dist = getDistance(pharmacy.location?.coordinates)
            const open = isOpen(pharmacy)
            return (
              <motion.div key={pharmacy._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: 20, transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>{pharmacy.name}</h3>
                      {pharmacy.isVerified && <ShieldCheck size={16} style={{ color: '#22c55e' }} />}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} />{pharmacy.address?.street}, {pharmacy.address?.city}
                    </div>
                  </div>
                  {dist !== null && (
                    <div style={{ padding: '4px 10px', background: dist <= 3 ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)', borderRadius: 8, color: dist <= 3 ? '#22c55e' : '#818cf8', fontSize: 13, fontWeight: 700 }}>
                      {dist} km
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: open ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: open ? '#22c55e' : '#ef4444' }}>
                    {open ? (pharmacy.isOpen24Hours ? '24/7 Open' : t('pharmacy.open')) : t('pharmacy.closed')}
                  </span>
                  {pharmacy.rating > 0 && (
                    <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} />{pharmacy.rating} ({pharmacy.totalRatings})
                    </span>
                  )}
                  {pharmacy.timings && !pharmacy.isOpen24Hours && (
                    <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />{pharmacy.timings.open} - {pharmacy.timings.close}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={getMapsUrl(pharmacy)} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, color: '#fff', textDecoration: 'none', textAlign: 'center', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Navigation size={14} />{t('pharmacy.directions')}
                  </a>
                  {pharmacy.phone && (
                    <a href={`tel:${pharmacy.phone}`}
                      style={{ padding: '10px 16px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, color: '#22c55e', textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={14} />{t('pharmacy.call')}
                    </a>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
