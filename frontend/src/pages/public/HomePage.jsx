import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, MapPin, Clock, Shield, Star, ChevronRight,
  Zap, Package, Bell, CheckCircle, ArrowRight, Phone
} from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function HomePage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search/results?q=${encodeURIComponent(query)}`)
    else navigate('/search')
  }

  return (
    <div className="overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-slate-50 via-brand-50/30 to-blue-50/20 hero-pattern">
        {/* Background blobs */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-full text-brand-700 text-sm font-medium mb-6">
                <Zap size={14} className="text-brand-500" />
                Real-time medicine availability
              </motion.div>

              <motion.h1 variants={fadeUp}
                className="font-display font-bold text-5xl md:text-6xl leading-[1.1] text-slate-900 mb-6">
                Find Medicines <br />
                <span className="text-brand-500">Near You</span>, Fast
              </motion.h1>

              <motion.p variants={fadeUp} className="text-slate-500 text-xl leading-relaxed mb-8 max-w-lg">
                Stop wasting time visiting pharmacies. Search medicines, check live stock, and place reservations — all in one place.
              </motion.p>

              {/* Search bar */}
              <motion.form variants={fadeUp} onSubmit={handleSearch}
                className="flex gap-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 mb-8 max-w-lg">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input
                    value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search medicine, brand or composition..."
                    className="flex-1 text-slate-700 placeholder-slate-400 text-sm bg-transparent outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary px-6 shrink-0">Search</button>
              </motion.form>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                {['Paracetamol', 'Amoxicillin', 'Metformin', 'Omeprazole'].map((term) => (
                  <button key={term} onClick={() => navigate(`/search/results?q=${term}`)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-medium hover:border-brand-300 hover:text-brand-600 transition-colors">
                    {term}
                  </button>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — floating cards */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block relative h-[480px]">
              {/* Main card */}
              <div className="absolute top-8 left-0 w-72 card p-5 shadow-xl animate-float">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-xl">💊</div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Paracetamol 650mg</p>
                    <p className="text-xs text-slate-400">Crocin · GSK</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'City Medical', dist: '0.4 km', price: '₹22', stock: 'In Stock' },
                    { name: 'Lifeline Pharmacy', dist: '0.9 km', price: '₹20', stock: 'In Stock' },
                  ].map(({ name, dist, price, stock }) => (
                    <div key={name} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{name}</p>
                        <p className="text-xs text-slate-400">{dist} away</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-brand-600">{price}</p>
                        <span className="badge-green text-xs">{stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification card */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                className="absolute top-4 right-0 card p-4 shadow-lg w-52" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Reservation Confirmed!</p>
                    <p className="text-xs text-slate-400">Ready for pickup</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats card */}
              <div className="absolute bottom-8 right-4 card p-5 shadow-xl w-64" style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '3s' }}>
                <p className="text-xs text-slate-400 font-medium mb-3">Platform Stats</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Medicines', val: '5,000+' },
                    { label: 'Pharmacies', val: '200+' },
                    { label: 'Reservations', val: '12K+' },
                    { label: 'Cities', val: '25+' },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-brand-50 rounded-xl p-2.5 text-center">
                      <p className="font-display font-bold text-brand-700 text-base">{val}</p>
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────────── */}
      <section className="py-8 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-slate-400 text-sm font-medium">
            {['200+ Partner Pharmacies', 'Real-time Stock Updates', 'Prescription Secured', '24/7 Service', 'Free to Use'].map((t) => (
              <span key={t} className="flex items-center gap-2"><CheckCircle size={14} className="text-brand-500" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">How MedFind Works</h2>
            <p className="section-sub mx-auto">Simple, fast, and reliable — find your medicine in 3 easy steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[calc(33%-30px)] right-[calc(33%-30px)] h-0.5 bg-brand-100" />
            {[
              { step: '01', icon: Search, title: 'Search Medicine', desc: 'Type the medicine name, brand, or composition. Our smart search finds it instantly.' },
              { step: '02', icon: MapPin, title: 'Find Nearby Pharmacies', desc: 'See which pharmacies near you have it in stock, with prices and distance.' },
              { step: '03', icon: CheckCircle, title: 'Reserve & Pickup', desc: 'Place a hold request, upload prescription if needed, and pick it up at your convenience.' },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center relative">
                <div className="w-16 h-16 mx-auto mb-5 bg-brand-50 rounded-2xl flex items-center justify-center relative">
                  <Icon size={26} className="text-brand-500" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center font-mono">{step}</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-brand-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-sub mx-auto">Powerful features built for patients, families, and pharmacies</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🔍', color: 'bg-blue-50', title: 'Smart Medicine Search', desc: 'Search by brand, generic name, or active composition across all partner pharmacies.' },
              { icon: '📍', color: 'bg-green-50', title: 'Location-based Discovery', desc: 'Find verified pharmacies within your chosen radius using Google Maps integration.' },
              { icon: '📦', color: 'bg-amber-50', title: 'Live Stock Visibility', desc: 'Real-time inventory updates from pharmacies. Know availability before you travel.' },
              { icon: '📄', color: 'bg-purple-50', title: 'Prescription Upload', desc: 'Securely upload prescription images for regulated medicines. Verified by pharmacists.' },
              { icon: '🔔', color: 'bg-red-50', title: 'Instant Notifications', desc: 'Get notified when your reservation is confirmed, ready, or when stock is restocked.' },
              { icon: '🏥', color: 'bg-brand-50', title: 'Pharmacy Dashboard', desc: 'Pharmacies get a full-featured dashboard to manage inventory, orders, and prescriptions.' },
            ].map(({ icon, color, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card card-hover p-6">
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-2xl mb-4`}>{icon}</div>
                <h3 className="font-display font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">Loved by Thousands</h2>
            <p className="section-sub mx-auto">Real stories from patients and pharmacy owners</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Anita Sharma', role: 'Patient, Mumbai', rating: 5, text: 'My father needed insulin at midnight. MedFind showed me an open pharmacy 600m away with stock. This app is a lifesaver.' },
              { name: 'Rajesh Pharmacy', role: 'Pharmacy Owner', rating: 5, text: 'Since joining MedFind, our footfall increased by 40%. The reservation system is seamless and my inventory is always updated.' },
              { name: 'Dr. Priya Nair', role: 'General Physician', rating: 5, text: 'I recommend MedFind to all my patients. They can check if their prescribed medicines are available before leaving the clinic.' },
            ].map(({ name, role, rating, text }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="card p-6 card-hover">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-brand-700 font-bold text-sm">{name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{name}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-12">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {[
              { q: 'Is MedFind free to use?', a: 'Yes, MedFind is completely free for patients. Pharmacies pay a small monthly subscription to list their inventory.' },
              { q: 'How accurate is the stock information?', a: 'Pharmacies update their inventory in real-time through our dashboard. Stock levels are refreshed automatically with each update.' },
              { q: 'Can I order medicines for delivery?', a: 'MedFind is a reservation and finder platform. You reserve the medicine and pick it up from the pharmacy directly.' },
              { q: 'Is my prescription data secure?', a: 'Absolutely. Prescription images are encrypted and only shared with the pharmacy you are reserving from.' },
              { q: 'How do I register my pharmacy?', a: 'Click on "Register Pharmacy" in the navigation. After submitting your details and license, our admin team verifies within 24 hours.' },
            ].map(({ q, a }, i) => (
              <details key={i} className="card p-5 group cursor-pointer">
                <summary className="font-semibold text-slate-800 text-sm flex items-center justify-between list-none">
                  {q}
                  <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-slate-500 text-sm leading-relaxed mt-3 pt-3 border-t border-slate-50">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Ready to Find Medicines Faster?
            </h2>
            <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of patients who save time and stress using MedFind every day.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="/register" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-xl">
                Get Started Free <ArrowRight size={16} />
              </a>
              <a href="/pharmacy/register" className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
                Register Your Pharmacy
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
