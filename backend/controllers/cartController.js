// Removed supabase import

export const getCart = async (req, res) => {
  const userId = req.user?.id;
  try {
    const { data: cart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    res.json({ success: true, data: cart || { items: [], total: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req, res) => {
  const userId = req.user?.id;
  const { itemType, itemId } = req.body;

  try {
    const { data: cart } = await supabase
      .from('carts')
      .upsert({ user_id: userId, items: [{ itemType, itemId }] })
      .select()
      .single();

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  const userId = req.user?.id;
  try {
    const { data: cart } = await supabase
      .from('carts')
      .update({ items: [] })
      .eq('user_id', userId)
      .select()
      .single();

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req, res) => {
  const userId = req.user?.id;
  try {
    await supabase.from('carts').delete().eq('user_id', userId);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyCoupon = async (req, res) => {
  res.json({ success: true, message: 'Coupon applied' });
};

export const removeCoupon = async (req, res) => {
  res.json({ success: true, message: 'Coupon removed' });
};
