import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, BadgeInfo, Cpu } from 'lucide-react';

export default function VerificationWaiting({ txnDetails }) {
  const { orderNumber, upiTxnId, upiApp } = txnDetails;

  const [messageIndex, setMessageIndex] = useState(0);

  const loadingMessages = [
    'Awaiting confirmation from bank gateway...',
    'Matching transaction ID with settlement logs...',
    'Auditors verifying payment reference proof...',
    'Please do not close this browser tab...',
    'Confirming instant course & note enrollment access...',
    'Syncing workspace credentials...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-xl mx-auto bg-bg-card border border-border-base rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Pulsing Radar Ring */}
      <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-brand-primary/10 animate-ping duration-1000" />
        <div className="absolute inset-2 rounded-full border-2 border-brand-accent/20 animate-ping duration-1500" />
        <div className="h-16 w-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center shadow-lg relative">
          <Loader2 className="h-7 w-7 text-brand animate-spin" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-lg font-extrabold text-text-primary">
          Verifying Your Payment
        </h2>
        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed h-10 flex items-center justify-center transition-all duration-300">
          {loadingMessages[messageIndex]}
        </p>
      </div>

      {/* Transaction Details Ledger */}
      <div className="bg-bg-base border border-border-base rounded-2xl p-4 text-left font-mono text-[10px] space-y-2.5 max-w-md mx-auto shadow-inner">
        <div className="flex justify-between border-b border-border-base/50 pb-2">
          <span className="text-text-muted">Order Number:</span>
          <span className="text-text-primary font-bold">{orderNumber}</span>
        </div>
        <div className="flex justify-between border-b border-border-base/50 pb-2">
          <span className="text-text-muted">Payment VPA:</span>
          <span className="text-text-primary font-bold">notepediax@paytm</span>
        </div>
        <div className="flex justify-between border-b border-border-base/50 pb-2">
          <span className="text-text-muted">UPI Channel App:</span>
          <span className="text-text-primary font-bold uppercase">{upiApp}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Submitted TXN ID:</span>
          <span className="text-brand-orange font-bold uppercase tracking-wider">{upiTxnId}</span>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-2.5 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 text-left text-[10px] text-yellow-500/80 leading-relaxed font-mono max-w-md mx-auto">
        <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block mb-0.5 uppercase tracking-wide">Anti-Fraud Protection Protocol</span>
          Our auditors manually inspect submissions in the background. Uploading dummy, modified, or repeated transaction numbers is strictly audited and leads to account suspension.
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-text-faint/60">
        <Cpu className="h-3.5 w-3.5" />
        <span>Real-time Socket.io active | Webhooks polling listening...</span>
      </div>
    </div>
  );
}
