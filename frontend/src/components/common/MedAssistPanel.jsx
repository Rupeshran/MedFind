import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, MapPin, Clock, Star, ShieldCheck, AlertCircle,
  Pill, ChevronRight, ExternalLink, Tag, Package, Zap,
  Navigation, Loader2, TrendingDown, Award, Store, Globe,
  ArrowRight, Sparkles, MessageSquare, RotateCcw, Map, Send
} from 'lucide-react'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'

// ── Main MedAssist Panel ──────────────────────────────────────────
export default function MedAssistPanel() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('search') // 'search' | 'chat'
  
  // Search State
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(true)
  
  // Chat State
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I am MedBot, your AI health assistant. You can ask me about common symptoms, medicine uses, or health advice. How can I help you today?', disclaimer: false }
  ])
  
  
  // Global State
  const { language } = useLanguage()
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  
  const inputRef = useRef(null)
  const chatInputRef = useRef(null)
  const resultsRef = useRef(null)
  const chatScrollRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open && !userLocation) detectLocation()
    if (open && mode === 'search' && inputRef.current) setTimeout(() => inputRef.current?.focus(), 300)
    if (open && mode === 'chat' && chatInputRef.current) setTimeout(() => chatInputRef.current?.focus(), 300)
  }, [open, mode])

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
  }, [messages, chatLoading])

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLoading(false)
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // --- Search Logic ---
  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(null); setResults(null); setShowHistory(false)
    try {
      let url = `/smart-search?q=${encodeURIComponent(query.trim())}`
      if (userLocation) url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`
      const { data } = await api.get(url)
      setResults(data)
      setHistory(prev => [{ query, timestamp: Date.now(), data }, ...prev.filter(h => h.query.toLowerCase() !== query.toLowerCase())].slice(0, 10))
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const quickSearch = (term) => {
    setQuery(term)
    setTimeout(() => handleSearchDirect(term), 50)
  }

  const handleSearchDirect = async (searchQuery) => {
    setLoading(true); setError(null); setResults(null); setShowHistory(false)
    try {
      let url = `/smart-search?q=${encodeURIComponent(searchQuery)}`
      if (userLocation) url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`
      const { data } = await api.get(url)
      setResults(data)
      setHistory(prev => [{ query: searchQuery, timestamp: Date.now(), data }, ...prev.filter(h => h.query.toLowerCase() !== searchQuery.toLowerCase())].slice(0, 10))
    } catch {
      setError('Search failed.')
    } finally {
      setLoading(false)
    }
  }

  const resetPanel = () => {
    setQuery(''); setResults(null); setError(null); setShowHistory(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // --- Chat Logic ---
  const handleChat = async (e, forcedQuery = null) => {
    e?.preventDefault()
    const q = forcedQuery || chatInput.trim()
    if (!q) return

    setChatInput('')
    setMessages(prev => [...prev, { type: 'user', text: q }])
    setChatLoading(true)

    try {
      const { data } = await api.post('/chatbot/query', { message: q, lang: language })
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: data.response?.text || 'I could not understand that.', 
        actions: data.response?.quickActions || [],
        disclaimer: !!data.disclaimer 
      }])
      // If the intent redirected to a specific tab or action
      if (data.response?.type === 'redirect') {
        setTimeout(() => {
          if (data.response.action === 'search') {
            setMode('search')
            setQuery(data.response.searchQuery)
            handleSearchDirect(data.response.searchQuery)
          } else if (data.response.action === 'interactions') {
            navigate('/interactions')
            setOpen(false)
          } else if (data.response.action === 'pharmacy_map') {
            navigate('/pharmacy-map')
            setOpen(false)
          } else if (data.response.action === 'reminders') {
            navigate('/reminders')
            setOpen(false)
          }
        }, 1500)
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I am having trouble connecting to my database right now. Please try again later.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const quickSearchTerms = ['Paracetamol', 'headache', 'acidity', 'Vitamin D3', 'Cetirizine']

  return (
    <>
      {/* ── Floating Trigger Button ──────────────────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)} className="medassist-fab"
          >
            <div className="medassist-fab-inner"><Sparkles size={22} /><span className="medassist-fab-label">MedAssist</span></div>
            <div className="medassist-fab-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Panel Overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="medassist-backdrop" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }} className="medassist-panel">
              
              {/* Header */}
              <div className="medassist-header">
                <div className="medassist-header-left">
                  <div className="medassist-logo"><Sparkles size={20} /></div>
                  <div>
                    <h3 className="medassist-title">MedAssist AI</h3>
                    <p className="medassist-subtitle">
                      {userLocation ? <span><MapPin size={10} className="inline mr-1"/>Location active</span> : 
                        <button onClick={detectLocation} className="hover:text-white transition-colors text-slate-300"><Navigation size={10} className="inline mr-1"/>Enable location</button>}
                    </p>
                  </div>
                </div>
                <div className="medassist-header-actions">
                  <button onClick={() => setOpen(false)} className="medassist-close-btn"><X size={18} /></button>
                </div>
              </div>

              {/* Tabs */}
              <div className="medassist-main-tabs">
                <button onClick={() => setMode('search')} className={`medassist-main-tab ${mode === 'search' ? 'active' : ''}`}>
                  <Search size={16} /> Smart Search
                </button>
                <button onClick={() => setMode('chat')} className={`medassist-main-tab ${mode === 'chat' ? 'active' : ''}`}>
                  <MessageSquare size={16} /> MedBot Chat
                </button>
              </div>

              {/* ── Mode: Smart Search ────────────────────────────────── */}
              {mode === 'search' && (
                <>
                  <div className="medassist-search-wrap">
                    <form onSubmit={handleSearch} className="medassist-search-form">
                      <Search size={16} className="medassist-search-icon" />
                      <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicines or symptoms..." className="medassist-search-input" />
                      {query && <button type="button" onClick={() => setQuery('')} className="medassist-search-clear"><X size={14} /></button>}
                      <button type="submit" disabled={loading || !query.trim()} className="medassist-search-btn">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                      </button>
                    </form>
                  </div>
                  
                  <div className="medassist-content" ref={resultsRef}>
                    {showHistory && !loading && !results && (
                      <div className="animate-slide-up">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3"><Zap size={12} className="inline mr-1"/> Trending Searches</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {quickSearchTerms.map((term) => (
                            <button key={term} onClick={() => quickSearch(term)} className="px-4 py-2 bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-sm font-medium transition-colors border border-slate-200">
                              {term}
                            </button>
                          ))}
                        </div>
                        {history.length > 0 && (
                          <>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3"><Clock size={12} className="inline mr-1"/> Recent</p>
                            <div className="flex flex-col gap-1">
                              {history.slice(0, 5).map((h, i) => (
                                <button key={i} onClick={() => { setQuery(h.query); setResults(h.data); setShowHistory(false) }} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left text-sm text-slate-600">
                                  <Clock size={14} className="text-slate-400" /> <span className="flex-1 font-medium">{h.query}</span> <ChevronRight size={14} className="text-slate-300"/>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {loading && (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 animate-slide-up">
                        <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                        <p className="font-medium">Searching inventory...</p>
                      </div>
                    )}

                    {error && (
                      <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 text-center animate-slide-up">
                        <AlertCircle size={24} className="text-rose-500 mx-auto mb-2" />
                        <p className="text-rose-700 text-sm mb-4">{error}</p>
                        <button onClick={resetPanel} className="btn-secondary py-1.5 px-4 text-xs">Try Again</button>
                      </div>
                    )}

                    {!loading && results && !results.found && (
                      <div className="p-6 text-center animate-slide-up">
                        <div className="text-4xl mb-4">🔍</div>
                        <p className="text-slate-600 font-medium">{results.message}</p>
                        {results.alternatives?.length > 0 && (
                          <div className="mt-6 text-left">
                            <p className="text-sm font-semibold text-slate-500 mb-3">Did you mean?</p>
                            <div className="flex flex-wrap gap-2">
                              {results.alternatives.map(alt => (
                                <button key={alt} onClick={() => quickSearch(alt)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">{alt}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!loading && results && results.found && (
                      <div className="animate-slide-up pb-6">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm font-semibold text-slate-500">{results.results.length} results found</p>
                          <button onClick={resetPanel} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">Clear</button>
                        </div>
                        {results.results.map((result, idx) => (
                          <ResultCard key={idx} result={result} isSymptom={results.isSymptomSearch} symptom={results.symptom} navigate={navigate} setOpen={setOpen} />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── Mode: MedBot Chat ────────────────────────────────── */}
              {mode === 'chat' && (
                <>
                  <div className="medbot-messages" ref={chatScrollRef} style={{ padding: '20px' }}>
                    {messages.map((msg, i) => (
                      <div key={i} className={`medbot-message ${msg.type}`}>
                        <div className="medbot-avatar">
                          {msg.type === 'bot' ? <Sparkles size={14} /> : <UserIcon />}
                        </div>
                        <div>
                          <div className="medbot-bubble" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="medbot-actions-row">
                              {msg.actions.map((act, j) => (
                                <button key={j} onClick={() => handleChat(null, act)} className="medbot-action-btn">{act}</button>
                              ))}
                            </div>
                          )}
                          {msg.disclaimer && (
                            <div className="medbot-alert">
                              <AlertCircle size={14} className="medbot-alert-icon" />
                              <span className="medbot-alert-text">This is for informational purposes only and not medical advice.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="medbot-message bot">
                        <div className="medbot-avatar"><Sparkles size={14} /></div>
                        <div className="medbot-bubble"><Loader2 size={16} className="animate-spin text-indigo-500" /></div>
                      </div>
                    )}
                  </div>
                  <div className="medbot-input-area">
                    <form onSubmit={(e) => handleChat(e)} className="w-full flex gap-2">
                      <input ref={chatInputRef} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about symptoms, medicines..." className="medbot-input" disabled={chatLoading} />
                      <button type="submit" disabled={chatLoading || !chatInput.trim()} className="medbot-send-btn">
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function UserIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> }

// ── Single Result Card ────────────────────────────────────────────
function ResultCard({ result, isSymptom, symptom, navigate, setOpen }) {
  const { medicine, nearbyStores, onlinePrices, bestDeal, genericRecommendation, stats } = result
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4 hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-slate-100 flex gap-4 items-start">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-indigo-100">💊</div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 text-lg">{medicine.name}</h4>
          <p className="text-xs text-slate-500 mt-1">{medicine.brand} • {medicine.dosageForm} • {medicine.strength}</p>
          {isSymptom && <div className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-2.5 py-1 rounded-md">Good for: {symptom}</div>}
        </div>
        <button onClick={() => { navigate(`/medicines/${medicine._id}`); setOpen(false) }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><ExternalLink size={18}/></button>
      </div>

      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button onClick={() => setActiveTab('overview')} className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex justify-center items-center gap-1.5 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Award size={14}/> Compare</button>
        <button onClick={() => setActiveTab('stores')} className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex justify-center items-center gap-1.5 ${activeTab === 'stores' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Store size={14}/> Stores ({stats.totalStores})</button>
        <button onClick={() => setActiveTab('online')} className={`flex-1 py-2.5 text-xs font-semibold border-b-2 flex justify-center items-center gap-1.5 ${activeTab === 'online' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Globe size={14}/> Online</button>
      </div>

      <div className="p-4 bg-white">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {bestDeal && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3">
                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingDown size={12}/> Best Deal</p>
                 <div className="flex justify-between items-end">
                   <div>
                     <p className="text-2xl font-black text-emerald-700 leading-none mb-1">₹{bestDeal.price}</p>
                     <p className="text-xs font-medium text-emerald-800">{bestDeal.platform} • {bestDeal.delivery}</p>
                   </div>
                   {bestDeal.savings > 0 && <span className="text-xs font-bold bg-emerald-200/50 text-emerald-700 px-2 py-1 rounded-md">Save ₹{bestDeal.savings}</span>}
                 </div>
              </div>
            )}
            {genericRecommendation && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1"><Tag size={12}/> Generic Alternative</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{genericRecommendation.name}</p>
                  <p className="text-xs text-slate-500">Save ₹{genericRecommendation.savings}!</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600 mb-1">₹{genericRecommendation.price}</p>
                  <button onClick={() => { navigate(`/medicines/${genericRecommendation.medicineId}`); setOpen(false) }} className="text-[10px] font-bold uppercase text-white bg-indigo-500 px-3 py-1.5 rounded-lg hover:bg-indigo-600">View</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {nearbyStores.length === 0 ? <p className="text-sm text-center text-slate-500 py-4">No nearby stores found.</p> :
              nearbyStores.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1">{s.name} {s.isVerified && <ShieldCheck size={12} className="text-emerald-500"/>}</p>
                    <p className="text-xs text-slate-500 mt-0.5"><MapPin size={10} className="inline"/> {s.distance ? `${s.distance}km` : s.address}</p>
                    <p className={`text-[10px] font-bold mt-1 uppercase ${s.isOpen ? 'text-emerald-600' : 'text-rose-500'}`}>{s.isOpen ? 'Open' : 'Closed'} • {s.stock} in stock</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 mb-1">₹{s.price}</p>
                    {s.mapsUrl && <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold bg-slate-200/60 text-slate-600 hover:text-slate-800 px-2 py-1 rounded inline-flex items-center gap-1"><Map size={10}/> Map</a>}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'online' && (
          <div className="space-y-2">
            {onlinePrices.length === 0 ? <p className="text-sm text-center text-slate-500 py-4">No online prices available.</p> :
              onlinePrices.map((op, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                  <div className="flex gap-3 items-center">
                    <span className="text-2xl">{op.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">{op.platform} {i===0 && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded uppercase">Best</span>}</p>
                      <p className="text-xs text-slate-500"><Clock size={10} className="inline"/> {op.delivery}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900 leading-none">₹{op.price}</p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-1">{op.discount}% OFF</p>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}
