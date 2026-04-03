import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Spinner } from '../../components/common'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'pharmacy') navigate('/pharmacy')
      else navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoLogins = [
    { label: 'Admin', email: 'admin@medfind.com' },
    { label: 'Pharmacy', email: 'rajesh@citymedical.com' },
    { label: 'User', email: 'anita@gmail.com' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50/30 pt-16 px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand">
              <span className="text-white font-display font-bold">M</span>
            </div>
            <span className="font-display font-bold text-xl text-slate-900">Med<span className="text-brand-500">Find</span></span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your account</p>
        </div>

        <div className="card p-8">
          {/* Demo credentials */}
          <div className="bg-blue-50 rounded-xl p-3.5 mb-6">
            <p className="text-xs text-blue-600 font-semibold mb-2">Demo Accounts (password: password123)</p>
            <div className="flex gap-2 flex-wrap">
              {demoLogins.map(({ label, email }) => (
                <button key={label} onClick={() => setForm({ email, password: 'password123' })}
                  className="text-xs px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input pl-10" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60">
              {loading ? <Spinner size="sm" /> : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}
