import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, Clock, ChevronRight, Loader2, Phone, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import { useLanguage } from '../../contexts/LanguageContext'

const STATUS_STEPS = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
const STATUS_LABELS = { placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled' }
const STATUS_COLORS = { placed: '#818cf8', confirmed: '#6366f1', preparing: '#f59e0b', ready: '#22c55e', out_for_delivery: '#3b82f6', delivered: '#16a34a', completed: '#16a34a', cancelled: '#ef4444' }

export default function OrderTrackingPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { loadOrders() }, [filter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const { data } = await api.get(`/orders/my${params}`)
      setOrders(data.data || [])
    } catch { /* empty */ }
    setLoading(false)
  }

  const cancelOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`, { cancelReason: 'User requested cancellation' })
      loadOrders()
    } catch { /* empty */ }
  }

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📦</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{t('orders.title')}</h1>
        </motion.div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['all', 'placed', 'confirmed', 'preparing', 'delivered', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: filter === f ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)', color: '#fff',
              }}>
              {f === 'all' ? 'All' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} /></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.5)' }}>
            <Package size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p>No orders found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order, idx) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                {/* Header */}
                <div onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  style={{ padding: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${STATUS_COLORS[order.status]}22`, border: `1px solid ${STATUS_COLORS[order.status]}44`,
                  }}>
                    {order.status === 'cancelled' ? <XCircle size={20} style={{ color: STATUS_COLORS[order.status] }} /> :
                      order.status === 'delivered' || order.status === 'completed' ? <CheckCircle size={20} style={{ color: STATUS_COLORS[order.status] }} /> :
                        <Truck size={20} style={{ color: STATUS_COLORS[order.status] }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{order.orderId}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                      {order.items?.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                      {order.pharmacy?.name && ` • ${order.pharmacy.name}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: STATUS_COLORS[order.status], fontSize: 13, fontWeight: 600 }}>{STATUS_LABELS[order.status]}</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>₹{order.grandTotal}</div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.3)', transform: expanded === order._id ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }} />
                </div>

                {/* Expanded Details */}
                {expanded === order._id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
                    style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: 18 }}>
                    {/* Progress Bar (for non-cancelled) */}
                    {order.status !== 'cancelled' && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', paddingBottom: 8 }}>
                          <div style={{ position: 'absolute', top: 10, left: '5%', right: '5%', height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                          <div style={{ position: 'absolute', top: 10, left: '5%', width: `${Math.min(100, (getStepIndex(order.status) / (STATUS_STEPS.length - 1)) * 90)}%`, height: 3, background: 'linear-gradient(90deg, #6366f1, #22c55e)', borderRadius: 2, transition: 'width 0.5s' }} />
                          {STATUS_STEPS.map((step, si) => (
                            <div key={step} style={{ textAlign: 'center', position: 'relative', zIndex: 1, flex: 1 }}>
                              <div style={{
                                width: 22, height: 22, borderRadius: '50%', margin: '0 auto 6px',
                                background: si <= getStepIndex(order.status) ? STATUS_COLORS[step] : 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {si <= getStepIndex(order.status) && <CheckCircle size={12} style={{ color: '#fff' }} />}
                              </div>
                              <div style={{ color: si <= getStepIndex(order.status) ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 500 }}>
                                {STATUS_LABELS[step]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>ITEMS</div>
                      {order.items?.map((item, ii) => (
                        <div key={ii} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ color: '#fff', fontSize: 14 }}>{item.medicine?.name || 'Medicine'} × {item.quantity}</span>
                          <span style={{ color: '#818cf8', fontSize: 14, fontWeight: 600 }}>₹{item.subtotal}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4 }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Delivery</span>
                        <span style={{ color: '#fff', fontSize: 13 }}>₹{order.deliveryCharge || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ color: '#fff', fontWeight: 700 }}>Total</span>
                        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 18 }}>₹{order.grandTotal}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                        {order.paymentMethod === 'online' && order.paymentStatus === 'paid' ? '💳 Paid Online' : `💵 ${t('orders.cod') || 'COD'}`}
                      </span>
                      <span style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                        {order.orderType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                      </span>
                      
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        {['placed', 'confirmed'].includes(order.status) && order.paymentStatus !== 'paid' && (
                          <button onClick={async () => {
                            try {
                              const res = await api.post('/payments/create-checkout-session', { orderId: order._id });
                              if (res.data.success && res.data.url) window.location.href = res.data.url;
                            } catch (e) { alert('Payment session creation failed'); }
                          }} style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            💳 Pay Online Now
                          </button>
                        )}
                        {['placed', 'confirmed'].includes(order.status) && (
                          <button onClick={() => cancelOrder(order._id)}
                            style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
