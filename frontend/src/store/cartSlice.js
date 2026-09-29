import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';
import toast from 'react-hot-toast';

const initialState = {
  items: [],
  coupon: null,
  subtotal: 0,
  discountAmount: 0,
  gstAmount: 0,
  totalAmount: 0,
  itemCount: 0,
  isLoading: false,
  error: null
};

// Helper to update state from backend response
const updateCartState = (state, responseData) => {
  const { cart, itemCount, subtotal, discount, gst, total } = responseData;
  state.items = cart.items || [];
  state.coupon = cart.coupon || null;
  state.subtotal = subtotal || 0;
  state.discountAmount = discount || 0;
  state.gstAmount = gst || 0;
  state.totalAmount = total || 0;
  state.itemCount = itemCount || 0;
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data.message);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ itemId, itemType }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post('/cart/add', { itemId, itemType });
      if (res.data.success) {
        toast.success('Added to cart! 🛒');
        dispatch(fetchCart());
        return res.data.data;
      }
      return rejectWithValue(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add to cart';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.delete(`/cart/remove/${itemId}`);
      if (res.data.success) {
        toast.success('Removed from cart');
        dispatch(fetchCart());
        return res.data.data;
      }
      return rejectWithValue(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not remove item';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post('/cart/apply-coupon', { code });
      if (res.data.success) {
        toast.success(`Coupon ${code.toUpperCase()} applied!`);
        dispatch(fetchCart());
        return res.data.data;
      }
      return rejectWithValue(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.delete('/cart/remove-coupon');
      if (res.data.success) {
        toast.success('Coupon removed');
        dispatch(fetchCart());
        return res.data.data;
      }
      return rejectWithValue(res.data.message);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not remove coupon');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.delete('/cart/clear');
      if (res.data.success) {
        dispatch(fetchCart());
        return res.data.data;
      }
      return rejectWithValue(res.data.message);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        updateCartState(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export default cartSlice.reducer;
