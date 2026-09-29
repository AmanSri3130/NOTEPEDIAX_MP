import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Users, MessageSquare, HelpCircle, BarChart2, Send, 
  ThumbsUp, Heart, Zap, Smile, Volume2, Maximize, Settings, ShieldAlert,
  Sparkles, CheckCircle, Video, Play, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LiveClass() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'qa' | 'polls'
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Suhail Khan', text: 'Will this lecture cover reaction mechanisms?', time: '21:05', badges: ['Scholar'] },
    { id: 2, user: 'Tanya Gupta', text: 'Yes, the instructor is about to start calculations.', time: '21:06', badges: [] },
    { id: 3, user: 'Preeti Sharma', text: 'The stream connection is incredibly clear.', time: '21:06', badges: ['Legend'] }
  ]);

  const [qaInput, setQaInput] = useState('');
  const [qaQuestions, setQaQuestions] = useState([
    { id: 1, user: 'Rohan Deshmukh', text: 'How do steric effects impact substitution speeds?', upvotes: 14, status: 'Answered Live' },
    { id: 2, user: 'Divya Arora', text: 'Can we use polar protic solvents here?', upvotes: 8, status: 'Pending Review' }
  ]);

  const [reactions, setReactions] = useState([]);
  const chatEndRef = useRef(null);

  // Poll simulator state
  const [pollVoted, setPollVoted] = useState(false);
  const [pollVotes, setPollVotes] = useState({ A: 42, B: 28, C: 18, D: 12 });

  // Dynamic Live Class details from backend
  const [zoomClasses, setZoomClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdownText, setCountdownText] = useState('');

  // Load upcoming/active classes
  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/zoom/dashboard-classes');
      if (res.data.success && res.data.data.length > 0) {
        setZoomClasses(res.data.data);
        setActiveClass(res.data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching dashboard classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Countdown clock updater
  useEffect(() => {
    if (!activeClass) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const scheduledTime = new Date(activeClass.scheduledAt);
      const diffMs = scheduledTime - now;

      if (diffMs <= 0) {
        setCountdownText('Class is currently Active! Join Session below.');
      } else {
        const h = Math.floor(diffMs / 3600000);
        const m = Math.floor((diffMs % 3600000) / 60000);
        const s = Math.floor((diffMs % 60000) / 1000);
        setCountdownText(`Starts in ${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeClass]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      user: 'Aryan Kumar (You)',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      badges: ['Self']
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Mock live student replies
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          user: 'Class Bot',
          text: 'Glad to have you in the interactive stream! Ask any doubt details in the QA tab.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badges: ['Moderator']
        }
      ]);
    }, 1500);
  };

  const handleSendQA = (e) => {
    e.preventDefault();
    if (!qaInput.trim()) return;

    const newQ = {
      id: Date.now(),
      user: 'Aryan Kumar (You)',
      text: qaInput,
      upvotes: 1,
      status: 'Pending Review'
    };

    setQaQuestions((prev) => [newQ, ...prev]);
    setQaInput('');
  };

  const handleUpvoteQA = (id) => {
    setQaQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
  };

  const handleVotePoll = (option) => {
    if (pollVoted) return;
    setPollVotes((prev) => ({ ...prev, [option]: prev[option] + 1 }));
    setPollVoted(true);
  };

  // Click emojis to trigger floating overlay
  const handleEmojiClick = (emoji) => {
    const id = Date.now() + Math.random();
    setReactions((prev) => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  // Launch/Join Zoom SDK
  const handleJoinClass = async () => {
    if (!activeClass) return;
    try {
      const res = await api.get(`/zoom/join/${activeClass._id}`);
      if (res.data.success) {
        toast.success('Launching Zoom meeting frame in external tab...');
        window.open(res.data.joinUrl, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not join class. Check scheduling details.');
    }
  };

  return (
    <div className="bg-brand-base min-h-screen text-brand-text flex flex-col transition-colors duration-300">
      
      {/* Top Header Panel */}
      <div className="border-b border-brand-border bg-brand-card px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-brand-muted hover:text-brand-text transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse shrink-0" />
              <span className="text-[10px] font-mono text-brand-orange font-bold uppercase tracking-wider">
                LIVE INTERACTIVE SYLLABUS SESSION
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-brand-text leading-snug">
              {activeClass ? activeClass.title : 'No Live class scheduled at this moment.'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-brand-primary-light dark:bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-full text-xs font-bold font-mono shadow-sm">
          <Users className="h-4 w-4" />
          <span>1,420 STUDENTS ENGAGED</span>
        </div>
      </div>

      {/* Main workspace layout */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 items-stretch h-full">
        
        {/* Left Column: Live video stream & reaction emojis */}
        <div className="lg:col-span-8 p-6 flex flex-col gap-5 relative h-full">
          
          {/* Simulated Video Player frame */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-brand-border bg-slate-950 flex flex-col justify-between p-4 shadow-sm group">
            
            {/* Top info tags overlay */}
            <div className="flex justify-between items-start z-10">
              <span className="bg-brand-orange text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                🔴 LIVE STREAM FEED
              </span>
              <span className="bg-black/60 text-white font-mono text-[9px] px-2 py-0.5 rounded">
                1080p Stream
              </span>
            </div>

            {/* Simulated slides screen contents */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-tr from-brand-primary/20 via-slate-900 to-brand-orange/5 text-slate-200">
              <Sparkles className="h-10 w-10 text-brand-orange animate-pulse mb-3" />
              <h2 className="font-display text-base sm:text-xl font-bold max-w-md leading-relaxed text-white">
                {activeClass ? activeClass.description : 'Welcome to the live masterclass deck. Start countdown below.'}
              </h2>
              {activeClass && (
                <div className="mt-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-[10px] sm:text-xs font-mono text-brand-primary leading-normal max-w-sm">
                  {countdownText}
                </div>
              )}
            </div>

            {/* Floating Emojis overlay layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
              <AnimatePresence>
                {reactions.map((r) => (
                  <motion.span
                    key={r.id}
                    initial={{ y: '85%', x: `${r.x}%`, opacity: 0, scale: 0.6 }}
                    animate={{ y: '10%', opacity: 1, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className="absolute text-2xl"
                  >
                    {r.emoji}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* Video Controls overlay */}
            <div className="w-full flex justify-between items-center text-xs font-mono text-slate-300 z-10 bg-black/40 backdrop-blur-xs p-2 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 cursor-pointer text-white" />
                <span>Audio Output: Zoom Primary Mic Feed</span>
              </div>
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 cursor-pointer" />
                <Maximize className="h-4 w-4 cursor-pointer" />
              </div>
            </div>

          </div>

          {/* Reaction Emojis Panel + Zoom Launch Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="p-4 flex items-center justify-between bg-brand-card border border-brand-border shadow-sm">
              <span className="text-xs font-bold text-brand-muted">
                Tap live reactions:
              </span>
              <div className="flex gap-2">
                {['👍', '❤️', '🔥', '👏', '💡'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="h-10 w-10 rounded-full bg-brand-base border border-brand-border hover:border-brand-primary hover:bg-brand-primary-light text-base flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </GlassCard>

            {activeClass && (
              <GlassCard className="p-4 flex items-center justify-between bg-brand-card border border-brand-primary/20 shadow-glow-sm">
                <div className="font-mono text-left">
                  <span className="text-[8px] text-brand-dim block uppercase">Meeting ID: {activeClass.zoomMeetingId}</span>
                  <span className="text-[10px] text-brand-text font-bold block">Password: {activeClass.zoomPassword}</span>
                </div>
                <button
                  onClick={handleJoinClass}
                  className="rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2.5 text-xs font-bold transition-all shadow flex items-center gap-1.5"
                >
                  <Video className="h-4 w-4" />
                  <span>Join Live Zoom</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </GlassCard>
            )}
          </div>

        </div>

        {/* Right Column: Chat/Q&A/Polls Sidebar Drawer */}
        <div className="lg:col-span-4 border-l border-brand-border bg-brand-card flex flex-col justify-between overflow-hidden h-full">
          
          {/* Tab Selector */}
          <div className="border-b border-brand-border flex justify-around p-2 bg-brand-base/40">
            {[
              { id: 'chat', label: 'Live Chat', icon: MessageSquare },
              { id: 'qa', label: 'Class Q&A', icon: HelpCircle },
              { id: 'polls', label: 'Active Polls', icon: BarChart2 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all relative ${
                    activeTab === tab.id 
                      ? 'text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10' 
                      : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Tab Content panels */}
          <div className="flex-grow p-4 overflow-y-auto min-h-[300px]">
            
            {/* Live chat feed */}
            {activeTab === 'chat' && (
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-xs border-b border-brand-border/40 pb-2">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="font-bold text-brand-text">{msg.user}</span>
                      {msg.badges && msg.badges.map((b) => (
                        <span 
                          key={b} 
                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            b === 'Scholar' ? 'bg-brand-primary-light text-brand-primary' :
                            b === 'Legend' ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-brand-orange/20 text-brand-orange'
                          }`}
                        >
                          {b.toUpperCase()}
                        </span>
                      ))}
                      <span className="text-[9px] text-brand-dim font-mono ml-auto">{msg.time}</span>
                    </div>
                    <p className="text-brand-muted leading-relaxed">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Q&A Thread */}
            {activeTab === 'qa' && (
              <div className="space-y-4">
                
                {/* Submit Q&A field */}
                <form onSubmit={handleSendQA} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    required
                    placeholder="Submit doubt topic to teacher..."
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    className="w-full bg-brand-base border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text outline-none focus:border-brand-primary"
                  />
                  <GlowButton type="submit" variant="primary" className="text-xs shrink-0 py-2.5 bg-brand-orange border-transparent">
                    Ask
                  </GlowButton>
                </form>

                <div className="space-y-3">
                  {qaQuestions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-brand-border p-3.5 bg-brand-base/40 space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold">
                        <span className="text-brand-dim">{q.user}</span>
                        <span className={`px-2 py-0.5 rounded ${
                          q.status === 'Answered Live' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-orange/10 text-brand-orange'
                        }`}>
                          {q.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-brand-text leading-relaxed">{q.text}</p>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleUpvoteQA(q.id)}
                          className="flex items-center gap-1 text-[10px] font-mono text-brand-primary hover:text-brand-primary-dark font-bold"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>Upvote ({q.upvotes})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Active Class Polls */}
            {activeTab === 'polls' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-brand-border p-4 bg-brand-base/50 space-y-3">
                  <span className="text-[9px] font-mono font-bold bg-brand-orange/15 text-brand-orange px-2 py-0.5 rounded">
                    ACTIVE CLASS POLL
                  </span>
                  
                  <h4 className="text-xs font-bold text-brand-text leading-relaxed">
                    Which type of intermediate carbocation dictates the rate-limiting reaction speed in unimolecular substitution?
                  </h4>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { option: 'A', text: 'Primary (1°)', key: 'A' },
                      { option: 'B', text: 'Secondary (2°)', key: 'B' },
                      { option: 'C', text: 'Tertiary (3°)', key: 'C' },
                      { option: 'D', text: 'Methyl radical', key: 'D' }
                    ].map((opt) => {
                      const total = Object.values(pollVotes).reduce((a, b) => a + b, 0);
                      const percent = Math.round((pollVotes[opt.key] / total) * 100);
                      
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleVotePoll(opt.key)}
                          className="w-full text-left rounded-xl border border-brand-border bg-brand-card p-3 relative overflow-hidden transition-all hover:border-brand-primary"
                        >
                          {pollVoted && (
                            <div 
                              className="absolute inset-y-0 left-0 bg-brand-primary-light dark:bg-brand-primary/10 transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          )}
                          <div className="relative z-10 flex justify-between items-center text-xs">
                            <span className="font-semibold text-brand-text">
                              {opt.option}. {opt.text}
                            </span>
                            {pollVoted && (
                              <span className="font-mono text-[10px] font-bold text-brand-primary">
                                {percent}% ({pollVotes[opt.key]} votes)
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {pollVoted && (
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-brand-green font-bold justify-center pt-2">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>VOTE RECORDED SUCCESSFUL.</span>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

          {/* Lower Input panel for chat */}
          {activeTab === 'chat' && (
            <form onSubmit={handleSendChat} className="p-4 border-t border-brand-border flex gap-2 shrink-0 bg-brand-base/40">
              <input
                type="text"
                required
                placeholder="Type your comment to live feed..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full bg-brand-card border border-brand-border rounded-xl px-3 py-2.5 text-xs outline-none text-brand-text focus:border-brand-primary"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-primary hover:bg-brand-primary-dark p-3 text-white transition-all shadow-sm"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
