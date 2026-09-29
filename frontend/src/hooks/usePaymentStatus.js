import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function usePaymentStatus(sessionToken) {
  const { user } = useAuth();
  
  const [status, setStatus] = useState('pending'); // 'pending' | 'submitted' | 'verified' | 'failed' | 'expired'
  const [receiptUrl, setReceiptUrl] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!sessionToken) return;

    let pollInterval = null;
    let socket = null;

    // 1. Setup Socket.io connection
    try {
      socket = io('http://localhost:5000');
      
      if (user) {
        const userId = user._id;
        
        socket.on(`payment_verified_${userId}`, (data) => {
          console.log('Payment verified socket trigger received:', data);
          setStatus('verified');
          if (data.receiptUrl) setReceiptUrl(data.receiptUrl);
        });

        socket.on(`payment_rejected_${userId}`, (data) => {
          console.log('Payment rejected socket trigger received:', data);
          setStatus('failed');
          if (data.reason) setRejectionReason(data.reason);
        });
      }
    } catch (err) {
      console.warn('Socket client connection failed, falling back purely to polling:', err.message);
    }

    // 2. Setup Polling Fallback (Runs every 5 seconds)
    const checkStatus = async () => {
      try {
        const res = await api.get(`/payment/status/${sessionToken}`);
        if (res.data.success) {
          const s = res.data.status;
          
          if (s !== 'pending' && s !== 'submitted') {
            setStatus(s);
            if (s === 'verified' && socket) socket.disconnect();
            if (s === 'verified' && pollInterval) clearInterval(pollInterval);
          } else if (s === 'submitted') {
            setStatus('submitted');
          }
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    };

    // Initial check
    checkStatus();
    pollInterval = setInterval(checkStatus, 5000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (socket) socket.disconnect();
    };
  }, [sessionToken, user]);

  return {
    status,
    receiptUrl,
    rejectionReason
  };
}
