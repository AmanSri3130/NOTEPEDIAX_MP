import supabase from '../config/supabase.js';

export const getPaymentStats = async (req, res) => {
  try {
    const { count: totalOrders } = await supabase.from('orders').select('count', { count: 'exact', head: true });
    const { count: paidOrders } = await supabase.from('orders').select('count', { count: 'exact', head: true }).eq('status', 'paid');
    
    res.json({
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        paidOrders: paidOrders || 0,
        totalRevenue: paidOrders ? paidOrders * 499 : 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentsStats = getPaymentStats;

export const getAllTransactions = async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('orders')
      .select('*, users(name, email, phone)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: transactions || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingPayments = async (req, res) => {
  try {
    const { data: pending } = await supabase.from('orders').select('*').eq('status', 'pending');
    res.json({ success: true, data: pending || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAdminPayment = async (req, res) => {
  res.json({ success: true, message: 'Payment verified by admin' });
};

export const approvePayment = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectPayment = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  const userId = req.user?.id;
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true, data: orders || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderDetail = async (req, res) => {
  const { orderNumber } = req.params;
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderNumber)
      .maybeSingle();

    if (error) throw error;
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCouponAdmin = async (req, res) => {
  res.json({ success: true, message: 'Coupon created' });
};

export const getCouponsAdmin = async (req, res) => {
  res.json({ success: true, data: [] });
};
