import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2, ArrowRight } from 'lucide-react';
import useCart from '../hooks/useCart';
import CartItemRow from '../components/cart/CartItemRow';
import OrderSummary from '../components/cart/OrderSummary';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    items, 
    coupon, 
    subtotal, 
    discountAmount, 
    gstAmount, 
    totalAmount, 
    isLoading,
    removeFromCart, 
    applyCoupon, 
    removeCoupon, 
    clearCart 
  } = useCart();

  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (code) => {
    setApplying(true);
    try {
      await applyCoupon(code).unwrap();
    } catch (err) {
      // toast notification handled inside slice
    } finally {
      setApplying(false);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const hasItems = items && items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-bg-base min-h-screen text-text-primary select-none">
      
      {/* Header section */}
      <div className="border-b border-border-base pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-text-primary flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-brand-orange animate-pulse" />
            <span>My Shopping Cart</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Review and adjust courses & study materials selected for unlock
          </p>
        </div>
        {hasItems && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 hover:text-red-500 hover:underline px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            <span>CLEAR ALL ITEMS</span>
          </button>
        )}
      </div>

      {!hasItems ? (
        <div className="text-center py-20 max-w-md mx-auto border border-border-base bg-bg-card rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-[60px] pointer-events-none" />
          <ShoppingBag className="h-16 w-16 text-text-faint mx-auto animate-bounce" />
          <div className="space-y-2">
            <h3 className="font-display text-lg font-bold text-text-primary">Your Cart is Empty</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Explore our masterclasses and high-yield study materials uploaded by rankers to start filling your catalog.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <GlowButton
              variant="secondary"
              onClick={() => navigate('/courses')}
              className="w-full text-xs font-bold py-3 uppercase tracking-wider border-border-base bg-bg-card text-text-primary flex justify-center items-center gap-1.5"
            >
              <span>Browse Courses</span>
            </GlowButton>
            <GlowButton
              variant="primary"
              onClick={() => navigate('/notes')}
              className="w-full text-xs font-bold py-3 uppercase tracking-wider bg-brand-orange border-transparent flex justify-center items-center gap-1.5 text-white"
            >
              <span>Explore Study Notes</span>
              <ArrowRight className="h-4 w-4" />
            </GlowButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart items list - left column */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <CartItemRow 
                key={item.itemId} 
                item={item} 
                onRemove={removeFromCart} 
              />
            ))}
            
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors font-bold mt-6 font-mono"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>CONTINUE SHOPPING</span>
            </button>
          </div>

          {/* Pricing Ledger summary - right column */}
          <div className="lg:col-span-4">
            <GlassCard className="p-6 border border-border-base bg-bg-card shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-[60px]" />
              <OrderSummary
                subtotal={subtotal}
                discountAmount={discountAmount}
                gstAmount={gstAmount}
                totalAmount={totalAmount}
                coupon={coupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={removeCoupon}
                onProceed={handleProceedToCheckout}
                isProceedLoading={isLoading || applying}
              />
            </GlassCard>
          </div>

        </div>
      )}
    </div>
  );
}
