import React from 'react';
import GlowButton from '../ui/GlowButton';
import CouponInput from './CouponInput';
import { ShieldCheck } from 'lucide-react';

export default function OrderSummary({ 
  subtotal, 
  discountAmount, 
  gstAmount, 
  totalAmount, 
  coupon, 
  onApplyCoupon, 
  onRemoveCoupon, 
  onProceed, 
  isProceedLoading, 
  showProceed = true 
}) {
  return (
    <div className="space-y-5">
      <div className="bg-brand-base/30 border border-brand-border rounded-2xl p-5 space-y-3 font-mono text-xs">
        <h3 className="font-display text-sm font-extrabold text-brand-text border-b border-brand-border pb-3 mb-2 uppercase">
          Order Ledger Summary
        </h3>

        <div className="flex justify-between">
          <span className="text-brand-muted">Items Subtotal</span>
          <span className="text-brand-text">₹{subtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-brand-green font-bold">
            <span>Coupon Discount</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-brand-muted">Regulatory GST (18%)</span>
          <span className="text-brand-text">₹{gstAmount.toFixed(2)}</span>
        </div>

        <div className="border-t border-brand-border pt-3 mt-3 flex justify-between font-bold text-sm text-brand-text font-display">
          <span>Final Total Due</span>
          <span className="text-brand-orange">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Coupon area */}
      {showProceed && (
        <CouponInput
          appliedCoupon={coupon}
          onApply={onApplyCoupon}
          onRemove={onRemoveCoupon}
          isLoading={isProceedLoading}
        />
      )}

      {showProceed && (
        <div className="space-y-3 pt-2">
          <GlowButton
            variant="primary"
            onClick={onProceed}
            disabled={isProceedLoading}
            className="w-full text-xs font-bold py-3 uppercase tracking-wider bg-brand-orange border-transparent flex justify-center items-center gap-2"
          >
            {isProceedLoading ? 'Processing Checkout...' : 'Proceed to Checkout →'}
          </GlowButton>
          
          <div className="text-center p-3 border border-brand-border rounded-2xl bg-brand-base/40 text-[9px] font-mono text-brand-dim flex items-center justify-center gap-1.5 select-none">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
            <span>Secure self-hosted UPI channel enabled</span>
          </div>
        </div>
      )}
    </div>
  );
}
