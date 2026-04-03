import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Bell, Menu, X, ChevronDown, LogOut, User, LayoutDashboard, ClipboardList, Package, Pill, Globe, ShieldCheck, Heart, Timer, FileText, TrendingUp, MapPin, DollarSign, ShoppingBag, Zap } from 'lucide-react'
import api from '../../services/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t, lang, setLang, languages } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (user) api.get('/notifications').then(({ data }) => setUnread(data.unreadCount)).catch(() => {})
  }, [user, location])

  useEffect(() => { setMenuOpen(false); setDropOpen(false); setLangOpen(false); setFeaturesOpen(false) }, [location])

  const handleLogout = () => { logout(); navigate('/') }
  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'pharmacy' ? '/pharmacy' : '/dashboard'

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/search', label: t('nav.search') },
  ]

  const featureLinks = [
    { to: '/interactions', label: t('nav.interactions'), icon: Zap, color: '#f59e0b' },
    { to: '/pharmacy-map', label: t('nav.pharmacyMap'), icon: MapPin, color: '#22c55e' },
    { to: '/price-compare', label: t('nav.priceCompare'), icon: DollarSign, color: '#6366f1' },
    { to: '/prescription-scan', label: t('nav.prescriptionScan'), icon: FileText, color: '#3b82f6' },
    { to: '/verify-medicine', label: t('nav.verifyMedicine'), icon: ShieldCheck, color: '#8b5cf6' },
    { to: '/trending', label: t('nav.trending'), icon: TrendingUp, color: '#ec4899' },
  ]

  const userMenuLinks = [
    { to: '/health-profile', label: t('nav.healthProfile'), icon: Heart, color: '#ef4444' },
    { to: '/expiry-tracker', label: t('nav.expiryTracker'), icon: Timer, color: '#f59e0b' },
    { to: '/reminders', label: 'Medicine Reminders', icon: Bell, color: '#10b981' },
    { to: '/orders', label: t('nav.orders'), icon: ShoppingBag, color: '#22c55e' },
  ]

  const currentLang = languages.find(l => l.code === lang) || languages[0]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">Med<span className="text-brand-500">Find</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === to ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}>{label}</Link>
            ))}

            {/* Features Dropdown */}
            <div className="relative">
              <button onClick={() => { setFeaturesOpen(!featuresOpen); setDropOpen(false); setLangOpen(false) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  featuresOpen ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}>
                {t('home.features')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {featuresOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full mt-1 w-64 card shadow-lg py-2 z-50">
                    {featureLinks.map(({ to, label, icon: Icon, color }) => (
                      <Link key={to} to={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                          <Icon size={14} style={{ color }} />
                        </div>
                        {label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button onClick={() => { setLangOpen(!langOpen); setDropOpen(false); setFeaturesOpen(false) }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-semibold">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-1 w-48 card shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('nav.language')}</p>
                    </div>
                    {languages.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                          lang === l.code ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}>
                        <span className="text-lg">{l.flag}</span>
                        <div>
                          <div className="font-medium">{l.nativeName}</div>
                          <div className="text-xs text-slate-400">{l.name}</div>
                        </div>
                        {lang === l.code && <span className="ml-auto text-brand-500">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <>
                <Link to={dashboardLink} className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                  <Bell className="w-5 h-5" />
                  {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
                </Link>
                <div className="relative">
                  <button onClick={() => { setDropOpen(!dropOpen); setLangOpen(false); setFeaturesOpen(false) }} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all">
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">{user.name[0].toUpperCase()}</div>
                    <span className="text-sm font-semibold text-slate-700">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {dropOpen && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-1 w-56 card shadow-lg py-1 z-50">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-400 capitalize">{user.role} account</p>
                        </div>
                        <Link to={dashboardLink} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><LayoutDashboard className="w-4 h-4 text-brand-500" />{t('nav.dashboard')}</Link>
                        {user.role === 'user' && <>
                          <Link to="/reservations" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><ClipboardList className="w-4 h-4 text-brand-500" />My Reservations</Link>
                          <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><User className="w-4 h-4 text-brand-500" />{t('nav.profile')}</Link>
                          <hr className="my-1 border-slate-100" />
                          {userMenuLinks.map(({ to, label, icon: Icon, color }) => (
                            <Link key={to} to={to} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                              <Icon className="w-4 h-4" style={{ color }} />{label}
                            </Link>
                          ))}
                        </>}
                        {user.role === 'pharmacy' && <Link to="/pharmacy/inventory" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Package className="w-4 h-4 text-brand-500" />Inventory</Link>}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100">
                          <LogOut className="w-4 h-4" />{t('nav.logout')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary">{t('home.cta')}</Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">{label}</Link>
              ))}
              <hr className="my-2 border-slate-100" />
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('home.features')}</p>
              {featureLinks.map(({ to, label, icon: Icon, color }) => (
                <Link key={to} to={to} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Icon size={16} style={{ color }} />{label}
                </Link>
              ))}
              <hr className="my-2 border-slate-100" />

              {/* Mobile Language Switcher */}
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('nav.language')}</p>
              <div className="flex flex-wrap gap-2 px-4 py-2">
                {languages.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      lang === l.code ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>
                    {l.flag} {l.nativeName}
                  </button>
                ))}
              </div>
              <hr className="my-2 border-slate-100" />

              {user ? (
                <>
                  <Link to={dashboardLink} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">{t('nav.dashboard')}</Link>
                  {user.role === 'user' && userMenuLinks.map(({ to, label, icon: Icon, color }) => (
                    <Link key={to} to={to} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Icon size={16} style={{ color }} />{label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">{t('nav.logout')}</button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link to="/login" className="flex-1 text-center btn-secondary">{t('nav.login')}</Link>
                  <Link to="/register" className="flex-1 text-center btn-primary">{t('nav.register')}</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
