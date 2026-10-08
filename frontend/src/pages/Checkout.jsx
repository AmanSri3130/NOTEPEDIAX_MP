import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';
import useCart from '../hooks/useCart';
import usePaymentStatus from '../hooks/usePaymentStatus';
import api from '../utils/api';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import CosmicLoader from '../components/animations/CosmicLoader';

import PaymentModal from './checkout/PaymentModal';
import VerificationWaiting from './checkout/VerificationWaiting';
import PaymentSuccess from './checkout/PaymentSuccess';
import PaymentFailed from './checkout/PaymentFailed';

export default function Checkout() {
  const navigate = useNavigate();
  const { clearCart, refreshCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [sessionToken, setSessionToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txnDetails, setTxnDetails] = useState(null);
  const [customStatus, setCustomStatus] = useState(''); // Local override for immediate feedback

  // Hook for monitoring payment status
  const { status: hookStatus, receiptUrl, rejectionReason } = usePaymentStatus(sessionToken);

  // Active status is either local override or hook status
  const paymentStatus = customStatus || hookStatus;

  // Initiate checkout on mount
  useEffect(() => {
    const startCheckout = async () => {
      try {
        setLoading(true);
        const res = await api.post('/checkout/initiate');
        if (res.data.success) {
          setOrderData(res.data.data);
          setSessionToken(res.data.data.sessionToken);
        }
      } catch (err) {
        console.error('Checkout error:', err);
        const errMsg = err.response?.data?.message || 'Failed to start payment checkout session';
        toast.error(errMsg);
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    startCheckout();
  }, [navigate]);

  const handleSubmitTxn = async (submission) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/payment/submit-txn', submission);
      if (res.data.success) {
        toast.success('Transaction reference submitted successfully!');
        setTxnDetails({
          orderNumber: orderData.orderNumber,
          upiTxnId: submission.upiTxnId,
          upiApp: submission.upiApp
        });
        setCustomStatus('submitted');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit transaction proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCustomStatus('');
    // Re-trigger order initiate to get fresh links & new session if expired
    navigate(0);
  };

  // Sync clear cart on successful verification
  useEffect(() => {
    if (paymentStatus === 'verified') {
      clearCart();
      refreshCart();
    }
  }, [paymentStatus, clearCart, refreshCart]);

  if (loading) {
    return <CosmicLoader />;
  }

  if (!orderData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center select-none">
        <h2 className="text-xl font-bold text-text-primary">No Active Checkout Session</h2>
        <p className="text-xs text-text-muted mt-2">Please add items to your cart and proceed again.</p>
        <button 
          onClick={() => navigate('/cart')} 
          className="mt-6 px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-bg-base min-h-screen text-text-primary select-none">
      
      {/* Back button */}
      {paymentStatus === 'pending' && (
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors font-semibold mb-6 font-mono"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>BACK TO CART</span>
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Order Ledger & Purchased Item List */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-6 bg-bg-card border border-border-base shadow-sm">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-text-primary border-b border-border-base pb-3.5 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-brand-orange" />
              <span>Checkout Ledger</span>
            </h3>

            {/* Items List */}
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {orderData.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-3 rounded-xl border border-border-base bg-bg-base/30 hover:border-brand-primary/10 transition-colors">
                  <div className="h-12 w-10 sm:h-14 sm:w-12 rounded-lg bg-gradient-to-tr from-brand-primary/10 to-brand-orange/10 border border-border-base flex items-center justify-center shrink-0">
                    <span className="text-lg">{item.itemType === 'course' ? '🎓' : '📚'}</span>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-primary-light text-brand-primary block w-fit">
                      {item.itemType === 'course' ? 'COURSE' : 'NOTEBOOK'}
                    </span>
                    <h4 className="text-[11px] font-extrabold text-text-primary line-clamp-1 leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-text-muted">₹{item.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Ledger */}
            <div className="border-t border-border-base/50 pt-4 mt-4 space-y-2.5 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-text-muted">Cart Subtotal</span>
                <span className="text-text-primary">₹{orderData.breakdown.subtotal.toFixed(2)}</span>
              </div>
              {orderData.breakdown.discount > 0 && (
                <div className="flex justify-between text-green-500 font-bold">
                  <span>Applied Discount</span>
                  <span>-₹{orderData.breakdown.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Regulatory GST (18%)</span>
                <span className="text-text-primary">₹{orderData.breakdown.gst.toFixed(2)}</span>
              </div>
              <div className="border-t border-border-base/50 pt-2.5 mt-2 flex justify-between text-xs font-bold font-display text-text-primary">
                <span>Final Bill Total</span>
                <span className="text-brand-orange">₹{orderData.breakdown.total.toFixed(2)}</span>
              </div>
            </div>

            {/* SSL checkout verification badge */}
            <div className="mt-5 text-center p-3 border border-border-base bg-bg-base/30 rounded-xl text-[9px] font-mono text-text-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              <span>UPI Self-Hosted Ledger Encrypted</span>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Step-by-Step Payment Gateway Screen */}
        <div className="lg:col-span-7">
          {paymentStatus === 'pending' && (
            <PaymentModal 
              orderData={orderData} 
              onSubmitTxn={handleSubmitTxn}
              isSubmitting={isSubmitting} 
            />
          )}

          {paymentStatus === 'submitted' && (
            <VerificationWaiting 
              txnDetails={txnDetails || { orderNumber: orderData.orderNumber, upiTxnId: '', upiApp: 'UPI' }} 
            />
          )}

          {paymentStatus === 'verified' && (
            <PaymentSuccess 
              receiptUrl={receiptUrl} 
              orderNumber={orderData.orderNumber} 
            />
          )}

          {(paymentStatus === 'failed' || paymentStatus === 'expired') && (
            <PaymentFailed
              status={paymentStatus}
              rejectionReason={rejectionReason}
              onRetry={handleRetry} 
            />
          )}
        </div>

      </div>
    </div>
  );
}
