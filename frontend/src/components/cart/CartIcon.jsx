import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import CartDropdown from './CartDropdown';

export default function CartIcon() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    navigate('/cart');
    setIsOpen(false);
  };

  return (
    <div 
      className="relative z-40 select-none"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={handleClick}
        className="p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-primary-light transition-colors relative cursor-pointer active:scale-95 flex items-center justify-center border border-transparent hover:border-brand-border/40 shadow-sm"
        aria-label="Shopping Cart"
      >
        <ShoppingBag className="h-4.5 w-4.5" />
        
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[9px] font-bold text-white shadow-md animate-scaleIn font-mono">
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Quicklook Dropdown Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2">
          <CartDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
