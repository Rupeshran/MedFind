import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Star, Clock, Phone, Package, ArrowRight, SlidersHorizontal, X } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, EmptyState } from '../../components/common'
import toast from 'react-hot-toast'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

function MedicineCard({ med }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -3 }} className="card card-hover p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-display font-bold text-slate-900 text-sm leading-snug">{med.name}</h3>
            {med.requiresPrescription && <span className="badge badge-blue">Rx</span>}
          </div>
          <p className="text-xs text-slate-500">{med.brand} · {med.strength} · {med.dosageForm}</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{med.composition}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-brand-500" />
        </div>
      </div>
      {med.substitutes?.length > 0 && (
        <p className="text-xs text-slate-400 border-t border-slate-50 pt-2">
          Substitutes: <span className="text-slate-500">{med.substitutes.map(s => s.name).join(', ')}</span>
        </p>
      )}
      <Link to={`/medicines/${med._id}`}
        className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors">
        View Availability <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  )
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [query, setQuery] = useState(q)
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState({ requiresPrescription: '', dosageForm: '' })

  useEffect(() => {
    if (!q) return
    setLoading(true)
    const params = new URLSearchParams({ q, limit: 20 })
    if (filter.requiresPrescription) params.set('requiresPrescription', filter.requiresPrescription)
    api.get(`/medicines?${params}`)
      .then(({ data }) => { setMedicines(data.data); setTotal(data.total) })
      .catch(() => toast.error('Search failed'))
      .finally(() => setLoading(false))
  }, [q, filter])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) setSearchParams({ q: query.trim() })
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16">
      {/* Sticky search bar */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, brand, or composition..." className="input pl-9" />
            </div>
            <button type="submit" className="btn-primary">Search</button>
            <button type="button" onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost ${showFilters ? 'bg-brand-50 text-brand-600' : ''}`}>
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </form>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="pt-3 pb-1 flex flex-wrap gap-3 items-center">
                  <select value={filter.requiresPrescription} onChange={e => setFilter(f => ({ ...f, requiresPrescription: e.target.value }))}
                    className="input w-auto text-xs py-1.5">
                    <option value="">All Types</option>
                    <option value="false">OTC – No Prescription</option>
                    <option value="true">Prescription Required</option>
                  </select>
                  <select value={filter.dosageForm} onChange={e => setFilter(f => ({ ...f, dosageForm: e.target.value }))}
                    className="input w-auto text-xs py-1.5">
                    <option value="">All Forms</option>
                    {['Tablet','Capsule','Syrup','Injection','Cream','Inhaler'].map(d => <option key={d}>{d}</option>)}
                  </select>
                  <button onClick={() => setFilter({ requiresPrescription: '', dosageForm: '' })}
                    className="text-xs text-red-500 flex items-center gap-1 hover:underline">
                    <X className="w-3 h-3" /> Clear
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {q && (
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-slate-900">
              Results for "<span className="text-brand-600">{q}</span>"
            </h1>
            <p className="text-slate-400 text-sm mt-1">{total} medicine{total !== 1 ? 's' : ''} found</p>
          </div>
        )}

        {!q ? (
          <EmptyState icon={<Search className="w-8 h-8" />} title="Enter a search term"
            description="Search for medicines by name, brand, or active composition." />
        ) : loading ? (
          <PageLoader />
        ) : medicines.length === 0 ? (
          <EmptyState icon={<Package className="w-8 h-8" />} title="No medicines found"
            description={`No results match "${q}". Try a different name or check the spelling.`} />
        ) : (
          <motion.div initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map(med => <MedicineCard key={med._id} med={med} />)}
          </motion.div>
        )}
      </div>
    </div>
  )
}
