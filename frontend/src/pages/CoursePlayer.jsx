import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, CheckCircle2, Lock, Sparkles, MessageSquare, ChevronDown, 
  Settings, Maximize, Volume2, ArrowLeft, Send, Sparkle, Loader, CheckSquare, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CoursePlayer() {
  const { id } = useParams(); // 'id' contains the course slug
  const videoRef = useRef(null);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState(null);
  const [lessonProgressMap, setLessonProgressMap] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  
  // Celebration State
  const [showCelebration, setShowCelebration] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState('');

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'notes' | 'qa'
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hello! I am your AI Study Mentor. Paste any equation or doubt from this lecture for step-by-step guidance." }
  ]);

  // Load Course and Progress
  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseRes = await api.get(`/courses/${id}`);
      if (courseRes.data.success) {
        const courseData = courseRes.data.data;
        setCourse(courseData);

        // Fetch student progress for this course
        const progressRes = await api.get(`/dashboard/courses/${courseData._id}/progress`);
        if (progressRes.data.success) {
          const progData = progressRes.data.data.progress;
          setCourseProgress(progData);
          if (progData.isCompleted && progData.certificateUrl) {
            setCertificateUrl(progData.certificateUrl);
          }
          
          // Map lesson progresses
          const pMap = {};
          progressRes.data.data.lessonProgresses.forEach(lp => {
            pMap[lp.lesson] = lp;
          });
          setLessonProgressMap(pMap);

          // Find active lesson (first uncompleted, or first lesson)
          let foundActive = null;
          if (courseData.chapters && courseData.chapters.length > 0) {
            for (const chap of courseData.chapters) {
              if (chap.lessons && chap.lessons.length > 0) {
                for (const les of chap.lessons) {
                  if (!progData.completedLessons.includes(les._id)) {
                    foundActive = les;
                    break;
                  }
                }
              }
              if (foundActive) break;
            }
            // Fallback to the very first lesson
            if (!foundActive && courseData.chapters[0].lessons?.length > 0) {
              foundActive = courseData.chapters[0].lessons[0];
            }
          }
          setActiveLesson(foundActive);
        }
      }
    } catch (err) {
      console.error('Error loading course player data:', err);
      toast.error('Could not load course curriculum progress details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id]);

  // Periodic Progress Tracker (Syncs to server every 10 seconds)
  useEffect(() => {
    let interval = null;
    if (activeLesson && videoRef.current) {
      interval = setInterval(async () => {
        const video = videoRef.current;
        if (video && !video.paused && video.duration > 0) {
          try {
            const res = await api.post('/dashboard/progress/update', {
              lessonId: activeLesson._id,
              watchedDuration: Math.round(video.currentTime),
              totalDuration: Math.round(video.duration)
            });
            if (res.data.success) {
              // Update local state map
              setLessonProgressMap(prev => ({
                ...prev,
                [activeLesson._id]: res.data.data
              }));

              // If lesson just completed, show checkmark
              const wasCompletedBefore = courseProgress?.completedLessons.includes(activeLesson._id);
              if (res.data.data.isCompleted && !wasCompletedBefore) {
                toast.success(`Lecture completed! Earned +10 XP`);
                // Re-fetch course progress to update completion percentage
                const progressRes = await api.get(`/dashboard/courses/${course._id}/progress`);
                if (progressRes.data.success) {
                  const newProg = progressRes.data.data.progress;
                  setCourseProgress(newProg);
                  
                  // Check if course is 100% complete
                  if (newProg.completionPercent >= 100 && !newProg.isCompleted) {
                    handleCompleteCourse();
                  }
                }
              }
            }
          } catch (e) {
            console.error('Failed syncing playback watch progress:', e);
          }
        }
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeLesson, courseProgress]);

  // Handle manual complete lesson
  const handleManualComplete = async () => {
    if (!activeLesson) return;
    try {
      setUpdatingProgress(true);
      const res = await api.post('/dashboard/progress/complete-lesson', {
        lessonId: activeLesson._id
      });
      if (res.data.success) {
        toast.success('Lecture marked as completed! (+10 XP)');
        setLessonProgressMap(prev => ({
          ...prev,
          [activeLesson._id]: res.data.data
        }));

        const progressRes = await api.get(`/dashboard/courses/${course._id}/progress`);
        if (progressRes.data.success) {
          const newProg = progressRes.data.data.progress;
          setCourseProgress(newProg);
          
          if (newProg.completionPercent >= 100) {
            handleCompleteCourse();
          }
        }
      }
    } catch (err) {
      toast.error('Failed to complete lecture');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Complete course and generate certificate
  const handleCompleteCourse = async () => {
    try {
      setGeneratingCertificate(true);
      const res = await api.post(`/dashboard/courses/${course._id}/complete`);
      if (res.data.success) {
        setCertificateUrl(res.data.certificateUrl);
        setShowCelebration(true);
      }
    } catch (err) {
      console.error('Error generating course certificate:', err);
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Responsive AI replies
    setTimeout(() => {
      let reply = `Based on the lecture, in substitution reactions, SN1 involves a carbocation intermediate while SN2 occurs in a single concerted step.`;
      if (activeLesson?.title.toLowerCase().includes('stereochemistry') || activeLesson?.title.toLowerCase().includes('chiral')) {
        reply = `Chiral centers require 4 different groups attached to a tetrahedral carbon. R/S nomenclature is determined via Cahn-Ingold-Prelog priority rules.`;
      }
      setChatMessages((prev) => [...prev, { 
        role: 'ai', 
        text: reply
      }]);
    }, 1000);
  };

  const selectLesson = (lesson) => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveLesson(lesson);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-base flex flex-col items-center justify-center text-cosmic-text">
        <div className="h-10 w-10 border-4 border-cosmic-cyan border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-mono text-xs text-cosmic-muted">Opening course player stream console...</p>
      </div>
    );
  }

  if (!course || !activeLesson) {
    return (
      <div className="min-h-screen bg-cosmic-base flex flex-col items-center justify-center text-cosmic-text">
        <p className="font-mono text-xs text-brand-orange">Curriculum content could not be located.</p>
        <Link to="/courses" className="mt-4 text-xs font-bold text-cosmic-cyan">Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="bg-cosmic-base min-h-screen text-cosmic-text relative flex flex-col">
      
      {/* Top Header bar */}
      <div className="border-b border-cosmic-border bg-cosmic-surface/40 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-cosmic-muted hover:text-cosmic-text transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="text-[10px] font-mono text-cosmic-cyan tracking-wider uppercase">{course.category} Syllabus Masterclass</span>
            <h1 className="text-sm font-semibold text-cosmic-text leading-snug">{course.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {courseProgress?.completionPercent >= 100 && (
            <button
              onClick={() => setShowCelebration(true)}
              className="flex items-center gap-1.5 rounded-full bg-brand-green/15 text-brand-green border border-brand-green/25 px-4 py-1.5 text-xs font-semibold hover:bg-brand-green/20 transition-all cursor-pointer shadow-glow-green"
            >
              <Award className="h-4 w-4" />
              View Certificate
            </button>
          )}

          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="flex items-center gap-1.5 rounded-full bg-cosmic-pink/15 text-cosmic-pink border border-cosmic-pink/25 px-4 py-1.5 text-xs font-semibold hover:bg-cosmic-pink/20 transition-all cursor-pointer shadow-glow-pink"
          >
            <Sparkles className="h-4 w-4 text-cosmic-pink animate-pulse" />
            Ask Study AI
          </button>
        </div>
      </div>

      {/* Main player layout */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 items-stretch h-full overflow-hidden">
        
        {/* Left Video Player + Tabs */}
        <div className="lg:col-span-8 p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Custom Video Player mock */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-cosmic-border bg-slate-950 flex items-center justify-center text-slate-400 shadow-glow-sm group">
            {activeLesson.videoUrl ? (
              <video 
                ref={videoRef}
                src={activeLesson.videoUrl} 
                className="absolute inset-0 w-full h-full object-contain" 
                controls 
                autoPlay
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Sparkle className="h-12 w-12 text-cosmic-cyan animate-pulse" />
                <p className="font-mono text-xs text-cosmic-muted">Live Interactive class. Countdowns schedule details from dashboard.</p>
              </div>
            )}
          </div>

          {/* Video completion actions */}
          <div className="flex justify-between items-center bg-cosmic-surface/10 border border-cosmic-border/60 rounded-2xl p-4">
            <div>
              <h3 className="text-xs font-bold text-cosmic-text">{activeLesson.title}</h3>
              <span className="text-[10px] text-cosmic-muted font-mono">Status: {courseProgress?.completedLessons.includes(activeLesson._id) ? 'Completed' : 'In Progress'}</span>
            </div>
            {!courseProgress?.completedLessons.includes(activeLesson._id) && (
              <button
                onClick={handleManualComplete}
                disabled={updatingProgress}
                className="flex items-center gap-1.5 rounded-xl bg-cosmic-cyan/15 text-cosmic-cyan border border-cosmic-cyan/25 px-4 py-2 text-xs font-bold hover:bg-cosmic-cyan/20 transition-all disabled:opacity-50"
              >
                {updatingProgress ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <CheckSquare className="h-3.5 w-3.5" />}
                Mark Lecture Completed
              </button>
            )}
          </div>

          {/* Lower Tabs selector */}
          <div className="space-y-4">
            <div className="flex gap-1 border-b border-cosmic-border pb-2">
              {[
                { id: 'summary', title: 'AI Summary' },
                { id: 'notes', title: 'Chapter Notes' },
                { id: 'qa', title: 'Class Q&A' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 text-xs font-semibold relative transition-all cursor-pointer ${
                    activeTab === tab.id ? 'text-cosmic-cyan font-bold' : 'text-cosmic-muted hover:text-cosmic-text'
                  }`}
                >
                  {tab.title}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabUnderline" 
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-cosmic-cyan rounded-full shadow-glow-cyan" 
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-cosmic-border bg-cosmic-surface/25 p-5 text-sm text-cosmic-text/80 leading-relaxed min-h-[140px]">
              {activeTab === 'summary' && (
                <div className="space-y-3 font-mono text-xs">
                  <span className="text-cosmic-cyan font-bold block">// AUTO-GENERATED STUDY NOTES METRICS</span>
                  <p>&bull; This syllabus unit tracks reaction speeds, structural models, and exam questions.</p>
                  <p>&bull; Use the interactive Doubt solver assistant on the right panel to resolve specific formulas.</p>
                  <p>&bull; Keep the video playing to automatically record completion scores to the dashboard heatmap.</p>
                </div>
              )}
              {activeTab === 'notes' && (
                <p className="text-xs">Chapters notes are downloadable from the e-notes portal as high resolution PDFs. Free access is unlocked for enrolled academic masterclass candidates.</p>
              )}
              {activeTab === 'qa' && (
                <p className="text-xs">Have doubts about formulas? Join the upcoming live class or type your exact doubt details into the Ask Study AI module above.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Playlist Sidebar */}
        <div className="lg:col-span-4 border-l border-cosmic-border p-6 space-y-6 bg-cosmic-surface/20 overflow-y-auto">
          <div className="flex justify-between items-center border-b border-cosmic-border pb-3">
            <h3 className="font-display text-sm text-cosmic-text">Syllabus Chapters</h3>
            <span className="text-xs font-mono text-cosmic-cyan font-bold">{courseProgress?.completionPercent || 0}% Done</span>
          </div>
          
          <div className="space-y-4">
            {course.chapters && course.chapters.map((chap, chapIdx) => (
              <div key={chap._id || chapIdx} className="space-y-2.5">
                <span className="text-[10px] font-mono text-cosmic-muted uppercase tracking-wider block font-bold">
                  {chap.title}
                </span>

                <div className="space-y-2">
                  {chap.lessons && chap.lessons.map((item, idx) => {
                    const isCompleted = courseProgress?.completedLessons.includes(item._id);
                    const isActive = activeLesson._id === item._id;
                    const lp = lessonProgressMap[item._id];
                    let progressPercent = 0;
                    if (lp) {
                      progressPercent = lp.completionPercent;
                    }
                    
                    return (
                      <button
                        key={item._id || idx}
                        onClick={() => selectLesson(item)}
                        className={`w-full text-left rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all relative overflow-hidden ${
                          isActive 
                            ? 'border-cosmic-cyan bg-cosmic-cyan/5 shadow-glow-cyan' 
                            : 'border-cosmic-border bg-cosmic-base/60'
                        }`}
                      >
                        {/* Progress Bar background overlay */}
                        {progressPercent > 0 && !isCompleted && (
                          <div 
                            className="absolute bottom-0 left-0 h-1 bg-cosmic-cyan/35 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        )}

                        <div className="space-y-1 z-10">
                          <h4 className={`text-xs font-semibold leading-normal ${isActive ? 'text-cosmic-cyan font-bold' : 'text-cosmic-text'}`}>
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-cosmic-muted font-mono">
                            {item.type === 'live' ? 'Live Interactive Class' : `${item.duration || 15} minutes`}
                          </span>
                        </div>

                        <div className="shrink-0 z-10">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-cosmic-cyan" />
                          ) : isActive ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-cosmic-cyan animate-ping block" />
                          ) : (
                            <Play className="h-4 w-4 text-slate-400 fill-current" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating AI Drawer overlay */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 w-80 cosmic-glass border-l border-cosmic-border z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-4 border-b border-cosmic-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cosmic-pink animate-pulse" />
                <span className="text-xs font-bold text-cosmic-text uppercase tracking-wider font-mono">Doubt Assistant</span>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-cosmic-muted hover:text-cosmic-text text-xs font-semibold"
              >
                Close
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl p-3 text-xs max-w-[85%] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cosmic-indigo text-white rounded-tr-none shadow-glow-sm' 
                      : 'bg-cosmic-base border border-cosmic-border text-cosmic-text rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-cosmic-border flex gap-2">
              <input
                type="text"
                placeholder="Ask class query..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full rounded-xl bg-cosmic-base border border-cosmic-border px-3 py-2 text-xs outline-none text-cosmic-text focus:border-cosmic-cyan"
              />
              <button 
                type="submit"
                className="rounded-xl bg-cosmic-pink p-2.5 text-white hover:bg-pink-700 transition-colors"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Completion Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-brand-card border-2 border-brand-primary/30 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden shadow-2xl"
            >
              {/* Confetti Ambient Light */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 via-transparent to-brand-orange/10 pointer-events-none" />

              <div className="h-20 w-20 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto text-brand-primary border border-brand-primary/25 shadow-glow-cyan animate-bounce">
                <Award className="h-10 w-10 text-brand-primary" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Syllabus Mastered
                </span>
                <h2 className="font-display text-2xl font-extrabold text-white">Congratulations! 🎉</h2>
                <p className="text-xs text-brand-muted max-w-md mx-auto leading-relaxed">
                  You have successfully watched all lecture chapters and completed the curriculum for <span className="font-semibold text-brand-text">"{course.title}"</span>!
                </p>
              </div>

              {/* Certificate Download Badge */}
              <div className="border border-brand-border bg-brand-base/40 rounded-2xl p-5 space-y-4">
                <div className="aspect-[1.4/1] bg-slate-900 border border-brand-border rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-4 border border-brand-primary/20 flex flex-col justify-between p-4 text-center">
                    <span className="text-[8px] font-mono text-brand-dim uppercase tracking-wider">CERTIFICATE OF MASTERCLASS COMPLETION</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-white font-display">{user?.name}</h4>
                      <p className="text-[6px] text-brand-muted mt-0.5">Has finalized {course.title} curriculum.</p>
                    </div>
                    <span className="text-[5px] font-mono text-brand-dim">&bull; Authorized by Notepediax Academic Council &bull;</span>
                  </div>
                </div>

                {certificateUrl ? (
                  <a 
                    href={certificateUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block w-full"
                  >
                    <GlowButton variant="primary" className="w-full text-xs font-bold py-3 uppercase bg-brand-orange border-transparent">
                      Download PDF Certificate
                    </GlowButton>
                  </a>
                ) : (
                  <button 
                    onClick={handleCompleteCourse}
                    className="w-full bg-brand-orange text-white rounded-xl py-3 text-xs font-bold uppercase disabled:opacity-50"
                    disabled={generatingCertificate}
                  >
                    {generatingCertificate ? 'Generating Secure PDF...' : 'Re-Generate Certificate'}
                  </button>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCelebration(false)}
                  className="border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-base px-5 py-2.5 rounded-xl transition-colors"
                >
                  Return to Class Player
                </button>
                <Link to="/dashboard" className="rounded-xl bg-brand-primary text-white hover:bg-brand-primary-dark px-5 py-2.5 text-xs font-bold transition-all shadow-sm">
                  View Command Station
                </Link>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
