import React from 'react';
import { XCircle, HelpCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlowButton from '../../components/ui/GlowButton';

export default function PaymentFailed({ rejectionReason, onRetry }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto bg-bg-card border border-border-base rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden select-none">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Failure indicator */}
      <div className="h-16 w-16 mx-auto bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center shadow-lg">
        <XCircle className="h-9 w-9 text-red-500" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono text-red-500 bg-red-500/10 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
          Transaction Verification Rejected
        </span>
        <h2 className="font-display text-2xl font-black text-text-primary mt-2">
          Payment Verification Failed
        </h2>
        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
          The transaction proof submitted did not match our system logs or bank settlements.
        </p>
      </div>

      {/* Rejection comment display */}
      <div className="bg-red-500/[0.03] border border-red-500/15 rounded-2xl p-5 text-left font-mono max-w-md mx-auto space-y-2 shadow-inner">
        <span className="text-[8px] text-red-400 font-extrabold uppercase tracking-wider block">
          Auditor Comment / Rejection Reason:
        </span>
        <p className="text-xs text-text-primary font-semibold italic">
          "{rejectionReason || 'No comment provided by administrator. Please verify that the transaction ID matches the successful payment in your UPI app.'}"
        </p>
      </div>

      {/* Retry controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
        <GlowButton
          variant="secondary"
          onClick={() => navigate('/courses')}
          className="w-full text-xs font-bold py-3 uppercase tracking-wider border-border-base bg-bg-card hover:bg-border-base text-text-primary flex justify-center items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </GlowButton>
        <GlowButton
          variant="primary"
          onClick={onRetry}
          className="w-full text-xs font-bold py-3 uppercase tracking-wider bg-brand-primary border-transparent flex justify-center items-center gap-1.5 text-white"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>Retry Payment</span>
        </GlowButton>
      </div>

      <div className="text-center p-3 border border-border-base rounded-2xl bg-bg-base/40 text-[9px] font-mono text-text-muted flex items-center justify-center gap-1.5 max-w-md mx-auto">
        <HelpCircle className="h-4 w-4 text-brand-primary" />
        <span>Need assistance? Email billing support at help@notepediax.com</span>
      </div>
    </div>
  );
}
