import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Lock, Save } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Spinner } from '../../components/common'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const handleProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/users/profile', form)
      updateUser(data.data)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setSavingPw(true)
    try {
      await api.put('/users/change-password', pwForm)
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSavingPw(false) }
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-slate-900 mb-8">Profile Settings</h1>

        {/* Avatar */}
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold text-2xl">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
              <span className="badge badge-green mt-1 capitalize">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 mb-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><User size={16} /> Personal Info</h3>
          <form onSubmit={handleProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input" required />
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="input pl-10" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={user.email} className="input pl-10 bg-slate-50 cursor-not-allowed" disabled />
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <Spinner size="sm" /> : <><Save size={15} /> Save Changes</>}
            </button>
          </form>
        </motion.div>

        {/* Change password */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Lock size={16} /> Change Password</h3>
          <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                className="input" required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                className="input" minLength={6} required />
            </div>
            <button type="submit" disabled={savingPw} className="btn-primary disabled:opacity-60">
              {savingPw ? <Spinner size="sm" /> : <><Lock size={15} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
