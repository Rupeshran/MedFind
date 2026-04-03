import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, MapPin, X, ChevronDown } from 'lucide-react'
import api from '../../services/api'
import { PageLoader, EmptyState, MedicineCard, Skeleton } from '../../components/common'
import toast from 'react-hot-toast'

// ── Search Landing Page ────────────────────────────────────────────
export function SearchPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search/results?q=${encodeURIComponent(query)}`)
  }

  const popular = ['Paracetamol', 'Amoxicillin', 'Metformin', 'Omeprazole', 'Cetirizine', 'Vitamin D3', 'Azithromycin', 'Ibuprofen']

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-slate-50 to-brand-50/20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="section-title mb-3">Find Your Medicine</h1>
          <p className="text-slate-500">Search by name, brand, or active composition</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="flex gap-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 mb-8">
          <div className="flex-1 flex items-center gap-3 px-3">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
              placeholder="e.g. Paracetamol, Crocin, Amoxicillin..."
              className="flex-1 text-slate-700 placeholder-slate-400 bg-transparent outline-none" />
            {query && <button type="button" onClick={() => setQuery('')}><X size={16} className="text-slate-400" /></button>}
          </div>
          <button type="submit" className="btn-primary px-6 shrink-0">Search</button>
        </motion.form>

        <div>
          <p className="text-sm text-slate-400 font-medium mb-3">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {popular.map((term) => (
              <button key={term} onClick={() => navigate(`/search/results?q=${term}`)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm hover:border-brand-400 hover:text-brand-600 transition-colors shadow-sm">
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Search Results Page ────────────────────────────────────────────
export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); fetchResults(q) }
  }, [searchParams])

  const fetchResults = async (q, pg = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/medicines?q=${encodeURIComponent(q)}&page=${pg}&limit=12`)
      setResults(pg === 1 ? data.data : prev => [...prev, ...data.data])
      setTotal(data.total)
    } catch {
      toast.error('Search failed')
    } finally { setLoading(false) }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setPage(1)
      setSearchParams({ q: query })
    }
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-slate-50">
      {/* Search bar */}
      <div className="bg-white border-b border-slate-100 py-4 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                placeholder="Search medicines..." />
              {query && <button type="button" onClick={() => { setQuery(''); setResults([]); }}>
                <X size={14} className="text-slate-400" />
              </button>}
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        {!loading && results.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-500 text-sm">
              Showing <span className="font-semibold text-slate-700">{results.length}</span> of <span className="font-semibold text-slate-700">{total}</span> results for <span className="font-semibold text-slate-700">"{searchParams.get('q')}"</span>
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && page === 1 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length === 0 && searchParams.get('q') && (
          <EmptyState
            icon={Search}
            title="No medicines found"
            description={`No results for "${searchParams.get('q')}". Try a different name or brand.`}
          />
        )}

        {results.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((medicine, i) => (
              <motion.div key={medicine._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <MedicineCard
                  medicine={medicine}
                  onClick={() => navigate(`/medicines/${medicine._id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load more */}
        {results.length < total && !loading && (
          <div className="text-center mt-8">
            <button onClick={() => { const next = page + 1; setPage(next); fetchResults(searchParams.get('q'), next); }}
              className="btn-secondary">
              Load More Results
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResultsPage
