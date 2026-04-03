import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Message sent! We will get back to you soon.')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="pt-20">
      <section className="py-16 bg-gradient-to-br from-slate-50 to-brand-50/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="section-title mb-3">Get In Touch</h1>
          <p className="section-sub mx-auto">Have questions? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display font-bold text-2xl text-slate-900 mb-6">Contact Information</h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Address', val: 'MedFind HQ, Mumbai, Maharashtra 400001' },
                  { icon: Phone, label: 'Phone', val: '+91 98765 43210' },
                  { icon: Mail, label: 'Email', val: 'support@medfind.in' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{label}</p>
                      <p className="text-sm text-slate-500">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input" placeholder="Your name" required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="input" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="label">Subject</label>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="input" placeholder="How can we help?" required />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="input h-32 resize-none" placeholder="Your message..." required />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3">
                <Send size={16} /> Send Message
              </button>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  )
}
