import React, { useState } from 'react';
import { Percent, Check, Loader, X } from 'lucide-react';

export default function CouponInput({ appliedCoupon, onApply, onRemove, isLoading }) {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || isLoading) return;
    onApply(code.trim().toUpperCase());
    setCode('');
  };

  return (
    <div className="space-y-3 pt-3 border-t border-brand-border/40">
      <span className="text-[10px] font-mono text-brand-dim uppercase tracking-wider block font-bold">
        DISCOUNT COUPON
      </span>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-brand-green/10 border border-brand-green/20 rounded-xl px-4 py-2.5 text-xs text-brand-green font-semibold">
          <div className="flex items-center gap-1.5 font-mono">
            <Check className="h-4 w-4" />
            <span>CODE: {appliedCoupon.code} Applied</span>
          </div>
          <button 
            onClick={onRemove}
            className="text-brand-muted hover:text-red-500 font-bold p-1 transition-colors"
            title="Remove Coupon"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter coupon (e.g. OFF50, FLAT200)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading}
            className="w-full bg-brand-base border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-primary placeholder:text-brand-muted uppercase font-mono font-bold"
          />
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl px-4 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
          >
            {isLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Percent className="h-3.5 w-3.5" />}
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
