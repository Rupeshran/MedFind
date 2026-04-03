import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Optional: Could verify payment status on backend here
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: 20 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: 'rgba(255,255,255,0.05)', padding: 40, borderRadius: 24, textAlign: 'center', maxWidth: 450, width: '100%', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
        
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={40} style={{ color: '#22c55e' }} />
        </motion.div>

        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Payment Successful!</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, lineHeight: 1.6 }}>
          Your payment has been processed successfully. Your order is now confirmed.
        </p>

        <button onClick={() => navigate('/orders')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'transform 0.2s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          View My Orders <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}
