import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, Play, ChevronDown, ChevronUp, Clock, BookOpen,
  FileText, Award, ShieldCheck, Sparkles, User, ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GlowButton from '../components/ui/GlowButton';
import GlassCard from '../components/ui/GlassCard';
import api from '../utils/api';
import toast from 'react-hot-toast';
import useCart from '../hooks/useCart';

export default function CourseDetail() {
  const { id } = useParams(); // 'id' contains the course slug
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const [addingToCartState, setAddingToCartState] = useState(false);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${id}`);
        if (res.data.success) {
          setCourse(res.data.data);
          
          // Check enrollment if logged in
          if (user) {
            try {
              setCheckingEnrollment(true);
              const enrollRes = await api.get(`/enrollments/${res.data.data._id}/status`);
              if (enrollRes.data.success) {
                setEnrolled(enrollRes.data.enrolled);
              }
            } catch (err) {
              console.error('Error checking enrollment status:', err);
            } finally {
              setCheckingEnrollment(false);
            }
          } else {
            setCheckingEnrollment(false);
          }
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error fetching course:', error);
        }
        setCourse(null);
        setCheckingEnrollment(false);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetail();
    }
  }, [id, user]);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // Handle free course enrollment directly
  const handleEnrollFree = async () => {
    try {
      setCheckingEnrollment(true);
      const res = await api.post('/enrollments/free', { courseId: course._id });
      if (res.data.success) {
        toast.success('Successfully enrolled in free course! 🎓');
        setEnrolled(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setCheckingEnrollment(false);
    }
  };

  // Add course to shopping cart
  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    
    setAddingToCartState(true);
    try {
      await addToCart(course._id, 'course').unwrap();
    } catch {
      // errors handled by thunk/toast
    } finally {
      setAddingToCartState(false);
    }
  };

  // Buy course directly (adds to cart and goes to checkout)
  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please log in to purchase courses');
      navigate('/login');
      return;
    }

    setAddingToCartState(true);
    try {
      await addToCart(course._id, 'course').unwrap();
      navigate('/checkout');
    } catch (err) {
      // If already in cart, just proceed to checkout
      if (err.includes('already in your cart')) {
        navigate('/checkout');
      }
    } finally {
      setAddingToCartState(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-base flex flex-col items-center justify-center text-brand-text">
        <div className="h-10 w-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-mono text-xs text-brand-muted">Retrieving course curriculum details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-brand-base flex flex-col items-center justify-center text-brand-text">
        <p className="font-mono text-xs text-brand-orange">Syllabus catalog record not found.</p>
        <Link to="/courses" className="mt-4 text-xs font-bold text-brand-primary">Back to Catalog</Link>
      </div>
    );
  }

  const isPaid = course.price > 0;
  const originalPrice = course.mrp || course.original || (course.price * 2);
  const discountPercent = originalPrice > 0
    ? Math.round(((originalPrice - course.price) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-brand-base min-h-screen text-brand-text py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Return button */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link to="/courses" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses Catalogue
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Heading, Chapters, Instructor Bio */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Block */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-mono bg-brand-primary-light dark:bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Interactive Syllabus
              </span>
              <span className="text-[10px] font-mono bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Live Support
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-brand-text">
              {course.title}
            </h1>
            <p className="text-sm sm:text-base text-brand-muted leading-relaxed max-w-3xl">
              {course.shortDescription || course.subtitle || course.description}
            </p>

            {/* Micro rating stats row */}
            <div className="flex items-center gap-4 text-xs font-semibold text-brand-muted border-b border-brand-border pb-6">
              <div className="flex items-center gap-1">
                {(course.rating?.count || 0) > 0 && <Star className="h-4 w-4 fill-current text-brand-yellow" />}
                <span className="text-brand-text font-bold">
                  {(course.rating?.count || 0) > 0 ? course.rating.average : 'Not rated yet'}
                </span>
                <span>({course.enrolledCount || 0} Students Enrolled)</span>
              </div>
              <span className="text-brand-border">|</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-brand-primary" />
                <span>{course.totalDuration ? `${Math.round(course.totalDuration / 60)}h` : '32h'} content</span>
              </div>
            </div>
          </div>

          {/* Curriculum Accordion */}
          <div className="space-y-4">
            <h2 className="font-display text-lg sm:text-xl text-brand-text flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand-primary" />
              Course Curriculum
            </h2>

            <div className="space-y-3">
              {course.chapters && course.chapters.map((chap, idx) => (
                <div 
                  key={chap._id || idx} 
                  className="rounded-2xl border border-brand-border bg-brand-card dark:bg-brand-card overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-display text-sm sm:text-base font-bold text-brand-text hover:bg-brand-primary-light/40 dark:hover:bg-brand-card/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 px-2 py-0.5 rounded">
                        0{idx + 1}
                      </span>
                      <span>{chap.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-brand-muted font-normal">
                      <span>{chap.duration || `${chap.lessons?.length || 0} lessons`}</span>
                      {activeAccordion === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeAccordion === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="border-t border-brand-border px-5 py-4 space-y-3 bg-brand-base/40">
                          {chap.lessons && chap.lessons.map ? (
                            chap.lessons.map((lec, lIdx) => (
                              <div key={lec._id || lIdx} className="flex items-center justify-between text-xs sm:text-sm text-brand-muted py-1 border-b border-brand-border/40 last:border-b-0 last:pb-0">
                                <div className="flex items-center gap-2">
                                  <Play className="h-3.5 w-3.5 text-brand-primary" />
                                  <span>{lec.title || lec}</span>
                                </div>
                                <span className="text-[10px] font-mono text-brand-dim">
                                  {lec.type === 'live' ? 'Live Class' : `${lec.duration || 15} mins`}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-brand-muted">No lessons in this chapter yet.</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Profile Details */}
          {course.instructor && (
            <div className="space-y-4 pt-4 border-t border-brand-border">
              <h2 className="font-display text-lg sm:text-xl text-brand-text flex items-center gap-2">
                <User className="h-5 w-5 text-brand-orange" />
                Your Lead Instructor
              </h2>

              <GlassCard className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-orange flex items-center justify-center text-white shrink-0 text-3xl font-display shadow-md">
                  {course.instructor.name?.split(' ').pop()?.[0] || 'T'}
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="font-display text-base font-bold text-brand-text">{course.instructor.name}</h3>
                  <span className="text-xs font-semibold text-brand-primary block">{course.instructor.title || 'Instructor'}</span>
                  <p className="text-xs text-brand-muted leading-relaxed max-w-xl">
                    {course.instructor.bio || 'Course instructor.'}
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-mono text-brand-dim pt-2">
                    <span>🎓 Trained {course.instructor.students || '0'} Students</span>
                    <span>⭐ {course.instructor.rating ? `Rated ${course.instructor.rating} Avg` : 'Not rated yet'}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Billing Sidecard */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          <GlassCard className="p-6 border-2 border-brand-primary/20 dark:border-brand-primary/10 shadow-lg relative overflow-hidden bg-brand-card">
            
            {/* Shimmer element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full filter blur-3xl pointer-events-none" />

            <div className="h-44 rounded-2xl bg-gradient-to-tr from-brand-primary/10 to-brand-orange/10 border border-brand-border flex items-center justify-center relative overflow-hidden group">
              <button 
                onClick={() => setPreviewOpen(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <div className="h-14 w-14 rounded-full bg-brand-orange flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-all">
                  <Play className="h-6 w-6 fill-current text-white ml-0.5" />
                </div>
              </button>
              <span className="absolute bottom-3 left-3 bg-brand-base/90 text-[10px] font-mono text-brand-orange px-2.5 py-1 rounded-full border border-brand-border font-bold">
                PLAY TRIAL PREVIEW
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-extrabold text-brand-text">₹{course.price}</span>
                {originalPrice > course.price && (
                  <>
                    <span className="text-sm text-brand-muted line-through">₹{originalPrice}</span>
                    <span className="text-xs font-bold text-brand-green font-mono bg-brand-green/10 px-2 py-0.5 rounded">
                      {discountPercent}% Off
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-brand-muted">
                {isPaid ? 'One-time enrollment payment. Lifetime access, syllabus revisions included.' : 'Get instant, full curriculum access at no cost.'}
              </p>

              <div className="space-y-2 pt-2">
                {checkingEnrollment ? (
                  <button className="w-full bg-brand-border text-brand-muted text-xs font-bold py-3 rounded-xl cursor-not-allowed" disabled>
                    Checking Status...
                  </button>
                ) : enrolled ? (
                  <Link to={`/courses/${id}/player`} className="block w-full">
                    <GlowButton variant="primary" className="w-full text-xs font-bold py-3 uppercase tracking-wider bg-brand-primary border-transparent">
                      Go to Course Player
                    </GlowButton>
                  </Link>
                ) : !isPaid ? (
                  <button 
                    onClick={handleEnrollFree}
                    className="w-full rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-3 text-xs font-bold transition-all shadow-sm uppercase tracking-wider"
                  >
                    Enroll in Free Course
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <button 
                      onClick={handleBuyNow}
                      disabled={addingToCartState}
                      className="w-full rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-3 text-xs font-bold transition-all shadow-sm uppercase tracking-wider disabled:opacity-50"
                    >
                      Buy Course Now
                    </button>
                    <button 
                      onClick={handleAddToCart}
                      disabled={addingToCartState}
                      className="w-full border border-brand-border text-xs font-bold text-brand-text hover:bg-brand-primary-light/50 dark:hover:bg-brand-card/40 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                )}
 
                <button 
                  onClick={() => setPreviewOpen(true)}
                  className="w-full border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-primary-light/50 dark:hover:bg-brand-card/40 py-2.5 rounded-xl transition-colors"
                >
                  Start Demo Class
                </button>
              </div>

              <div className="border-t border-brand-border pt-4 space-y-2.5">
                <span className="text-[10px] font-mono text-brand-dim uppercase tracking-wider block font-bold">Course Inclusions:</span>
                
                <div className="space-y-2">
                  {[
                    { text: 'HD Chapters Syllabus', icon: Clock },
                    { text: `${course.totalLessons || 24} Interactive Lectures`, icon: Play },
                    { text: 'Revision PDF Books', icon: FileText },
                    { text: 'Rank Prediction Tests', icon: Award },
                    { text: 'Ask-Doubt AI assistant', icon: Sparkles },
                    { text: 'Final Course Certificate', icon: ShieldCheck }
                  ].map((inc, iIdx) => {
                    const Icon = inc.icon;
                    return (
                      <div key={iIdx} className="flex items-center gap-2.5 text-xs text-brand-muted">
                        <Icon className="h-4 w-4 text-brand-primary shrink-0" />
                        <span>{inc.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </GlassCard>

          {/* Secure details card */}
          <div className="text-center p-4 border border-brand-border rounded-2xl bg-brand-base/40 text-[10px] font-mono text-brand-dim flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand-green" />
            <span>Secured Checkout &bull; 100% Refund guarantee</span>
          </div>

        </div>

      </div>

      {/* Preview Player Modal Drawer */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-3xl rounded-3xl border border-brand-border bg-brand-card dark:bg-brand-card shadow-2xl overflow-hidden p-6 relative"
            >
              <div className="flex justify-between items-center border-b border-brand-border pb-3 mb-4">
                <h3 className="font-display text-sm sm:text-base font-bold text-brand-text">Demo Preview: {course.title}</h3>
                <button 
                  onClick={() => setPreviewOpen(false)}
                  className="text-xs font-bold font-mono text-brand-muted hover:text-brand-text bg-brand-base/80 px-3 py-1.5 rounded-xl border border-brand-border"
                >
                  Close Video
                </button>
              </div>

              {/* Video Player Frame */}
              <div className="aspect-video bg-slate-950 rounded-2xl border border-brand-border flex flex-col justify-between p-4 relative group overflow-hidden">
                {course.previewVideoUrl ? (
                  <video 
                    src={course.previewVideoUrl} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    controls 
                    autoPlay
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-tr from-brand-primary/20 via-slate-900 to-brand-orange/5 text-slate-200">
                    <Play className="h-14 w-14 text-white fill-current animate-pulse opacity-90 cursor-pointer" />
                    <p className="mt-2 text-xs font-mono">Simulating Course Preview Lecture Feed...</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <p className="text-brand-muted">
                  Enrolling unlocks full high definition lectures and instant chapter test sheets.
                </p>
                <button 
                  onClick={() => {
                    setPreviewOpen(false);
                    if (course.price === 0) {
                      handleEnrollFree();
                    } else {
                      handleBuyNow();
                    }
                  }}
                  className="rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white px-4 py-2.5 text-[10px] font-bold"
                >
                  Unlock Lectures
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
