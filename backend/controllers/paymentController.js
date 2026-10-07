// Removed supabase import

export const processPayment = async (req, res) => {
  const userId = req.user?.id;
  const { orderId, transactionId, upiVpa, paymentMethod } = req.body;

  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([{
        order_id: orderId,
        transaction_id: transactionId || `TXN-${Date.now()}`,
        upi_vpa: upiVpa,
        payment_method: paymentMethod || 'upi',
        status: 'paid',
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitTransaction = async (req, res) => {
  res.json({ success: true, message: 'Transaction submitted successfully' });
};

export const getPaymentStatus = async (req, res) => {
  res.json({ success: true, status: 'paid' });
};

export const getQrCodeFallback = async (req, res) => {
  res.json({ success: true, qrCode: 'sample-qr-data' });
};
