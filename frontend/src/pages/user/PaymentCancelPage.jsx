import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: 20 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: 'rgba(255,255,255,0.05)', padding: 40, borderRadius: 24, textAlign: 'center', maxWidth: 450, width: '100%', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
        
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <XCircle size={40} style={{ color: '#ef4444' }} />
        </motion.div>

        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Payment Cancelled</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, lineHeight: 1.6 }}>
          You cancelled the payment process. Don't worry, your order is still saved. You can try paying again from your orders page.
        </p>

        <button onClick={() => navigate('/orders')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
          <ArrowLeft size={18} /> Return to Orders
        </button>
      </motion.div>
    </div>
  );
}
