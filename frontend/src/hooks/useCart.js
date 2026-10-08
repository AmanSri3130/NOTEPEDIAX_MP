import { useCallback, useEffect } from 'react';
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

  const addCartItem = useCallback((itemId, itemType) => dispatch(addToCart({ itemId, itemType })), [dispatch]);
  const removeCartItem = useCallback((itemId) => dispatch(removeFromCart(itemId)), [dispatch]);
  const applyCartCoupon = useCallback((code) => dispatch(applyCoupon(code)), [dispatch]);
  const removeCartCoupon = useCallback(() => dispatch(removeCoupon()), [dispatch]);
  const emptyCart = useCallback(() => dispatch(clearCart()), [dispatch]);
  const refreshCart = useCallback(() => dispatch(fetchCart()), [dispatch]);

  return {
    ...cartState,
    addToCart: addCartItem,
    removeFromCart: removeCartItem,
    applyCoupon: applyCartCoupon,
    removeCoupon: removeCartCoupon,
    clearCart: emptyCart,
    refreshCart,
  };
}
