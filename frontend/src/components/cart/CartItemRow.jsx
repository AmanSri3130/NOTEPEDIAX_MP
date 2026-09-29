import React from 'react';
import { Trash2 } from 'lucide-react';

export default function CartItemRow({ item, onRemove }) {
  const isCourse = item.itemType === 'course';
  const discountPercent = Math.round(((item.mrp - item.price) / item.mrp) * 100);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-brand-border bg-brand-card hover:border-brand-primary/20 transition-all">
      <div className="flex items-center gap-4">
        {/* Thumbnail representation */}
        <div className="h-16 w-12 sm:h-20 sm:w-16 rounded-xl bg-gradient-to-tr from-brand-primary/10 to-brand-orange/10 border border-brand-border flex items-center justify-center shrink-0 shadow-inner">
          <span className="text-xl">{isCourse ? '🎓' : '📚'}</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded ${
              isCourse ? 'bg-brand-primary-light text-brand-primary' : 'bg-brand-orange/10 text-brand-orange'
            }`}>
              {isCourse ? 'MASTERCLASS' : 'STUDY BOOK'}
            </span>
          </div>
          
          <h3 className="font-display text-xs sm:text-sm font-bold text-brand-text line-clamp-2 leading-snug">
            {item.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto shrink-0 gap-6 border-t border-brand-border/40 pt-3 sm:border-t-0 sm:pt-0">
        <div className="flex flex-col text-left sm:text-right">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-sm sm:text-base font-extrabold text-brand-text">₹{item.price}</span>
            {item.mrp > item.price && (
              <>
                <span className="text-xs text-brand-muted line-through">₹{item.mrp}</span>
                <span className="text-[10px] font-mono font-bold text-brand-green bg-brand-green/10 px-1.5 py-0.2 rounded">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => onRemove(item.itemId)}
          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-sm"
          title="Remove from Cart"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
