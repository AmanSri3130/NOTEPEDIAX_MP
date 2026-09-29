import React, { useEffect } from 'react';
import { CheckCircle2, Download, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import GlowButton from '../../components/ui/GlowButton';

export default function PaymentSuccess({ receiptUrl, orderNumber }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire confetti on mount
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a855f7', '#f97316', '#3b82f6']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a855f7', '#f97316', '#3b82f6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const handleDownloadInvoice = () => {
    if (!receiptUrl) return;
    
    // Open receipt in new tab or trigger download
    const fullUrl = `http://localhost:5000${receiptUrl}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto bg-bg-card border border-border-base rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden select-none">
      {/* Background decoration elements */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-green-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-brand-primary/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Success Animation Circle */}
      <div className="h-16 w-16 mx-auto bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center shadow-lg animate-bounce">
        <CheckCircle2 className="h-9 w-9 text-green-500" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono text-green-500 bg-green-500/10 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
          Transaction Verified
        </span>
        <h2 className="font-display text-2xl font-black text-text-primary mt-2">
          Payment Successful!
        </h2>
        <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
          Your payment references were verified successfully. Your purchased courses and study notes are now unlocked.
        </p>
      </div>

      {/* Invoice details section */}
      {receiptUrl && (
        <div className="bg-bg-base border border-border-base rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-md mx-auto shadow-inner">
          <div className="text-left font-mono space-y-0.5">
            <span className="text-[8px] text-text-muted uppercase tracking-wider block font-bold">
              PDF TAX INVOICE
            </span>
            <span className="text-[10px] text-text-primary font-bold">
              Invoice #{orderNumber}
            </span>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-[10px] font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm border-transparent"
          >
            <Download className="h-4 w-4" />
            <span>Download Invoice PDF</span>
          </button>
        </div>
      )}

      {/* Dashboard navigation buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
        <GlowButton
          variant="secondary"
          onClick={() => navigate('/dashboard')}
          className="w-full text-xs font-bold py-3 uppercase tracking-wider border-border-base bg-bg-card hover:bg-border-base text-text-primary flex justify-center items-center gap-1.5"
        >
          <Home className="h-4 w-4" />
          <span>Student Dashboard</span>
        </GlowButton>
        <GlowButton
          variant="primary"
          onClick={() => navigate('/courses')}
          className="w-full text-xs font-bold py-3 uppercase tracking-wider bg-brand-orange border-transparent flex justify-center items-center gap-1.5 text-white"
        >
          <span>Start Learning</span>
          <ArrowRight className="h-4 w-4" />
        </GlowButton>
      </div>

      <div className="text-center p-3 border border-border-base rounded-2xl bg-bg-base/40 text-[9px] font-mono text-text-muted flex items-center justify-center gap-1.5 max-w-md mx-auto">
        <ShieldCheck className="h-4 w-4 text-green-500" />
        <span>Secured self-hosted ledger verified session audit</span>
      </div>
    </div>
  );
}
