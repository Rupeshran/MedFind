import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Bell, Clock, Trash2, Calendar, Pill, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ReminderPage() {
  const { t } = useLanguage()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newReminder, setNewReminder] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'daily',
    times: ['08:00'],
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastNotified, setLastNotified] = useState('') // Format: medicineId-time

  useEffect(() => { loadReminders() }, [])

  // 🔔 Local Notification Scheduler
  useEffect(() => {
    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;
      
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      reminders.filter(r => r.isActive).forEach(r => {
        r.times.forEach(time => {
          const key = `${r._id}-${time}`;
          if (time === currentTime && lastNotified !== key) {
            new Notification('💊 MedFind: Time for Medicine', {
              body: `It is ${time}. Time to take ${r.medicineName} (${r.dosage})`,
              icon: '/medfind-icon-192.png',
              tag: key // Prevent duplicates
            });
            setLastNotified(key);
          }
        });
      });
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [reminders, lastNotified]);

  const loadReminders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/reminders')
      setReminders(data.data || [])
    } catch { /* empty */ }
    setLoading(false)
  }

  const handleAddReminder = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/reminders', newReminder)
      setShowAddModal(false)
      loadReminders()
      // Ask for notification permission
      if (Notification.permission !== 'granted') {
          Notification.requestPermission();
      }
    } catch { /* empty */ }
    setIsSubmitting(false)
  }

  const deleteReminder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return
    try {
      await api.delete(`/reminders/${id}`)
      loadReminders()
    } catch { /* empty */ }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/reminders/${id}`, { isActive: !currentStatus })
      loadReminders()
    } catch { /* empty */ }
  }

  // Helper to generate Today's Timeline
  const getTimelineDoses = () => {
      const doses = [];
      reminders.filter(r => r.isActive).forEach(r => {
          r.times.forEach(time => {
              doses.push({
                  id: `${r._id}-${time}`,
                  medicineName: r.medicineName,
                  dosage: r.dosage,
                  time,
                  _id: r._id
              });
          });
      });
      return doses.sort((a, b) => a.time.localeCompare(b.time));
  };

  const timeline = getTimelineDoses();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Bell size={32} style={{ color: '#10b981' }} /> Medicine Reminders
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>Stay on track with your daily medication schedule.</p>
          </motion.div>
          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>
            <Plus size={20} /> Add Reminder
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 32 }}>
          
          {/* Main List */}
          <div>
            <h2 style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} style={{ color: '#818cf8' }} /> Your Schedules
            </h2>
            
            {loading ? (
              <div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin" style={{ color: '#6366f1' }} size={40} /></div>
            ) : reminders.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>No reminders set yet. Start by adding one!</p>
                <button onClick={() => setShowAddModal(true)} style={{ color: '#10b981', background: 'transparent', border: '1px solid #10b981', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Set First Reminder</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reminders.map((reminder) => (
                  <motion.div key={reminder._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, display: 'flex', alignItems: 'center', gap: 16, backdropFilter: 'blur(10px)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: reminder.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pill size={24} style={{ color: reminder.isActive ? '#10b981' : 'rgba(255,255,255,0.3)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{reminder.medicineName}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Info size={12} /> {reminder.dosage} • {reminder.frequency === 'daily' ? 'Daily' : 'Weekly'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#818cf8', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{reminder.times.join(', ')}</div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => toggleStatus(reminder._id, reminder.isActive)} style={{ background: 'none', border: 'none', color: reminder.isActive ? '#10b981' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: '0.2s' }}>
                          <CheckCircle size={20} />
                        </button>
                        <button onClick={() => deleteReminder(reminder._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}>
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Timeline */}
          <div>
            <h2 style={{ fontSize: 18, color: '#fff', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: '#10b981' }} /> Today
            </h2>
            <div style={{ borderLeft: '2px solid rgba(255,255,255,0.05)', marginLeft: 10, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {timeline.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontStyle: 'italic' }}>No doses scheduled for today.</p>
              ) : timeline.map((dose, idx) => (
                <div key={dose.id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -33, top: 0, width: 16, height: 16, borderRadius: '50%', background: '#1e293b', border: '2px solid #10b981', zIndex: 2 }} />
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{dose.time}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{dose.medicineName}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{dose.dosage}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: 450, background: '#1e293b', borderRadius: 24, padding: 32, zIndex: 1001, border: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 24 }}>Set Reminder</h2>
                <form onSubmit={handleAddReminder}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>MEDICINE NAME</label>
                    <input autoFocus required value={newReminder.medicineName} onChange={e => setNewReminder({...newReminder, medicineName: e.target.value})}
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 15 }} placeholder="e.g. Paracetamol" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>DOSAGE</label>
                      <input required value={newReminder.dosage} onChange={e => setNewReminder({...newReminder, dosage: e.target.value})}
                        style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 15 }} placeholder="e.g. 500mg" />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>FREQUENCY</label>
                      <select value={newReminder.frequency} onChange={e => setNewReminder({...newReminder, frequency: e.target.value})}
                        style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 15 }}>
                        <option value="daily" style={{ background: '#1e293b' }}>Every Day</option>
                        <option value="weekly" style={{ background: '#1e293b' }}>Weekly</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>REMINDER TIMES (Comma separated)</label>
                    <input required value={newReminder.times.join(', ')} onChange={e => setNewReminder({...newReminder, times: e.target.value.split(',').map(t => t.trim())})}
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 15 }} placeholder="08:00, 20:00" />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button disabled={isSubmitting} type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                       {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Set Reminder'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
