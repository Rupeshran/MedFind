import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand">
                <span className="text-white font-display font-bold">M</span>
              </div>
              <span className="font-display font-bold text-xl text-white">Med<span className="text-brand-400">Find</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Your trusted platform for locating medicines and pharmacies nearby. Saving lives, one search at a time.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-500 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5 text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: '/search', label: 'Find Medicine' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/pharmacy/register', label: 'Register Pharmacy' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-brand-400 text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-3">
              {['Medicine Search', 'Nearby Pharmacies', 'Reservation System', 'Prescription Upload', 'Stock Alerts'].map((label) => (
                <li key={label}><span className="text-slate-400 text-sm">{label}</span></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-5 text-sm uppercase tracking-widest">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin size={15} className="text-brand-400 mt-0.5 shrink-0" />
                MedFind HQ, Mumbai, Maharashtra, India
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Phone size={15} className="text-brand-400 shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Mail size={15} className="text-brand-400 shrink-0" />
                support@medfind.in
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} MedFind. All rights reserved.</p>
          <p className="text-slate-500 text-sm flex items-center gap-1.5">
            Made with <Heart size={13} className="text-red-400 fill-red-400" /> for better healthcare access
          </p>
        </div>
      </div>
    </footer>
  )
}
