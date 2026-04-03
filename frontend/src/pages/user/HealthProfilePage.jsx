import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Plus, X, Save, AlertCircle, Loader2, Check, Droplets, Activity, Pill, Phone, Scale, Ruler } from 'lucide-react'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const COMMON_ALLERGIES = ['Penicillin', 'Sulfa', 'Aspirin', 'NSAID', 'Latex', 'Iodine', 'Codeine', 'Morphine', 'Eggs', 'Peanuts', 'Shellfish', 'Dairy']
const COMMON_CONDITIONS = ['Asthma', 'Diabetes', 'Hypertension', 'Heart Disease', 'Kidney Disease', 'Liver Disease', 'Thyroid', 'PCOS', 'Epilepsy', 'Pregnancy', 'Depression', 'Arthritis', 'Peptic Ulcer', 'Glaucoma']

export default function HealthProfilePage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    allergies: [], conditions: [], bloodGroup: '', currentMedications: [],
    emergencyContact: '', gender: '', weight: '', height: '', dateOfBirth: '',
  })
  const [newAllergy, setNewAllergy] = useState('')
  const [newCondition, setNewCondition] = useState('')
  const [newMedication, setNewMedication] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/health-profile')
      if (data.data) {
        setProfile({
          allergies: data.data.allergies || [],
          conditions: data.data.conditions || [],
          bloodGroup: data.data.bloodGroup || '',
          currentMedications: data.data.currentMedications || [],
          emergencyContact: data.data.emergencyContact || '',
          gender: data.data.gender || '',
          weight: data.data.weight || '',
          height: data.data.height || '',
          dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.split('T')[0] : '',
        })
      }
    } catch { /* new profile */ }
    setLoading(false)
  }

  const addTag = (field, value, setter) => {
    if (!value.trim()) return
    if (!profile[field].includes(value.trim())) {
      setProfile(p => ({ ...p, [field]: [...p[field], value.trim()] }))
    }
    setter('')
  }

  const removeTag = (field, idx) => {
    setProfile(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }))
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      await api.put('/health-profile', profile)
      toast.success(t('healthProfile.updated'))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
      <Loader2 size={32} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  const TagInput = ({ label, icon: Icon, field, value, setter, suggestions, placeholder, color }) => (
    <div style={{ marginBottom: 24 }}>
      <label style={{ color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon size={16} style={{ color }} />{label}
      </label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={value} onChange={e => setter(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(field, value, setter))}
          placeholder={placeholder}
          style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }}
        />
        <button onClick={() => addTag(field, value, setter)}
          style={{ padding: '10px 16px', background: color, border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Plus size={16} />
        </button>
      </div>
      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {profile[field].map((item, idx) => (
          <motion.span key={idx} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 16, color, fontSize: 13 }}>
            {item}
            <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeTag(field, idx)} />
          </motion.span>
        ))}
      </div>
      {/* Quick Add Suggestions */}
      {suggestions && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {suggestions.filter(s => !profile[field].includes(s)).slice(0, 6).map(s => (
            <button key={s} onClick={() => addTag(field, s, setter)}
              style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer' }}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>❤️</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('healthProfile.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{t('healthProfile.subtitle')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 28 }}>

          {/* Basic Info Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                <Droplets size={14} style={{ display: 'inline', marginRight: 6 }} />{t('healthProfile.bloodGroup')}
              </label>
              <select value={profile.bloodGroup} onChange={e => setProfile(p => ({ ...p, bloodGroup: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14 }}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Gender</label>
              <select value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14 }}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Scale size={14} />Weight (kg)
              </label>
              <input type="number" value={profile.weight} onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} placeholder="70"
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Ruler size={14} />Height (cm)
              </label>
              <input type="number" value={profile.height} onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} placeholder="170"
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={14} />{t('healthProfile.emergencyContact')}
            </label>
            <input value={profile.emergencyContact} onChange={e => setProfile(p => ({ ...p, emergencyContact: e.target.value }))}
              placeholder="Emergency phone number"
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '24px 0' }} />

          {/* Allergies */}
          <TagInput label={t('healthProfile.allergies')} icon={AlertCircle} field="allergies" value={newAllergy} setter={setNewAllergy}
            suggestions={COMMON_ALLERGIES} placeholder="e.g., Penicillin, Sulfa drugs..." color="#ef4444" />

          {/* Conditions */}
          <TagInput label={t('healthProfile.conditions')} icon={Activity} field="conditions" value={newCondition} setter={setNewCondition}
            suggestions={COMMON_CONDITIONS} placeholder="e.g., Diabetes, Hypertension..." color="#f59e0b" />

          {/* Current Medications */}
          <TagInput label={t('healthProfile.medications')} icon={Pill} field="currentMedications" value={newMedication} setter={setNewMedication}
            suggestions={[]} placeholder="e.g., Metformin 500mg, Amlodipine 5mg..." color="#6366f1" />

          {/* Save Button */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveProfile} disabled={saving}
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: 12, cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
            }}>
            {saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={18} /> {t('healthProfile.save')}</>}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
