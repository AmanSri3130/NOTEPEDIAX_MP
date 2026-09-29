import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import useCart from '../../hooks/useCart';

export default function CartDropdown({ onClose }) {
  const navigate = useNavigate();
  const { items, totalAmount, removeFromCart } = useCart();

  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  const handleGoToCart = () => {
    navigate('/cart');
    onClose();
  };

  const hasItems = items && items.length > 0;

  return (
    <div className="w-80 origin-top-right rounded-2xl border border-brand-border bg-white dark:bg-brand-card p-4 shadow-xl z-50 animate-scaleIn select-none space-y-4">
      <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
        <h4 className="font-display text-xs font-extrabold text-brand-text uppercase flex items-center gap-1.5">
          <ShoppingBag className="h-4 w-4 text-brand-orange" />
          <span>Cart Items</span>
        </h4>
        <button
          onClick={handleGoToCart}
          className="text-[9px] font-mono font-bold text-brand-primary hover:underline"
        >
          View Full Cart
        </button>
      </div>

      {!hasItems ? (
        <div className="text-center py-6">
          <span className="text-2xl block mb-1">🛒</span>
          <p className="text-[10px] text-brand-muted font-semibold">Your cart is currently empty</p>
        </div>
      ) : (
        <>
          {/* Quick-list scroll container */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div 
                key={item.itemId} 
                className="flex items-center justify-between gap-3 p-2 rounded-xl bg-brand-base border border-brand-border/40 hover:border-brand-primary/20 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-7 rounded-lg bg-gradient-to-tr from-brand-primary/10 to-brand-orange/10 border border-brand-border/50 flex items-center justify-center shrink-0">
                    <span className="text-xs">{item.itemType === 'course' ? '🎓' : '📚'}</span>
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h5 className="text-[10px] font-extrabold text-brand-text truncate leading-tight">
                      {item.title}
                    </h5>
                    <span className="text-[9px] font-mono text-brand-orange font-bold">₹{item.price}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.itemId)}
                  className="p-1.5 rounded-lg text-brand-muted hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                  title="Remove Item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick ledger block */}
          <div className="border-t border-brand-border/60 pt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono text-brand-muted font-bold uppercase">Estimated Bill Total</span>
            <span className="text-xs font-display font-black text-brand-text">₹{totalAmount.toFixed(2)}</span>
          </div>

          {/* Buttons block */}
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px]">
            <button
              onClick={handleGoToCart}
              className="py-2.5 rounded-xl border border-brand-border hover:bg-brand-base text-brand-text font-bold uppercase tracking-wider"
            >
              Open Cart
            </button>
            <button
              onClick={handleCheckout}
              className="py-2.5 rounded-xl bg-brand-orange text-white font-bold uppercase tracking-wider flex items-center justify-center gap-1 border-transparent hover:bg-brand-orange/95 shadow-sm shadow-brand-orange/20"
            >
              <span>Checkout</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
