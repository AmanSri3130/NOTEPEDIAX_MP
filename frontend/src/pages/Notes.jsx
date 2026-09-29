import React, { useState, useEffect } from 'react';
import { 
  BookMarked, Search, Download, Check, RefreshCw, Eye, X, ChevronLeft, 
  ChevronRight, ZoomIn, ZoomOut, Lock, Sparkles, FileText, AlertCircle, ShoppingBag, Wallet, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';

export default function Notes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All'); // 'All' | 'free' | 'paid'
  const [addingNoteId, setAddingNoteId] = useState(null);
  
  const [notesList, setNotesList] = useState([]);
  const [myNotes, setMyNotes] = useState({ purchased: [], free: [] });
  const [loading, setLoading] = useState(true);
  
  const [downloadingId, setDownloadingId] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  
  // Checkout Modal State
  const [checkoutNote, setCheckoutNote] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(''); // 'gateway', 'verifying', 'success'

  // PDF Preview State
  const [previewNote, setPreviewNote] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Load E-Notes and My Purchases
  const loadNotesData = async () => {
    try {
      setLoading(true);
      
      // Build search queries
      const params = new URLSearchParams();
      if (boardFilter && boardFilter !== 'All') {
        params.append('board', boardFilter);
      }
      if (subjectFilter && subjectFilter !== 'All') {
        params.append('subject', subjectFilter);
      }
      if (priceFilter && priceFilter !== 'All') {
        params.append('price', priceFilter);
      }
      if (search) {
        params.append('search', search);
      }

      const res = await api.get(`/notes?${params.toString()}`);
      if (res.data.success) {
        setNotesList(res.data.data);
      }

      if (user) {
        const myNotesRes = await api.get('/notes/my/notes');
        if (myNotesRes.data.success) {
          setMyNotes(myNotesRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      toast.error('Failed to retrieve e-notes catalogue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotesData();
  }, [boardFilter, subjectFilter, priceFilter, search, user]);

  const isPurchased = (noteId) => {
    const purchasedIds = myNotes.purchased.map(n => n._id);
    const freeIds = myNotes.free.map(n => n._id);
    return purchasedIds.includes(noteId) || freeIds.includes(noteId);
  };

  // Trigger file download token request
  const handleDownload = async (note) => {
    if (!user) {
      toast.error('Please log in to download materials');
      navigate('/login');
      return;
    }

    try {
      setDownloadingId(note._id);
      const res = await api.get(`/notes/${note._id}/download`);
      if (res.data.success) {
        const token = res.data.downloadToken;
        toast.success(`Secure link generated. Downloading: ${note.title}...`);
        
        // Open download redirect in new window
        window.open(`http://localhost:5000/api/notes/download/${token}`, '_blank');
        
        // Refresh purchased lists
        const myNotesRes = await api.get('/notes/my/notes');
        if (myNotesRes.data.success) {
          setMyNotes(myNotesRes.data.data);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download authorization failed');
    } finally {
      setDownloadingId(null);
    }
  };

  // Add note to shopping cart
  const handleAddToCartClick = async (note) => {
    if (!user) {
      toast.error('Please log in to add materials to your cart');
      navigate('/login');
      return;
    }
    
    setAddingNoteId(note._id);
    try {
      await addToCart(note._id, 'note').unwrap();
    } catch (err) {
      // errors handled by thunk/toast
    } finally {
      setAddingNoteId(null);
    }
  };

  // Buy note immediately (adds to cart and goes directly to checkout)
  const handleBuyNowClick = async (note) => {
    if (!user) {
      toast.error('Please log in to purchase study notes');
      navigate('/login');
      return;
    }

    setAddingNoteId(note._id);
    try {
      await addToCart(note._id, 'note').unwrap();
      navigate('/checkout');
    } catch (err) {
      if (err.includes('already in your cart')) {
        navigate('/checkout');
      }
    } finally {
      setAddingNoteId(null);
    }
  };

  const subjects = ['All', 'Physics', 'Chemistry', 'Biology', 'Mathematics'];
  const boards = ['All', 'CBSE', 'ICSE', 'JEE', 'NEET'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-brand-base min-h-screen text-brand-text transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-[10px] font-mono text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
          HANDWRITTEN NOTEBOOKS & FORMULAS
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-text mt-3">
          Notes{' '}
          <span className="bg-gradient-to-r from-brand-primary via-brand-orange to-brand-primary bg-clip-text text-transparent">
            Library
          </span>
        </h1>
        <p className="text-brand-muted text-xs sm:text-sm mt-3 max-w-xl mx-auto leading-relaxed">
          Access high-yield handwritten chapters, formula summaries, and solved board questions uploaded by rankers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left board filters sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <GlassCard className="p-5 bg-brand-card shadow-sm border border-brand-border">
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-brand-text border-b border-brand-border pb-3 mb-4">
              Select Exam Board
            </h3>
            <div className="flex flex-col gap-1.5">
              {boards.map((board) => (
                <button
                  key={board}
                  onClick={() => setBoardFilter(board)}
                  className={`w-full text-left rounded-xl px-4 py-2.5 text-xs font-semibold border transition-all flex items-center justify-between ${
                    boardFilter === board 
                      ? 'border-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 text-brand-primary' 
                      : 'border-transparent text-brand-muted hover:bg-brand-base'
                  }`}
                >
                  <span>{board === 'All' ? 'All Boards' : `${board} Exam`}</span>
                  {boardFilter === board && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>

            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-brand-text border-b border-brand-border pb-3 mb-4 mt-6">
              Filter by Subject
            </h3>
            <div className="flex flex-col gap-1.5">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubjectFilter(sub)}
                  className={`w-full text-left rounded-xl px-4 py-2.5 text-xs font-semibold border transition-all flex items-center justify-between ${
                    subjectFilter === sub 
                      ? 'border-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 text-brand-primary' 
                      : 'border-transparent text-brand-muted hover:bg-brand-base'
                  }`}
                >
                  <span>{sub === 'All' ? 'All Subjects' : sub}</span>
                  {subjectFilter === sub && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>

            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-brand-text border-b border-brand-border pb-3 mb-4 mt-6">
              Pricing Options
            </h3>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'All', label: 'All Notes' },
                { id: 'free', label: 'Free Material Only' },
                { id: 'paid', label: 'Paid Premium Store' }
              ].map((priceOpt) => (
                <button
                  key={priceOpt.id}
                  onClick={() => setPriceFilter(priceOpt.id)}
                  className={`w-full text-left rounded-xl px-4 py-2.5 text-xs font-semibold border transition-all flex items-center justify-between ${
                    priceFilter === priceOpt.id
                      ? 'border-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 text-brand-primary'
                      : 'border-transparent text-brand-muted hover:bg-brand-base'
                  }`}
                >
                  <span>{priceOpt.label}</span>
                  {priceFilter === priceOpt.id && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>

          </GlassCard>
        </div>

        {/* Right notes catalog */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Search bar input */}
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-muted">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search subjects, chapters, or syllabus tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-brand-border bg-brand-card py-3 pl-10 pr-4 text-xs outline-none focus:border-brand-primary text-brand-text placeholder:text-brand-muted shadow-sm transition-all"
            />
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="text-center py-20">
              <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 font-mono text-xs text-brand-muted">Fetching books archive...</p>
            </div>
          ) : notesList.length === 0 ? (
            <div className="text-center py-20 border border-brand-border bg-brand-card rounded-2xl">
              <BookMarked className="h-10 w-10 text-brand-dim mx-auto" />
              <h3 className="font-display text-sm font-bold text-brand-text mt-3">No Notes Found</h3>
              <p className="text-xs text-brand-muted mt-1">Try resetting search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {notesList.map((note) => {
                const bought = isPurchased(note._id);
                const isPaid = note.price > 0;
                
                return (
                  <div
                    key={note._id}
                    onMouseEnter={() => setHoveredCardId(note._id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="relative"
                  >
                    {/* Flip Card container */}
                    <div className="perspective-[1000px] w-full h-[240px]">
                      <motion.div
                        animate={{ rotateY: hoveredCardId === note._id ? 180 : 0 }}
                        transition={{ duration: 0.4 }}
                        className="relative w-full h-full transform-style-3d"
                      >
                        
                        {/* Front Face */}
                        <div className={`absolute inset-0 backface-hidden rounded-2xl border border-brand-border border-t-4 ${
                          note.subject === 'Physics' ? 'border-t-brand-primary' :
                          note.subject === 'Chemistry' ? 'border-t-brand-orange' :
                          note.subject === 'Biology' ? 'border-t-brand-green' : 'border-t-brand-yellow'
                        } bg-brand-card p-5 flex flex-col justify-between shadow-sm`}>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] font-mono text-brand-primary font-bold">
                              <span>{note.subject?.toUpperCase()}</span>
                              <span>{note.class || 'Boards'}</span>
                            </div>
                            <h3 className="font-display text-sm sm:text-base font-bold text-brand-text leading-snug line-clamp-2">
                              {note.title}
                            </h3>
                            <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                              {note.description}
                            </p>
                          </div>

                          <div className="flex justify-between items-center border-t border-brand-border pt-3.5 text-[10px] font-mono text-brand-dim font-bold">
                            <span>{note.pageCount || 18} pages &bull; {note.downloadCount || 0} downloads</span>
                            <div className="flex items-center gap-1 text-brand-primary font-bold">
                              <Eye className="h-3.5 w-3.5" />
                              <span>Hover to flip</span>
                            </div>
                          </div>

                        </div>

                        {/* Back Face */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border border-brand-border bg-brand-card p-5 flex flex-col justify-between text-center shadow-md">
                          
                          <div className="space-y-2 flex flex-col items-center">
                            <div className="h-9 w-9 rounded-xl bg-brand-primary-light dark:bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <h4 className="font-display text-xs font-bold text-brand-text">
                              {isPaid ? `Premium Store Note (₹${note.price})` : 'Free Notes Archive'}
                            </h4>
                            <p className="text-[10px] text-brand-muted max-w-[200px] leading-relaxed">
                              {isPaid && !bought ? 'Upgrade this chapter set immediately to download or preview full worksheets.' : 'Instant unlock validated. Ready to download to local files.'}
                            </p>
                          </div>

                          <div className="flex justify-center gap-2 pt-2 border-t border-brand-border">
                            <button
                              onClick={() => { setPreviewNote(note); setPreviewPage(1); }}
                              className="flex items-center justify-center gap-1 rounded-xl border border-brand-border text-brand-text hover:bg-brand-base px-3 py-2 text-xs font-bold transition-all shadow-sm"
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </button>

                            {downloadingId === note._id ? (
                              <button className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary/50 text-white px-4 py-2 text-xs font-bold cursor-not-allowed" disabled>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Syncing...
                              </button>
                            ) : (!isPaid || bought) ? (
                              <button
                                onClick={() => handleDownload(note)}
                                className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-green text-white hover:bg-brand-green-dark px-4 py-2 text-xs font-bold shadow-sm cursor-pointer transition-colors"
                              >
                                <Download className="h-4 w-4" />
                                Download PDF
                              </button>
                            ) : (
                              <div className="flex gap-1.5 w-full">
                                <button
                                  onClick={() => handleBuyNowClick(note)}
                                  disabled={addingNoteId === note._id}
                                  className="flex-grow flex items-center justify-center gap-1 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white px-3 py-2 text-xs font-bold shadow-sm cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  Buy Note (₹{note.price})
                                </button>
                                <button
                                  onClick={() => handleAddToCartClick(note)}
                                  disabled={addingNoteId === note._id}
                                  className="p-2 rounded-xl bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white border border-brand-orange/20 transition-all flex items-center justify-center shrink-0 active:scale-95 disabled:opacity-50"
                                  title="Add to Cart"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>

                        </div>

                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* PDF Inline Preview Modal Drawer */}
      <AnimatePresence>
        {previewNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl rounded-3xl border border-brand-border bg-brand-card shadow-2xl overflow-hidden flex flex-col h-[600px]"
            >
              
              {/* PDF Toolbar */}
              <div className="p-4 border-b border-brand-border bg-brand-base/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-primary" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-brand-text line-clamp-1">{previewNote.title}</h3>
                    <span className="text-[9px] font-mono text-brand-dim uppercase tracking-wider block font-semibold">
                      DOCUMENT READ-ONLY WORKSPACE
                    </span>
                  </div>
                </div>

                {/* PDF controls */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 bg-brand-card border border-brand-border rounded-lg px-2 py-1 shadow-sm">
                    <button 
                      onClick={() => setPreviewPage((prev) => Math.max(1, prev - 1))}
                      disabled={previewPage === 1}
                      className="text-brand-muted hover:text-brand-text disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-mono text-brand-text text-[11px] font-bold">
                      Page {previewPage} / 2
                    </span>
                    <button 
                      onClick={() => setPreviewPage((prev) => Math.min(2, prev + 1))}
                      disabled={previewPage === 2}
                      className="text-brand-muted hover:text-brand-text disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 border-l border-brand-border pl-4">
                    <button 
                      onClick={() => setZoomLevel((prev) => Math.max(50, prev - 25))}
                      className="text-brand-muted hover:text-brand-text"
                    >
                      <ZoomOut className="h-4.5 w-4.5" />
                    </button>
                    <span className="font-mono text-[11px] text-brand-text w-10 text-center">{zoomLevel}%</span>
                    <button 
                      onClick={() => setZoomLevel((prev) => Math.min(150, prev + 25))}
                      className="text-brand-muted hover:text-brand-text"
                    >
                      <ZoomIn className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setPreviewNote(null)}
                  className="text-xs font-mono font-bold bg-brand-card border border-brand-border hover:bg-brand-base px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                >
                  Close Preview
                </button>
              </div>

              {/* PDF Content Canvas Frame */}
              <div className="flex-grow bg-brand-base p-6 overflow-y-auto flex justify-center items-start">
                
                <div 
                  className="w-full max-w-xl bg-white border border-brand-border shadow-sm rounded-xl p-8 transition-transform min-h-[350px] relative flex flex-col justify-between"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  
                  {/* Scanned/Handwritten Mock representation */}
                  {previewPage === 1 ? (
                    <div className="space-y-4 text-slate-800">
                      <div className="border-b-2 border-brand-primary/20 pb-2 flex justify-between items-center text-[10px] font-mono text-brand-primary">
                        <span>TOPIC: {previewNote.title.toUpperCase()}</span>
                        <span>PAGE 01</span>
                      </div>
                      <p className="font-serif text-sm leading-relaxed italic border-l-4 border-brand-primary/50 pl-3">
                        {previewNote.description}
                      </p>
                      <div className="space-y-2 pt-4">
                        <span className="font-mono text-[10px] text-brand-dim uppercase block">Study Syllabus Reference:</span>
                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-center font-mono text-xs font-bold text-slate-900 shadow-inner">
                          {previewNote.subject} &bull; {previewNote.class || 'All Classes'} &bull; {previewNote.board}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-slate-800">
                      <div className="border-b-2 border-brand-primary/20 pb-2 flex justify-between items-center text-[10px] font-mono text-brand-primary">
                        <span>TOPIC: SYLLABUS CORRELATIONS</span>
                        <span>PAGE 02</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600">
                        Check additional practice drill sheets. All diagrams represent standard curriculum mapping.
                      </p>
                      
                      {/* Blurred section representation */}
                      <div className="space-y-2 pt-4 relative">
                        <div className="blur-xs select-none space-y-2">
                          <div className="h-3 w-3/4 bg-slate-200 rounded" />
                          <div className="h-3 w-5/6 bg-slate-200 rounded" />
                          <div className="h-20 bg-slate-100 rounded border border-slate-200" />
                        </div>
                        
                        {/* Lock overlay banner */}
                        {previewNote.price > 0 && !isPurchased(previewNote._id) && (
                          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-brand-border">
                            <Lock className="h-6 w-6 text-brand-orange animate-bounce" />
                            <h4 className="font-display text-xs font-bold text-slate-900 mt-2">Remaining Pages Locked</h4>
                            <p className="text-[9px] text-slate-500 max-w-[180px] mt-1 leading-normal">
                              Purchase this book set from the library store to unlock download.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Document Footer sign */}
                  <div className="border-t border-slate-100 pt-4 mt-8 flex justify-between items-center text-[9px] font-mono text-slate-400">
                    <span>Notepediax Digital Reader v2.0</span>
                    <span>{previewNote.board} Syllabus Special</span>
                  </div>

                </div>

              </div>

              {/* Bottom Drawer Warning CTA */}
              <div className="p-4 bg-brand-orange-light border-t border-brand-orange/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-brand-orange text-xs">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>You are previewing a partial view of this book.</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isPurchased(previewNote._id) ? (
                    <button 
                      onClick={() => handleDownload(previewNote)}
                      className="flex items-center gap-1 rounded-xl bg-brand-green text-white px-4 py-2 text-xs font-bold shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Note
                    </button>
                  ) : previewNote.price === 0 ? (
                    <button 
                      onClick={() => handleDownload(previewNote)}
                      className="flex items-center gap-1 rounded-xl bg-brand-primary text-white px-4 py-2 text-xs font-bold shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Free Note
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPreviewNote(null);
                        handleOpenCheckout(previewNote);
                      }}
                      className="flex items-center gap-1 bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Buy full PDF (₹{previewNote.price})
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Checkout Modal */}
      <AnimatePresence>
        {checkoutNote && orderData && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-brand-card border border-brand-border rounded-3xl p-6 shadow-2xl relative text-brand-text overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-brand-primary" />
                  <span className="font-display font-extrabold text-sm sm:text-base">Unlock Study Material</span>
                </div>
                <button 
                  onClick={() => { setCheckoutNote(null); setOrderData(null); }}
                  className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text transition-colors bg-brand-base/50"
                  disabled={processingPayment}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {processingPayment ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-12 w-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin shadow-glow-orange"></div>
                  <p className="text-xs font-bold font-mono text-brand-text">
                    {paymentStep === 'gateway' && 'Connecting to secure notes merchant...'}
                    {paymentStep === 'verifying' && 'Recording purchase authorization code...'}
                    {paymentStep === 'success' && 'Transaction completed!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Notes summary */}
                  <div className="bg-brand-base/50 border border-brand-border p-3.5 rounded-2xl flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-brand-primary/20 to-brand-orange/20 border border-brand-border flex items-center justify-center text-brand-primary text-lg">
                      📚
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-text line-clamp-1">{checkoutNote.title}</h4>
                      <span className="text-[9px] font-mono text-brand-dim uppercase tracking-wide">{checkoutNote.subject} &bull; {checkoutNote.class}</span>
                    </div>
                  </div>

                  {/* Pricing ledger */}
                  <div className="bg-brand-base/30 border border-brand-border rounded-2xl p-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Item Subtotal</span>
                      <span className="text-brand-text">₹{checkoutNote.price}</span>
                    </div>
                    <div className="border-t border-brand-border pt-2 mt-2 flex justify-between font-bold text-sm text-brand-text">
                      <span className="font-display">Total Due</span>
                      <span className="text-brand-orange">₹{checkoutNote.price}</span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handleCheckoutSubmit}
                    className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-md mt-2"
                  >
                    Simulate Payment & Unlock Note
                  </button>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
