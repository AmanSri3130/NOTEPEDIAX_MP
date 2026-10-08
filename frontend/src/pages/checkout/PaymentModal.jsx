import { useState, useEffect } from 'react';
import { 
  Copy, Check, QrCode, Loader, AlertTriangle, Clock, ArrowRight, ShieldCheck
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function PaymentModal({ orderData, onSubmitTxn, isSubmitting }) {
  const { 
    orderNumber, 
    sessionToken, 
    amount, 
    expiresAt, 
    deepLinks, 
    isMobile,
    upiVpa,
  } = orderData;

  const [copied, setCopied] = useState(false);
  const [selectedApp, setSelectedApp] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [loadingQr, setLoadingQr] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds default
  const [qrError, setQrError] = useState('');

  // Session expiry countdown
  useEffect(() => {
    const expireTime = new Date(expiresAt).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const difference = expireTime - now;
      
      if (difference <= 0) {
        setTimeLeft(0);
        return;
      }
      
      setTimeLeft(Math.floor(difference / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'EXPIRED';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopied(true);
    toast.success('UPI VPA copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFetchQr = async () => {
    if (showQr) {
      setShowQr(false);
      return;
    }
    
    setLoadingQr(true);
    setQrError('');
    try {
      const res = await api.get(`/payment/qr/${sessionToken}`);
      if (res.data.success) {
        setQrCodeData(res.data.qrCode);
        setShowQr(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate QR Code. Rate limit reached?';
      setQrError(msg);
      toast.error(msg);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleAppSelect = (appName, deepLink) => {
    setSelectedApp(appName);
    toast(`Opening ${appName}...`, { icon: '📲' });
    
    // Copy VPA to clipboard automatically for convenient entry
    navigator.clipboard.writeText(upiVpa).catch(() => {});
    
    // Open deep link
    window.location.assign(deepLink);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      toast.error('Payment session has expired. Please restart checkout.');
      return;
    }
    if (!selectedApp) {
      toast.error('Please select the UPI app you used to pay.');
      return;
    }
    if (!upiTxnId.trim()) {
      toast.error('Please enter the 12 to 15 digit UPI Transaction ID.');
      return;
    }
    
    const txnIdClean = upiTxnId.trim();
    const txnIdRegex = /^[A-Za-z0-9]{12,15}$/;
    if (!txnIdRegex.test(txnIdClean)) {
      toast.error('Invalid Transaction ID format. Must be 12-15 alphanumeric digits.');
      return;
    }

    onSubmitTxn({
      sessionToken,
      upiTxnId: txnIdClean,
      upiApp: selectedApp
    });
  };

  const upiApps = [
    { name: 'Google Pay', icon: '⚡', key: 'gpay', color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-400' },
    { name: 'PhonePe', icon: '🟣', key: 'phonepe', color: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-400' },
    { name: 'Paytm', icon: '🔹', key: 'paytm', color: 'from-cyan-500/10 to-blue-600/10 border-cyan-500/20 text-cyan-400' },
    { name: 'BHIM UPI', icon: '🟢', key: 'bhim', color: 'from-green-500/10 to-emerald-500/10 border-green-500/20 text-emerald-400' },
    { name: 'Navi', icon: '🌟', key: 'navi', color: 'from-orange-500/10 to-yellow-500/10 border-orange-500/20 text-orange-400' }
  ];

  return (
    <div className="max-w-xl mx-auto bg-bg-card border border-border-base rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-brand-primary/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-brand-accent/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-base pb-4 mb-6">
        <div>
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block font-bold">
            Order ID: {orderNumber}
          </span>
          <h2 className="font-display text-lg font-extrabold text-text-primary mt-1">
            Pay with UPI Secure
          </h2>
        </div>
        <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all shadow-sm ${
          timeLeft <= 60 
            ? 'bg-red-500/10 border border-red-500/30 text-red-500 animate-pulse' 
            : 'bg-brand-orange-light/10 border border-brand/20 text-text-primary'
        }`}>
          <Clock className="h-4 w-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {timeLeft <= 0 ? (
        <div className="text-center py-10 space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h3 className="text-sm font-bold text-text-primary">Payment Session Expired</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            The 10-minute secure payment window for this checkout has closed. Please go back to the cart and initiate checkout again.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* VPA Copy Bar */}
          <div className="bg-bg-base border border-border-base rounded-2xl p-4 flex items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-text-muted font-bold block uppercase tracking-wider">
                PAYEE UPI ADDRESS (VPA)
              </span>
              <span className="font-mono text-xs font-extrabold text-text-primary tracking-wide">
                {upiVpa}
              </span>
            </div>
            <button
              onClick={copyToClipboard}
              className="p-2.5 rounded-xl bg-bg-card hover:bg-border-base border border-border-base text-text-muted hover:text-text-primary transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Copy VPA"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              <span className="text-[10px] font-bold uppercase font-mono">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Amount Due Big display */}
          <div className="text-center py-3">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block font-bold">
              Final Amount Payable
            </span>
            <div className="font-display text-3xl font-black text-brand-orange mt-1">
              ₹{amount.toFixed(2)}
            </div>
          </div>

          {/* UPI App Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block font-bold">
              {isMobile ? 'Select UPI App to Launch' : 'Select UPI App Used for Payment'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {upiApps.map((app) => {
                const isSelected = selectedApp === app.name;
                const link = deepLinks[app.key];
                return (
                  <button
                    key={app.key}
                    type="button"
                    onClick={() => handleAppSelect(app.name, link)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center relative group active:scale-95 bg-gradient-to-br ${app.color} ${
                      isSelected 
                        ? 'border-brand shadow-md scale-102 ring-2 ring-brand-subtle' 
                        : 'hover:border-border-strong hover:scale-101 border-border-base'
                    }`}
                  >
                    <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110">{app.icon}</span>
                    <span className="text-[10px] font-extrabold uppercase font-mono tracking-tight text-text-primary">
                      {app.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-primary animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop QR Fallback Trigger */}
          <div className="flex flex-col items-center justify-center border-t border-border-base/50 pt-4 mt-2">
            {!showQr ? (
              <button
                type="button"
                onClick={handleFetchQr}
                disabled={loadingQr}
                className="text-[10px] font-mono font-bold text-brand-hover hover:underline flex items-center gap-1.5 disabled:opacity-50"
              >
                {loadingQr ? (
                  <Loader className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <QrCode className="h-4.5 w-4.5" />
                )}
                <span>Need QR Code Fallback? Show Purple UPI QR</span>
              </button>
            ) : (
              <div className="w-full text-center space-y-3">
                <button
                  type="button"
                  onClick={() => setShowQr(false)}
                  className="text-[10px] font-mono font-bold text-red-400 hover:underline"
                >
                  Hide Fallback QR Code
                </button>
                
                <div className="mx-auto p-4 bg-purple-900/10 border-2 border-purple-500/20 rounded-2xl inline-block shadow-inner relative overflow-hidden group">
                  {/* Subtle rate limit alert */}
                  <img
                    src={qrCodeData}
                    alt="UPI Payment QR Code"
                    className="w-44 h-44 border border-purple-500/30 rounded-xl"
                  />
                  <div className="absolute inset-0 bg-purple-950/90 flex flex-col justify-center items-center p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <QrCode className="h-8 w-8 text-purple-400 mb-2" />
                    <span className="text-[8px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                      Scan with any UPI App
                    </span>
                    <span className="text-[7px] font-mono text-purple-400 mt-1">
                      Rate limited (3 scans/min)
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {qrError && (
              <p className="text-[10px] font-mono text-red-400 mt-2 font-semibold">
                ⚠️ {qrError}
              </p>
            )}
          </div>

          {/* Transaction Proof Submission Form */}
          <form onSubmit={handleSubmit} className="border-t border-border-base/50 pt-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label htmlFor="upiTxnId" className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold">
                  Enter UPI Transaction ID / UTR
                </label>
                <span className="text-[8px] font-mono text-text-muted uppercase">
                  (12-15 alphanumeric digits)
                </span>
              </div>
              <input
                id="upiTxnId"
                type="text"
                placeholder="e.g. 518392019482 or AXIS29402948"
                value={upiTxnId}
                onChange={(e) => setUpiTxnId(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                required
                className="w-full bg-bg-base border border-border-base rounded-2xl px-4 py-3 text-xs text-text-primary outline-none focus:border-border-strong focus:ring-1 focus:ring-border-focus font-mono font-bold tracking-widest shadow-inner placeholder:text-text-faint/60 placeholder:tracking-normal text-center uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !upiTxnId.trim() || !selectedApp || timeLeft <= 0}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white rounded-2xl py-3.5 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99] shadow-lg shadow-brand-primary/25 border-transparent"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Submitting Payment Proof...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Submit Payment Reference for Audit</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
