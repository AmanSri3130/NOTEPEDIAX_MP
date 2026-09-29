import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertCircle, Search, RefreshCw, Check, X, ShieldAlert, 
  TrendingUp, Clock, FileCheck, Ban, Sparkles, MessageSquare 
} from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import GlowButton from '../../components/ui/GlowButton';
import CosmicLoader from '../../components/animations/CosmicLoader';

export default function AdminPayments() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores orderId currently being processed
  const [search, setSearch] = useState('');
  
  // Rejection modal state
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Load pending list & daily statistics
  const loadAdminData = async () => {
    try {
      const statsRes = await api.get('/admin/payments/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const listRes = await api.get('/admin/payments');
      if (listRes.data.success) {
        setPendingPayments(listRes.data.data);
      }
    } catch (err) {
      console.error('Error loading admin payments:', err);
      toast.error('Failed to load transaction audit queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();

    // Setup Socket.io for live updates
    let socket = null;
    try {
      socket = io('http://localhost:5000');
      
      socket.on('new_payment_to_verify', (data) => {
        console.log('Realtime new payment notification received:', data);
        toast(`New payment audit submitted for order #${data.orderNumber}!`, { 
          icon: '📥',
          duration: 4000 
        });
        loadAdminData(); // Refresh list and stats
      });
    } catch (err) {
      console.warn('Admin socket listener failed:', err.message);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleApprove = async (orderId) => {
    setActionLoading(orderId);
    try {
      const res = await api.post(`/admin/payments/${orderId}/verify`, {
        action: 'approve'
      });
      if (res.data.success) {
        toast.success('Transaction approved! Invoice generated and items unlocked.');
        loadAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenReject = (orderId) => {
    setRejectOrderId(orderId);
    setRejectionReason('');
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please specify a reason for transaction rejection.');
      return;
    }

    setActionLoading(rejectOrderId);
    const orderIdToReject = rejectOrderId;
    setRejectOrderId(null); // Close modal

    try {
      const res = await api.post(`/admin/payments/${orderIdToReject}/verify`, {
        action: 'reject',
        rejectionReason: rejectionReason.trim()
      });
      if (res.data.success) {
        toast.error('Transaction rejected. Notification pushed to student.');
        loadAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = pendingPayments.filter(order => {
    const term = search.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(term) ||
      order.payment.studentUpiTxnId.toLowerCase().includes(term) ||
      order.student.name.toLowerCase().includes(term) ||
      order.student.email.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <CosmicLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-bg-base min-h-screen text-text-primary select-none">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border-base pb-6 mb-8 gap-4">
        <div>
          <span className="text-[10px] font-mono text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Audit Gateway Dashboard</span>
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-text-primary mt-3 flex items-center gap-2">
            UPI Verification Queue
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Review, verify settlements, and approve manual transaction proof logs
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            loadAdminData();
          }}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-text-muted hover:text-text-primary px-3 py-2 rounded-xl border border-border-base bg-bg-card hover:bg-bg-base transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>REFRESH QUEUE</span>
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4 bg-bg-card border border-border-base flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-muted block uppercase tracking-wider font-bold">Pending Audits</span>
              <span className="text-lg font-display font-black text-text-primary">{stats.pendingCount} orders</span>
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-bg-card border border-border-base flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-muted block uppercase tracking-wider font-bold">Today's Revenue</span>
              <span className="text-lg font-display font-black text-green-500">₹{stats.todayRevenue.toFixed(0)}</span>
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-bg-card border border-border-base flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-muted block uppercase tracking-wider font-bold">Weekly Revenue</span>
              <span className="text-lg font-display font-black text-blue-400">₹{stats.weeklyRevenue.toFixed(0)}</span>
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-bg-card border border-border-base flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-text-muted block uppercase tracking-wider font-bold">Success Audits</span>
              <span className="text-lg font-display font-black text-purple-400">
                {stats.breakdown.verified} / {stats.totalOrders}
              </span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Audit Queue section */}
      <GlassCard className="p-6 bg-bg-card border border-border-base shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-base/50 pb-5 mb-5">
          <h3 className="font-display text-sm font-extrabold text-text-primary uppercase flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-brand" />
            <span>FIFO Action Verification Table</span>
          </h3>

          {/* Search audit logs bar */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search TXN ID, student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border-base bg-bg-base py-2 pl-9 pr-3 text-xs outline-none focus:border-border-strong text-text-primary placeholder:text-text-faint shadow-inner font-mono font-bold"
            />
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <ShieldCheck className="h-10 w-10 text-green-500 mx-auto animate-pulse" />
            <h4 className="text-sm font-bold text-text-primary">All Settled Up!</h4>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              There are no pending manual payment references left in the FIFO verification queue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border-base">
            <table className="min-w-full divide-y divide-border-base font-mono text-[10px] text-left">
              <thead className="bg-bg-base text-text-muted uppercase tracking-wider font-extrabold border-b border-border-base">
                <tr>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">Order Info</th>
                  <th className="px-5 py-3.5">Submitted TXN Proof</th>
                  <th className="px-5 py-3.5">Amount Due</th>
                  <th className="px-5 py-3.5">Age in Queue</th>
                  <th className="px-5 py-3.5 text-right">Verification Audit Actions</th>
                </tr>
              </thead>
              <tbody className="bg-bg-card divide-y divide-border-base/40 text-text-primary">
                {filteredPayments.map((order) => {
                  const isProcessing = actionLoading === order._id;
                  const queueAge = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                  
                  return (
                    <tr key={order._id} className="hover:bg-bg-base/20 transition-colors">
                      {/* Student details */}
                      <td className="px-5 py-4 space-y-0.5">
                        <span className="font-bold text-xs text-text-primary block font-body">{order.student?.name}</span>
                        <span className="text-[9px] text-text-muted block">{order.student?.email}</span>
                      </td>

                      {/* Order info */}
                      <td className="px-5 py-4 space-y-0.5">
                        <span className="font-extrabold text-brand-orange block">#{order.orderNumber}</span>
                        <span className="text-[9px] text-text-muted block">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Submitted TXN proof */}
                      <td className="px-5 py-4 space-y-0.5">
                        <span className="font-bold tracking-widest text-text-primary uppercase block bg-bg-base border border-border-base/50 px-2 py-1 rounded w-fit text-[9px]">
                          {order.payment?.studentUpiTxnId}
                        </span>
                        <span className="text-[9px] text-text-muted block font-semibold">
                          Via: <span className="uppercase text-text-primary font-bold">{order.payment?.studentUpiApp}</span>
                        </span>
                      </td>

                      {/* Amount due */}
                      <td className="px-5 py-4 text-xs font-black text-text-primary">
                        ₹{order.totalAmount.toFixed(2)}
                      </td>

                      {/* Queue age */}
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          queueAge > 15 
                            ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/20' 
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}>
                          {queueAge} mins ago
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            disabled={isProcessing}
                            onClick={() => handleApprove(order._id)}
                            className="p-2.5 rounded-xl bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 hover:border-transparent transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                            title="Approve Settlement"
                          >
                            <Check className="h-4 w-4" />
                            <span className="text-[9px] font-bold uppercase">Approve</span>
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => handleOpenReject(order._id)}
                            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                            title="Reject Proof"
                          >
                            <X className="h-4 w-4" />
                            <span className="text-[9px] font-bold uppercase">Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Rejection comment prompt modal */}
      {rejectOrderId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <GlassCard className="max-w-md w-full p-6 border border-border-base bg-bg-card shadow-2xl relative overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border-base pb-3 mb-4">
              <Ban className="h-5 w-5 text-red-500" />
              <h3 className="font-display text-sm font-extrabold text-text-primary uppercase">
                Reject Payment Reference
              </h3>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block font-bold">
                  Specify Rejection Reason (Required)
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Transaction settlement mismatch or transaction reference has already been used."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className="w-full bg-bg-base border border-border-base rounded-2xl px-4 py-3 text-xs text-text-primary outline-none focus:border-border-strong focus:ring-1 focus:ring-border-focus font-body shadow-inner leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setRejectOrderId(null)}
                  className="px-4 py-2.5 rounded-xl border border-border-base bg-bg-card hover:bg-bg-base font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold uppercase flex items-center gap-1 border-transparent hover:bg-red-600 transition-colors"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Submit Rejection</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
