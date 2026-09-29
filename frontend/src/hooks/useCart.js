import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCart, 
  addToCart, 
  removeFromCart, 
  applyCoupon, 
  removeCoupon, 
  clearCart 
} from '../store/cartSlice';
import { useAuth } from '../context/AuthContext';

export default function useCart() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const cartState = useSelector((state) => state.cart);

  // Auto-fetch cart on mount if user is logged in
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  return {
    ...cartState,
    addToCart: (itemId, itemType) => dispatch(addToCart({ itemId, itemType })),
    removeFromCart: (itemId) => dispatch(removeFromCart(itemId)),
    applyCoupon: (code) => dispatch(applyCoupon(code)),
    removeCoupon: () => dispatch(removeCoupon()),
    clearCart: () => dispatch(clearCart()),
    refreshCart: () => dispatch(fetchCart())
  };
}
