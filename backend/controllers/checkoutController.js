// Removed supabase import

export const initiateCheckout = async (req, res) => {
  const userId = req.user?.id;
  const { amount, itemType, itemId } = req.body;

  try {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        order_id: orderId,
        user_id: userId,
        item_type: itemType || 'course',
        item_id: itemId || userId,
        amount: amount || 499,
        status: 'created',
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessionDetails = async (req, res) => {
  const { sessionToken } = req.params;
  res.json({ success: true, data: { sessionToken, amount: 499, currency: 'INR' } });
};
