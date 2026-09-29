import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Sparkles, BookOpen, Video, Users, BookMarked, Brain, Zap, Clock, ShieldCheck, 
  CheckCircle2, ChevronRight, ChevronLeft, Award, Play, Trophy, Flame, Target, Calendar,
  ChevronDown, Search, ArrowRight, UserCheck, Star, Download, Eye, Smartphone,
  FileText, Cpu, Mic, BarChart3
} from 'lucide-react';
import ParticleBackground from '../components/animations/ParticleBackground';
import GlowButton from '../components/ui/GlowButton';
import GlassCard from '../components/ui/GlassCard';

// Reusable CountUp component triggered on scroll in view
function ScrollCounter({ value, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const target = parseInt(value.replace(/,/g, ''), 10);
    if (isNaN(target)) {
      setCount(value);
      return;
    }
    const duration = 1500;
    const increment = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-sora font-extrabold text-3xl sm:text-4xl text-white">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ── Hero Feature Carousel ─────────────────────────────────────────────────────
const CAROUSEL_SLIDES = [
  {
    tag: 'Live Classes',
    title: 'Real-time Interactive Video Lectures',
    desc: 'Join live sessions with India\'s top educators. Raise hand, ask doubts, and react with emojis in real-time.',
    icon: Video,
    gradient: 'from-indigo-500/20 via-brand-primary/10 to-violet-500/5',
    iconBg: 'bg-indigo-500/15 text-indigo-400',
    badge: { emoji: '🔴', label: '247 students online now' },
    stats: [
      { value: '200+', label: 'Live sessions/week' },
      { value: '50+', label: 'Expert educators' },
      { value: '∞', label: 'Recorded playback' },
    ],
  },
  {
    tag: 'AI Doubt Solver',
    title: 'Instant Step-by-Step AI Resolutions',
    desc: 'Type your physics, chemistry, or math doubt and receive a detailed breakdown with formula explanations in seconds.',
    icon: Cpu,
    gradient: 'from-rose-500/20 via-pink-500/10 to-fuchsia-500/5',
    iconBg: 'bg-rose-500/15 text-rose-400',
    badge: { emoji: '⚡', label: 'Answers in < 2 seconds' },
    stats: [
      { value: '1M+', label: 'Doubts resolved' },
      { value: '5', label: 'Free queries/day' },
      { value: '99%', label: 'Accuracy rate' },
    ],
  },
  {
    tag: 'Study Notes',
    title: 'Curated Handwritten PDF Library',
    desc: 'Access 10,000+ expert-curated handwritten notes, formula sheets, and revision booklets aligned to JEE, NEET & CBSE.',
    icon: FileText,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/5',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    badge: { emoji: '📄', label: '10,000+ PDFs available' },
    stats: [
      { value: '10K+', label: 'Study documents' },
      { value: 'Free', label: 'For all chapters' },
      { value: '4.9★', label: 'Avg rating' },
    ],
  },
  {
    tag: 'Mock Tests',
    title: 'Adaptive Mock Tests & Rank Predictor',
    desc: 'Take AI-proctored full-length mock papers and get a predicted national rank using our ML model trained on historical data.',
    icon: BarChart3,
    gradient: 'from-amber-500/20 via-orange-500/10 to-yellow-500/5',
    iconBg: 'bg-amber-500/15 text-amber-400',
    badge: { emoji: '🎯', label: 'ML-powered rank prediction' },
    stats: [
      { value: '500+', label: 'Mock papers' },
      { value: 'NTA', label: 'Pattern-aligned' },
      { value: 'AI', label: 'Proctored' },
    ],
  },
];

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const total = CAROUSEL_SLIDES.length;

  // Auto-advance every 3.5 s
  useEffect(() => {
    const id = setTimeout(() => {
      setDir(1);
      setActive((p) => (p + 1) % total);
    }, 3500);
    return () => clearTimeout(id);
  }, [active, total]);

  const goTo = (idx) => {
    setDir(idx > active ? 1 : -1);
    setActive(idx);
  };
  const prev = () => { setDir(-1); setActive((p) => (p - 1 + total) % total); };
  const next = () => { setDir(1);  setActive((p) => (p + 1) % total); };

  const slide = CAROUSEL_SLIDES[active];
  const Icon = slide.icon;

  const variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:  (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="lg:col-span-5 w-full flex justify-center relative"
    >
      {/* Ambient blur */}
      <div className="absolute h-72 w-72 bg-brand-primary/10 rounded-full blur-3xl -top-10 -right-10 pointer-events-none" />

      <div className="relative w-full max-w-md select-none">
        {/* Card */}
        <div className={`bg-gradient-to-br ${slide.gradient} rounded-3xl border border-brand-border bg-white dark:bg-brand-card shadow-xl overflow-hidden`} style={{ minHeight: '340px' }}>
          
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={active}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="p-6 flex flex-col h-full"
            >
              {/* Tag badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${slide.iconBg}`}>
                  {slide.tag}
                </span>
                <span className="text-[10px] font-mono text-brand-muted bg-brand-base/80 px-2 py-1 rounded-full border border-brand-border">
                  {slide.badge.emoji} {slide.badge.label}
                </span>
              </div>

              {/* Icon */}
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${slide.iconBg}`}>
                <Icon className="h-7 w-7" />
              </div>

              {/* Text */}
              <h3 className="font-jakarta text-base font-extrabold text-brand-text leading-snug mb-2">
                {slide.title}
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed mb-5">
                {slide.desc}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mt-auto">
                {slide.stats.map((s, i) => (
                  <div key={i} className="rounded-xl border border-brand-border bg-brand-card/70 p-2.5 text-center">
                    <span className="block text-sm font-extrabold text-brand-text font-mono">{s.value}</span>
                    <span className="block text-[9px] text-brand-dim mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between mt-4 px-1">
          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${i === active ? 'w-5 h-2 bg-brand-primary' : 'w-2 h-2 bg-brand-border hover:bg-brand-primary/40'}`}
              />
            ))}
          </div>

          {/* Prev / Next arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="h-7 w-7 rounded-full border border-brand-border bg-brand-card flex items-center justify-center text-brand-muted hover:text-brand-primary hover:border-brand-primary transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={next}
              className="h-7 w-7 rounded-full border border-brand-border bg-brand-card flex items-center justify-center text-brand-muted hover:text-brand-primary hover:border-brand-primary transition-all"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [activeExamTab, setActiveExamTab] = useState('JEE');
  const [activeAiTab, setActiveAiTab] = useState('doubt'); // 'doubt' | 'summary' | 'quiz'
  const [noteFilter, setNoteFilter] = useState('All');
  const [reactions, setReactions] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [doubtText, setDoubtText] = useState('');
  const [doubtSolvedOutput, setDoubtSolvedOutput] = useState('');
  const [doubtLoading, setDoubtLoading] = useState(false);

  // Trigger floating reaction emojis in the live class mockup
  const handleEmojiReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setReactions((prev) => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  // Mock doubt solver typewriter activation
  const solveDoubtTrigger = (e) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    setDoubtLoading(true);
    setDoubtSolvedOutput('');
    setTimeout(() => {
      setDoubtLoading(false);
      setDoubtSolvedOutput(
        `> Concept Identified: Newton's 2nd Law (F = ma)\n` +
        `> Acceleration a = Force / Mass\n` +
        `> a = 20 N / 4 kg = 5 m/s².\n` +
        `> Verified under Class 11 Physics Module 3.`
      );
    }, 1500);
  };

  const examsList = ['JEE', 'NEET', 'CBSE Class 12', 'CBSE Class 10', 'UPSC', 'ICSE', 'Coding', 'English'];

  const courseList = {
    'JEE': [
      { title: 'Organic Chemistry: IIT Advanced prep', instructor: 'Dr. S. K. Roy', rating: 4.8, students: '12K', price: '₹999', original: '₹2,999' },
      { title: 'Mathematics: Coordinate Geometry Masterclass', instructor: 'V. K. Bansal', rating: 4.9, students: '8K', price: '₹1,199', original: '₹3,499' },
      { title: 'Physics Mechanics: Advanced Rotational Drills', instructor: 'Prof. R. Sen', rating: 4.7, students: '15K', price: '₹899', original: '₹2,799' },
      { title: 'Inorganic Chemistry: Coordination Chemistry', instructor: 'Dr. Anita Roy', rating: 4.6, students: '6K', price: '₹799', original: '₹2,499' }
    ],
    'NEET': [
      { title: 'Human Physiology & Cell Structures', instructor: 'Dr. P. Sharma', rating: 4.9, students: '18K', price: '₹999', original: '₹2,999' },
      { title: 'Organic Chemistry for Medical Aspirants', instructor: 'Dr. S. K. Roy', rating: 4.7, students: '11K', price: '₹899', original: '₹2,799' },
      { title: 'Genetics & Evolution Core Modules', instructor: 'Prof. J. Mukherji', rating: 4.8, students: '9K', price: '₹1,099', original: '₹3,299' },
      { title: 'Physics: Electromagnetism drills for NEET', instructor: 'Prof. R. Sen', rating: 4.6, students: '7K', price: '₹799', original: '₹2,499' }
    ],
    'CBSE Class 12': [
      { title: 'Class 12 Boards: Physics Complete Syllabus', instructor: 'Prof. Verma', rating: 4.8, students: '14K', price: '₹799', original: '₹1,999' },
      { title: 'Chemistry Boards: Chemical Kinetics & Polymers', instructor: 'Dr. Anita Roy', rating: 4.6, students: '10K', price: '₹799', original: '₹1,999' },
      { title: 'Mathematics Boards: Calculus & Matrix theory', instructor: 'V. K. Bansal', rating: 4.7, students: '12K', price: '₹899', original: '₹2,499' },
      { title: 'Biology Boards: Plant Reproduction & Genetics', instructor: 'Dr. P. Sharma', rating: 4.9, students: '9K', price: '₹799', original: '₹1,999' }
    ],
    'CBSE Class 10': [
      { title: 'Science Class 10: Complete Boards Package', instructor: 'Prof. Verma', rating: 4.9, students: '20K', price: '₹499', original: '₹1,499' },
      { title: 'Maths Class 10: Quadratic Equations & Trig', instructor: 'V. K. Bansal', rating: 4.8, students: '16K', price: '₹499', original: '₹1,499' },
      { title: 'Social Science: History & Civics complete guide', instructor: 'Prof. R. Sen', rating: 4.6, students: '12K', price: '₹399', original: '₹1,299' },
      { title: 'English Boards Grammar & Literature course', instructor: 'Prof. J. Mukherji', rating: 4.7, students: '10K', price: '₹399', original: '₹1,299' }
    ],
    'UPSC': [
      { title: 'UPSC Polity & Indian Constitution Mains GS II', instructor: 'M. S. Shastri', rating: 4.8, students: '6K', price: '₹1,499', original: '₹4,500' },
      { title: 'UPSC History Mains: Ancient & Medieval India', instructor: 'Prof. R. Sen', rating: 4.7, students: '4K', price: '₹1,299', original: '₹3,999' },
      { title: 'Geography GS Paper I: Geomorphology & Climate', instructor: 'Prof. J. Mukherji', rating: 4.6, students: '5K', price: '₹1,399', original: '₹4,200' },
      { title: 'Economy GS Paper III: Indian Economic Reforms', instructor: 'M. S. Shastri', rating: 4.9, students: '7K', price: '₹1,599', original: '₹4,999' }
    ],
    'ICSE': [
      { title: 'ICSE Class 10: Maths Syllabus Masterclass', instructor: 'V. K. Bansal', rating: 4.8, students: '8K', price: '₹699', original: '₹1,999' },
      { title: 'ICSE Physics complete chapter explanations', instructor: 'Prof. Verma', rating: 4.7, students: '7K', price: '₹599', original: '₹1,799' },
      { title: 'ICSE Chemistry laboratory organic mechanisms', instructor: 'Dr. Anita Roy', rating: 4.6, students: '5K', price: '₹599', original: '₹1,799' },
      { title: 'ICSE Biology complete cytology & botany', instructor: 'Dr. P. Sharma', rating: 4.9, students: '6K', price: '₹599', original: '₹1,799' }
    ],
    'Coding': [
      { title: 'Full Stack Web Dev (React + Node.js)', instructor: 'Aryan Kumar', rating: 4.9, students: '14K', price: '₹1,299', original: '₹3,999' },
      { title: 'Data Structures & Algorithms in C++ / Java', instructor: 'Aryan Kumar', rating: 4.8, students: '10K', price: '₹1,499', original: '₹4,500' },
      { title: 'Python for AI and Machine Learning basics', instructor: 'Dr. Anita Roy', rating: 4.7, students: '8K', price: '₹1,199', original: '₹3,499' },
      { title: 'UI/UX Design systems with Figma guidelines', instructor: 'Aryan Kumar', rating: 4.6, students: '5K', price: '₹999', original: '₹2,999' }
    ],
    'English': [
      { title: 'Advanced English Grammar and Writing Skills', instructor: 'Prof. J. Mukherji', rating: 4.9, students: '9K', price: '₹399', original: '₹1,199' },
      { title: 'Spoken English & Public Speaking fundamentals', instructor: 'Prof. J. Mukherji', rating: 4.8, students: '12K', price: '₹499', original: '₹1,499' },
      { title: 'Class 12 Boards Core English syllabus master', instructor: 'Prof. J. Mukherji', rating: 4.7, students: '8K', price: '₹399', original: '₹1,199' },
      { title: 'Creative Writing & Novel Structure guide', instructor: 'Prof. J. Mukherji', rating: 4.6, students: '4K', price: '₹599', original: '₹1,799' }
    ]
  };

  const teachers = [
    { name: 'Dr. S. K. Roy', sub: 'Organic Chemistry', exp: '15+ Years Exp', badge: 'Ex-IIT Kharagpur', rating: '4.9', reviews: '1,200', topics: ['Mechanisms', 'Carbonyls', 'Alcohols'] },
    { name: 'Prof. H. C. Verma', sub: 'Physics Master', exp: '20+ Years Exp', badge: 'IIT Kanpur Legend', rating: '5.0', reviews: '8,400', topics: ['Mechanics', 'Thermodynamics', 'Optics'] },
    { name: 'Dr. P. Sharma', sub: 'Biology Specialist', exp: '12+ Years Exp', badge: 'Ex-AIIMS New Delhi', rating: '4.9', reviews: '2,100', topics: ['Genetics', 'Human Anatomy', 'Botany'] },
    { name: 'V. K. Bansal', sub: 'Mathematics Lead', exp: '18+ Years Exp', badge: 'IIT Bombay Alum', rating: '4.8', reviews: '3,800', topics: ['Calculus', 'Algebra', 'Trigonometry'] }
  ];

  const notesList = [
    { id: 1, title: 'Electrostatics & Gauss Theorem Notes', subject: 'Physics', class: 'Class 12', board: 'CBSE', pages: 18, downloads: '1.2K', color: 'border-t-indigo-500' },
    { id: 2, title: 'Inorganic Chemistry: Coordination Compounds', subject: 'Chemistry', class: 'Class 12', board: 'JEE', pages: 24, downloads: '840', color: 'border-t-pink-500' },
    { id: 3, title: 'Cell Biology & Plant Physiology', subject: 'Biology', class: 'Class 11', board: 'NEET', pages: 32, downloads: '2.4K', color: 'border-t-emerald-500' },
    { id: 4, title: 'Calculus: Indefinite Integrals Sheet', subject: 'Mathematics', class: 'Class 12', board: 'ICSE', pages: 12, downloads: '920', color: 'border-t-cyan-500' }
  ];

  const filteredNotes = notesList.filter(note => noteFilter === 'All' || note.subject === noteFilter);

  const testimonials = [
    { name: 'Rohan Deshmukh', role: 'Student (JEE Rank 420)', quote: 'The AI doubt solver saved me hours during night preps. Combined with handwritten notes, it is a game changer!', rating: 5, category: 'JEE' },
    { name: 'Meenakshi Iyer', role: 'Parent of Class 10 Scholar', quote: 'We tried multiple tutors, but the live class teachers at Notepediax are outstanding. My daughter actually looks forward to study hours.', rating: 5, category: 'Parent' },
    { name: 'Prerna Goel', role: 'Student (NEET Score 680)', quote: 'Curriculum-aligned summary sheets and formula booklets helped me review coordinates and physiology in minutes.', rating: 5, category: 'NEET' },
    { name: 'Sanjay Aggarwal', role: 'Parent of Class 12 Scholar', quote: 'The parent analytics reports sent on WhatsApp make progress tracking stress-free. Very transparent.', rating: 5, category: 'Parent' }
  ];

  const faqs = [
    { q: 'How does the AI Doubt Solver resolve problems?', a: 'You can type a question or paste text directly. The AI instantly processes the physics formulas or chemistry reactions to generate a detailed step-by-step resolution.' },
    { q: 'Are Notepediax notes boards-aligned?', a: 'Yes, all handwritten sheets, formula summaries, and PDFs are curated by expert teachers according to CBSE, ICSE, JEE, and NEET syllabus alignments.' },
    { q: 'How do live classes work here?', a: 'Live calls feature real-time video streams, instant doubt resolution boxes, and reaction bars. Recorded playbacks are available forever.' },
    { q: 'What is the daily AI credits limit?', a: 'Free members get 5 AI query credits per day. Upgrading to a Pro or Premium plan unlocks unlimited prompts.' },
    { q: 'Can I track my child\'s study streak?', a: 'Yes! Notepediax has a Parent Dashboard link which forwards weekly WhatsApp progress sheets, streak flags, and mock scores.' },
    { q: 'What boards and classes do you support?', a: 'We support CBSE and ICSE boards for Class 6 to Class 12, alongside specialized modules for JEE, NEET, UPSC, and basic programming.' },
    { q: 'How does the AI rank predictor calculate ranks?', a: 'Our ML model compares your mock test scoring records against historical cutoffs to evaluate your estimated national rank percentile.' },
    { q: 'Is there a refund policy for courses?', a: 'Yes, we offer a 7-day money-back refund guarantee if you are not satisfied with your course package.' }
  ];

  return (
    <div className="bg-brand-base min-h-screen text-brand-text font-body transition-colors duration-300">
      
      {/* Dot Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.03] bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] z-0" />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-border overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text details */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary-light border border-brand-primary/20 px-4 py-1.5 text-xs font-semibold text-brand-primary shadow-sm">
              <span className="animate-pulse">🤖</span>
              <span className="font-jakarta">INDIA'S #1 AI-POWERED EDTECH</span>
            </div>

            <h1 className="font-jakarta text-4xl sm:text-5xl xl:text-6xl text-brand-text tracking-tight font-extrabold leading-[1.1]">
              Learn Smarter With
              <br />
              <span className="bg-gradient-to-r from-brand-primary to-brand-orange bg-clip-text text-transparent">
                AI-Powered Education
              </span>
            </h1>

            <p className="text-brand-muted text-sm sm:text-base max-w-xl leading-relaxed">
              Live interactive classes, smart note boards, instant AI doubt resolution, and circular mock tests. Everything a student needs to ace competitive examinations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full justify-center lg:justify-start">
              <GlowButton variant="primary" onClick={() => navigate('/register')} className="bg-brand-orange hover:bg-brand-orange/95 border-brand-orange/20 text-white font-bold py-3.5 px-7 text-xs">
                Start Learning Free
                <ChevronRight className="h-4.5 w-4.5" />
              </GlowButton>
              <button 
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white dark:bg-brand-card text-brand-text hover:border-brand-primary hover:bg-brand-primary-light px-6 py-3.5 text-xs font-bold transition-all shadow-sm"
              >
                <Play className="h-4 w-4 fill-current text-brand-primary" />
                Watch How It Works
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 border-t border-brand-border pt-6 mt-4 w-full text-xs text-brand-muted font-mono">
              <span>⭐️ 4.8/5 Rated</span>
              <span className="text-brand-border">•</span>
              <span>👨‍🎓 50K+ Students</span>
              <span className="text-brand-border">•</span>
              <span>📚 2000+ Courses</span>
              <span className="text-brand-border">•</span>
              <span>🎯 99% Pass Rate</span>
            </div>
          </motion.div>

          {/* Right Showcase: Feature Carousel */}
          <HeroCarousel />

        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-brand-card border border-brand-border rounded-3xl w-full max-w-2xl overflow-hidden p-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-brand-border">
                <h3 className="font-jakarta text-sm font-bold text-brand-text">Notepediax Platform Overview</h3>
                <button onClick={() => setVideoModalOpen(false)} className="text-brand-muted hover:text-brand-text text-xs font-bold">Close</button>
              </div>
              <div className="aspect-video bg-black rounded-2xl mt-4 overflow-hidden relative flex items-center justify-center text-brand-light">
                <Play className="h-12 w-12 text-brand-primary animate-pulse" />
                <span className="absolute bottom-4 font-mono text-[10px]">Simulating Demo stream...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam Category Tabs section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">Prepare for any Exam</h2>
            <p className="text-brand-muted text-xs sm:text-sm mt-2">Curriculum-mapped video courses, mock mock test papers, and handwritten notes.</p>
          </div>

          {/* Tab lists */}
          <div className="flex justify-center border-b border-brand-border overflow-x-auto w-full pb-2 mb-10">
            <div className="flex gap-2">
              {examsList.map((exam) => (
                <button
                  key={exam}
                  onClick={() => setActiveExamTab(exam)}
                  className={`px-5 py-2 text-xs font-bold relative transition-all rounded-full shrink-0 ${
                    activeExamTab === exam ? 'text-brand-primary bg-brand-primary-light' : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {exam}
                  {activeExamTab === exam && (
                    <motion.div 
                      layoutId="activeExamUnderline" 
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-primary rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courseList[activeExamTab]?.map((course, idx) => (
              <GlassCard key={idx} className="flex flex-col justify-between h-full group border border-brand-border relative overflow-hidden" hoverEffect={false}>
                <div>
                  <div className="h-40 rounded-2xl bg-gradient-to-tr from-brand-primary/10 to-brand-orange/10 border border-brand-border relative flex items-center justify-center overflow-hidden">
                    <Play className="h-8 w-8 text-brand-primary opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300" />
                    <span className="absolute top-2 left-2 bg-white/90 dark:bg-brand-card/90 text-[8px] font-bold text-brand-primary px-2 py-0.5 rounded-full border border-brand-border uppercase">
                      {activeExamTab}
                    </span>
                  </div>
                  <h3 className="font-jakarta text-xs sm:text-sm font-bold text-brand-text mt-4 leading-snug group-hover:text-brand-primary transition-colors">{course.title}</h3>
                  <p className="text-[10px] text-brand-muted mt-1">{course.instructor}</p>
                  
                  <div className="flex items-center gap-1 mt-3 text-[10px] text-brand-muted font-mono">
                    <Star className="h-3 w-3 fill-current text-brand-yellow" />
                    <span className="font-bold text-brand-text">{course.rating}</span>
                    <span>({course.students} enrolled)</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-brand-text">{course.price}</span>
                    <span className="text-[10px] text-brand-light line-through">{course.original}</span>
                  </div>
                  <Link 
                    to="/courses/organic-chem/player" 
                    className="rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white px-3.5 py-1.5 text-[10px] font-bold shadow-sm transition-colors"
                  >
                    Enroll Now
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>

        </div>
      </section>

      {/* Live Classes section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border bg-brand-primary-light/30">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">Live Classes by Expert Teachers</h2>
            <p className="text-brand-muted text-xs sm:text-sm mt-2">Real-time interaction, structured board notes, and weekly mock drill assessments.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left: Large Live Class Simulation card */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-brand-card rounded-3xl border border-brand-border p-6 shadow-md h-full flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-green animate-ping" />
                      <span className="text-[10px] font-bold text-brand-green font-mono uppercase tracking-wider">LIVE NOW ON SITE</span>
                    </div>
                    <span className="text-[10px] text-brand-muted font-mono bg-brand-base px-2.5 py-1 rounded-full border border-brand-border">247 Students Reacting</span>
                  </div>

                  <div className="relative aspect-video rounded-2xl bg-black overflow-hidden flex items-center justify-center">
                    <Video className="h-10 w-10 text-white opacity-40 animate-pulse" />
                    
                    {/* Floating Reaction Emojis overlay */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <AnimatePresence>
                        {reactions.map((r) => (
                          <motion.span
                            key={r.id}
                            initial={{ y: 180, opacity: 0, scale: 0.5 }}
                            animate={{ y: -30, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.8] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.8, ease: 'easeOut' }}
                            className="absolute text-xl"
                            style={{ left: `${r.x}%`, bottom: '0px' }}
                          >
                            {r.emoji}
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <h3 className="font-jakarta text-base text-brand-text mt-4 font-bold">Advanced Limits & Integration Practice Methods</h3>
                  <p className="text-xs text-brand-muted mt-1">Classroom: Dr. Rohit Verma &bull; Ex-IIT Kanpur</p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Reaction Buttons */}
                  <div className="flex gap-2">
                    {['🔥', '❤️', '👍', '🎉', '🧠'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiReaction(emoji)}
                        className="h-9 w-9 rounded-lg border border-brand-border bg-brand-base hover:bg-brand-primary-light flex items-center justify-center text-sm transition-all cursor-pointer hover:scale-105"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <Link 
                    to="/courses/organic-chem/player" 
                    className="rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-colors cursor-pointer text-center w-full sm:w-auto"
                  >
                    Join Free Class
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Upcoming Classes checklist */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white dark:bg-brand-card rounded-3xl border border-brand-border p-5 shadow-sm">
                <h3 className="font-jakarta text-xs font-bold text-brand-text mb-4 uppercase tracking-wider">Today's Class Schedule</h3>
                <div className="space-y-3">
                  {[
                    { teacher: 'Prof. Bansal', sub: 'Calculus Advanced Practice', time: 'Starting in 24 mins', active: true },
                    { teacher: 'Dr. Anita Roy', sub: 'Inorganic Coordinate theory', time: 'Today at 4:00 PM', active: false },
                    { teacher: 'Prof. Sen', sub: 'Wave Optics boards review', time: 'Today at 6:30 PM', active: false }
                  ].map((cls, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${cls.active ? 'border-brand-primary bg-brand-primary-light/40' : 'border-brand-border bg-brand-base'} flex justify-between items-center`}>
                      <div>
                        <h4 className="text-xs font-bold text-brand-text">{cls.sub}</h4>
                        <span className="text-[10px] text-brand-muted block mt-0.5">{cls.teacher} &bull; {cls.time}</span>
                      </div>
                      <Link 
                        to="/courses/organic-chem/player"
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold border transition-colors ${
                          cls.active 
                            ? 'bg-brand-primary border-transparent text-white hover:bg-brand-primary-dark' 
                            : 'border-brand-border bg-white dark:bg-brand-card text-brand-muted hover:border-brand-primary hover:text-brand-primary'
                        }`}
                      >
                        {cls.active ? 'Join Seat' : 'Book Seat'}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Teachers section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">Learn from India's Best Teachers</h2>
            <p className="text-brand-muted text-xs sm:text-sm mt-2">Crack complex JEE / NEET entrance questions under the guidance of top IIT faculty.</p>
          </div>

          {/* Teachers list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((teacher, idx) => (
              <GlassCard key={idx} className="flex flex-col justify-between h-full group" hoverEffect={false}>
                <div>
                  <div className="h-44 rounded-2xl bg-brand-primary-light border border-brand-border relative overflow-hidden flex items-center justify-center">
                    <span className="text-3xl">👨‍🏫</span>
                    <span className="absolute top-2.5 right-2.5 bg-brand-orange/15 text-[8px] font-bold text-brand-orange px-2 py-0.5 rounded-full border border-brand-orange/20 uppercase tracking-wide font-mono">
                      {teacher.badge}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-jakarta text-xs sm:text-sm font-bold text-brand-text leading-snug group-hover:text-brand-primary transition-colors">{teacher.name}</h3>
                    <span className="text-[10px] text-brand-primary block font-mono mt-0.5">{teacher.sub}</span>
                    <span className="text-[9px] text-brand-muted font-mono block">{teacher.exp}</span>

                    <div className="flex gap-1.5 flex-wrap mt-3">
                      {teacher.topics.map((t, tIdx) => (
                        <span key={tIdx} className="text-[8px] font-bold font-mono border border-brand-border bg-brand-base px-2 py-0.5 rounded-full text-brand-muted">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between text-[10px] text-brand-muted font-mono">
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-current text-brand-yellow" />
                    <span className="font-bold text-brand-text">{teacher.rating}</span>
                    <span>({teacher.reviews} reviews)</span>
                  </div>
                  <Link to="/courses" className="text-brand-primary font-bold group-hover:underline">View Profile &rarr;</Link>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="text-center mt-10 text-xs font-mono text-brand-muted uppercase tracking-wider">
            🏆 500+ Expert Teachers Onboarded nationwide
          </div>

        </div>
      </section>

      {/* AI Tools Showcase section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border bg-brand-section">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">Powered by AI - Study tools that work</h2>
            <p className="text-brand-muted text-xs sm:text-sm mt-2">Type doubts, upload PDF booklets, or build custom revision cards instantly.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left selector */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {[
                { id: 'doubt', title: 'AI Doubt Solver', desc: 'Paste physics equations or chemistry formulas for detailed step resolutions.' },
                { id: 'summary', title: 'AI Note Summariser', desc: 'Scan booklets to get quick highlight bullets.' },
                { id: 'quiz', title: 'AI Quiz Generator', desc: 'Generate practice questions from text segments.' }
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => { setActiveAiTab(tool.id); setDoubtSolvedOutput(''); }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    activeAiTab === tool.id 
                      ? 'border-brand-primary bg-white dark:bg-brand-card shadow-sm text-brand-primary' 
                      : 'border-brand-border/60 bg-transparent text-brand-muted hover:text-brand-text'
                  }`}
                >
                  <h4 className="font-jakarta text-xs sm:text-sm font-bold">{tool.title}</h4>
                  <p className="text-[10px] text-brand-muted mt-1 leading-normal">{tool.desc}</p>
                </button>
              ))}
            </div>

            {/* Right: Simulated AI Console */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-brand-card rounded-3xl border border-brand-border p-6 shadow-md h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-brand-border pb-3 mb-4">
                    <span className="text-[10px] font-mono text-brand-orange uppercase font-bold">NOTEPEDIAX AI ENGINE PANEL</span>
                    <span className="text-[9px] text-brand-light font-mono">STATUS: READY</span>
                  </div>

                  {activeAiTab === 'doubt' && (
                    <form onSubmit={solveDoubtTrigger} className="space-y-4">
                      <label className="text-[10px] font-mono text-brand-muted uppercase block">Enter Physics / Chemistry Doubt Query</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. A force of 20N is applied on a 4kg mass. Calculate its acceleration constant."
                        value={doubtText}
                        onChange={(e) => setDoubtText(e.target.value)}
                        className="w-full rounded-2xl border border-brand-border bg-brand-base p-4 text-xs outline-none text-brand-text focus:border-brand-primary placeholder:text-brand-light font-mono"
                      />
                      <GlowButton type="submit" variant="primary" className="w-full text-xs font-bold bg-brand-primary py-2.5 text-white">
                        {doubtLoading ? 'Evaluating Equations...' : 'Solve Doubt'}
                      </GlowButton>
                    </form>
                  )}

                  {activeAiTab === 'summary' && (
                    <div className="space-y-4 font-mono text-xs">
                      <span className="text-brand-primary font-bold block">&gt; Uploaded PDF: electrostatics_class12.pdf</span>
                      <div className="border border-brand-border bg-brand-base p-4 rounded-xl text-brand-text">
                        <p>&bull; Gauss Theorem states net electric flux is equivalent to enclosed charge divided by permittivity constant.</p>
                        <p>&bull; Electric potential is equivalent to work done per unit test charge.</p>
                      </div>
                    </div>
                  )}

                  {activeAiTab === 'quiz' && (
                    <div className="space-y-4 font-mono text-xs">
                      <span className="text-brand-primary font-bold block">&gt; Generated MCQ quiz sets:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="border border-brand-border bg-brand-base p-3 rounded-xl">
                          <p className="font-bold">Q1: Unit of electric flux?</p>
                          <p className="text-[10px] mt-1 text-brand-muted">A: N·m²/C (Correct)</p>
                          <p className="text-[10px] text-brand-muted">B: N/C</p>
                        </div>
                        <div className="border border-brand-border bg-brand-base p-3 rounded-xl">
                          <p className="font-bold">Q2: Permittivity of space?</p>
                          <p className="text-[10px] mt-1 text-brand-muted">A: 8.85 x 10^-12 (Correct)</p>
                          <p className="text-[10px] text-brand-muted">B: 9 x 10^9</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Solved Output Terminal */}
                  {doubtSolvedOutput && (
                    <div className="mt-5 p-4 rounded-xl border border-brand-primary/20 bg-brand-primary-light font-mono text-xs text-brand-primary whitespace-pre-wrap animate-fade-in shadow-inner">
                      {doubtSolvedOutput}
                    </div>
                  )}

                </div>

                <div className="mt-6 pt-3.5 border-t border-brand-border flex items-center justify-between text-[9px] font-mono text-brand-light">
                  <span>FREE CREDITS ELIGIBLE</span>
                  <Link to="/ai-tools" className="text-brand-primary font-bold">Try AI Tools Suite &rarr;</Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Notes Library section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">2,00,000+ Notes & PDFs</h2>
              <p className="text-brand-muted text-xs sm:text-sm mt-2">Filter and download class handwritten sheets and formula summaries.</p>
            </div>
            
            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2">
              {['All', 'Physics', 'Chemistry', 'Maths', 'Biology'].map((subject) => (
                <button
                  key={subject}
                  onClick={() => setNoteFilter(subject)}
                  className={`rounded-full px-5 py-2 text-xs font-semibold shrink-0 border transition-colors ${
                    noteFilter === subject 
                      ? 'bg-brand-primary border-transparent text-white shadow-sm' 
                      : 'border-brand-border bg-white dark:bg-brand-card text-brand-muted hover:text-brand-primary hover:border-brand-primary'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredNotes.map((note) => (
              <GlassCard key={note.id} className="flex flex-col justify-between h-full group" hoverEffect={false}>
                <div>
                  <div className={`h-36 rounded-2xl bg-brand-primary-light border-t-4 ${note.color} border border-brand-border relative flex flex-col justify-between p-4`}>
                    <span className="text-[9px] font-bold font-mono text-brand-primary uppercase bg-white/80 dark:bg-brand-card px-2 py-0.5 rounded-full border border-brand-border w-max">
                      {note.subject}
                    </span>
                    <div className="flex justify-between items-center text-[10px] text-brand-muted font-mono">
                      <span>{note.board}</span>
                      <span>{note.class}</span>
                    </div>
                  </div>

                  <h3 className="font-jakarta text-xs sm:text-sm font-bold text-brand-text mt-4 leading-snug group-hover:text-brand-primary transition-colors">{note.title}</h3>
                </div>

                <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between text-[10px] text-brand-muted font-mono">
                  <span>{note.pages} pages</span>
                  <Link to="/notes" className="text-brand-primary font-bold flex items-center gap-0.5 group-hover:underline">
                    <Download className="h-3.5 w-3.5" />
                    Get PDF &rarr;
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>

        </div>
      </section>

      {/* Gamification Teaser section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border bg-brand-primary-light/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">Learning that feels like a Game</h2>
            <p className="text-brand-muted text-xs sm:text-sm mt-2">Earn XP points on quiz attempts and streak maintenance to climb the leaderboard rankings.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Gamified profile mockup */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-brand-card rounded-3xl border border-brand-border p-6 shadow-md max-w-lg mx-auto">
                <div className="flex items-center gap-4 border-b border-brand-border pb-5 mb-5">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-pink text-white flex items-center justify-center font-bold font-jakarta text-base shadow-sm">
                    AK
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">Aryan Kumar</h3>
                    <span className="text-[10px] font-bold text-brand-primary uppercase font-mono tracking-wider">Scholar Level 4 &bull; Streak Master</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-brand-muted mb-1.5">
                      <span>NEXT REWARDS MILESTONE</span>
                      <span className="text-brand-orange font-bold">450 / 600 XP</span>
                    </div>
                    <div className="w-full bg-brand-base h-2.5 rounded-full overflow-hidden border border-brand-border shadow-inner">
                      <div className="h-full bg-gradient-to-r from-brand-primary to-brand-orange" style={{ width: '75%' }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-brand-orange">
                      <Flame className="h-5.5 w-5.5 fill-current animate-pulse" />
                      <span className="font-sora font-extrabold text-sm">32 Day Streak</span>
                    </div>
                    <div className="flex gap-2">
                      {['Quiz Champ', 'Top Downloader'].map((b, idx) => (
                        <span key={idx} className="text-[9px] font-bold font-mono border border-brand-border bg-brand-base px-2.5 py-1 rounded-full text-brand-muted">
                          🏆 {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Leaderboard preview podium */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-brand-card rounded-3xl border border-brand-border p-6 shadow-sm">
                <h3 className="font-jakarta text-xs font-bold text-brand-text mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="h-4.5 w-4.5 text-brand-yellow" />
                  Weekly Leaderboard Ranks
                </h3>
                
                <div className="space-y-2.5">
                  {[
                    { rank: 1, name: 'Suhail Khan', xp: '2,450 XP', color: 'border-brand-yellow/30 bg-brand-yellow/5 text-brand-yellow' },
                    { rank: 2, name: 'Aryan Kumar', xp: '1,820 XP', color: 'border-brand-primary/20 bg-brand-primary-light/40 text-brand-primary' },
                    { rank: 3, name: 'Tanya Gupta', xp: '1,450 XP', color: 'border-brand-pink/20 bg-brand-pink/5 text-brand-pink' }
                  ].map((user) => (
                    <div key={user.rank} className={`flex items-center justify-between p-3 rounded-xl border ${user.color}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-sora font-extrabold text-xs">#{user.rank}</span>
                        <span className="text-xs font-bold text-brand-text">{user.name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold">{user.xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Mock Test section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">Test yourself - Know where you stand</h2>
            <p className="text-brand-muted text-xs sm:text-sm mt-2">Attempt detailed assessments and preview historical percentile predictions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { title: 'Full Length Mocks', desc: 'Syllabus tests aligned strictly with IIT JEE Mains and NEET paper patterns.' },
              { title: 'AI Rank Predictor', desc: 'Predicts your national rank threshold dynamically based on quiz results history.' },
              { title: 'Accuracy Analytics', desc: 'Circular charts tracking weak coordinates, physics topics, and timing markers.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-brand-primary-light/30 border border-brand-border p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="font-jakarta text-sm font-bold text-brand-primary uppercase tracking-wide">{item.title}</h3>
                  <p className="text-xs text-brand-muted mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Practice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { exam: 'JEE Main Full Drill', qs: '90 Questions', duration: '180 mins' },
              { exam: 'NEET Practice Drill', qs: '180 Questions', duration: '200 mins' },
              { exam: 'Class 12 Boards Physics Practice', qs: '30 Questions', duration: '90 mins' }
            ].map((test, idx) => (
              <div key={idx} className="bg-white dark:bg-brand-card rounded-2xl border border-brand-border p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <span className="text-[9px] font-bold font-mono text-brand-orange uppercase">MOCK ASSESSMENTS</span>
                  <h4 className="text-xs sm:text-sm font-bold text-brand-text mt-1">{test.exam}</h4>
                  <span className="text-[10px] text-brand-muted font-mono block mt-1.5">{test.qs} &bull; {test.duration}</span>
                </div>
                <button 
                  onClick={() => navigate('/mock-test')}
                  className="w-full mt-4 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white py-2 text-[10px] font-bold shadow-sm transition-colors cursor-pointer text-center"
                >
                  Start Free Test
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Stats Section with Scroll Counters */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-primary border-b border-brand-primary-dark text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { value: '50,000', suffix: '+', label: 'Students Enrolled' },
            { value: '2,000', suffix: '+', label: 'Video Courses' },
            { value: '500', suffix: '+', label: 'Expert Teachers' },
            { value: '98', suffix: '%', label: 'Improved Scores' }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1.5">
              <ScrollCounter value={stat.value} suffix={stat.suffix} />
              <div className="text-xs text-brand-primary-light/80 uppercase tracking-wider font-mono font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials scrolling marquee */}
      <section className="py-20 border-b border-brand-border bg-brand-base overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-12 px-4">
          <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">What students & parents say</h2>
          <p className="text-brand-muted text-xs sm:text-sm mt-2">Notepediax is supercharging learning outcomes across Indian families.</p>
        </div>

        {/* Marquee row */}
        <div className="flex overflow-hidden relative w-full select-none gap-6 py-4">
          <div className="flex gap-6 animate-marquee shrink-0 hover:[animation-play-state:paused] cursor-pointer">
            {testimonials.concat(testimonials).map((t, idx) => (
              <div key={idx} className="w-[320px] bg-white dark:bg-brand-card rounded-2xl border border-brand-border p-5 shadow-sm shrink-0 flex flex-col justify-between">
                <p className="text-xs text-brand-muted leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-brand-text">{t.name}</h4>
                    <span className="text-[9px] text-brand-primary font-mono">{t.role}</span>
                  </div>
                  <div className="flex gap-0.5 text-brand-yellow">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border bg-brand-primary-light/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2 className="font-jakarta text-2xl sm:text-4xl text-brand-text font-bold leading-tight">Study anywhere - Download the Notepediax app</h2>
            <p className="text-brand-muted text-xs sm:text-sm max-w-xl">
              Access offline sheets, live lecture reminders, doubt cameras, and streak status trackers directly on your mobile device.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <a href="#" className="flex items-center gap-2 rounded-xl bg-brand-text text-white px-5 py-2.5 hover:bg-brand-primary transition-colors">
                <Smartphone className="h-5 w-5" />
                <div className="text-left font-mono text-[9px]">
                  <span>GET IT ON</span>
                  <span className="block text-xs font-bold">Google Play</span>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 rounded-xl bg-brand-text text-white px-5 py-2.5 hover:bg-brand-primary transition-colors">
                <Smartphone className="h-5 w-5" />
                <div className="text-left font-mono text-[9px]">
                  <span>DOWNLOAD ON THE</span>
                  <span className="block text-xs font-bold">App Store</span>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 w-full flex justify-center opacity-75">
            <div className="h-64 w-44 rounded-3xl border-4 border-brand-text bg-brand-card shadow-lg flex items-center justify-center font-mono text-xs text-brand-muted">
              App Mockup UI
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">Pricing Plans</h2>
            
            {/* Toggle bar */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-brand-primary' : 'text-brand-muted'}`}
              >
                Monthly billing
              </button>
              <div 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-11 h-6 bg-brand-primary-light border border-brand-border rounded-full p-1 cursor-pointer flex items-center"
              >
                <div 
                  className={`h-4.5 w-4.5 bg-brand-primary rounded-full shadow-sm transform transition-transform duration-200 ${billingCycle === 'yearly' ? 'translate-x-5' : ''}`}
                />
              </div>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-brand-primary' : 'text-brand-muted'}`}
              >
                Yearly billing
                <span className="bg-brand-pink/15 text-[8px] font-bold text-brand-pink border border-brand-pink/20 rounded-full px-2 py-0.5 uppercase tracking-wide">
                  30% Off
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {[
              { name: 'Free Starter', price: '₹0', features: ['5 AI Credits / Day', 'Preview 2 pages of Notes', 'Standard course files'] },
              { name: 'Pro Learner', price: billingCycle === 'monthly' ? '₹199' : '₹139', period: '/mo', features: ['Unlimited AI Credits', 'Unrestricted Notes Downloads', 'Study Groups & Whiteboards', 'Ad-free Video Chapters'], popular: true },
              { name: 'Premium Family', price: billingCycle === 'monthly' ? '₹499' : '₹349', period: '/mo', features: ['Everything in Pro', 'Mock Tests with AI Rank', 'Parent Dashboard link', 'Weekly WhatsApp analytics'] }
            ].map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01] ${
                  plan.popular 
                    ? 'border-2 border-brand-primary bg-white dark:bg-brand-card shadow-md ring-4 ring-brand-primary/5' 
                    : 'border border-brand-border bg-white dark:bg-brand-card shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary text-white text-[8px] font-bold uppercase tracking-wider px-3.5 py-1">
                    Most Popular
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-jakarta text-xs sm:text-sm font-bold text-brand-text">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-3">
                      <span className="font-sora font-extrabold text-2xl sm:text-3xl text-brand-text">{plan.price}</span>
                      {plan.period && <span className="text-[10px] text-brand-muted font-mono">{plan.period}</span>}
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-xs text-brand-muted">
                        <CheckCircle2 className="h-4.5 w-4.5 text-brand-green shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => alert('Checkout flow simulated!')}
                  className={`w-full mt-8 rounded-xl py-3 text-xs font-bold cursor-pointer text-center ${
                    plan.popular ? 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-sm' : 'border border-brand-border text-brand-muted hover:border-brand-primary hover:text-brand-primary bg-transparent'
                  }`}
                >
                  Subscribe
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-brand-border bg-brand-primary-light/10">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="font-jakarta text-2xl sm:text-3xl text-brand-text font-bold">Frequently Asked Questions</h2>
            <p className="text-brand-muted text-xs sm:text-sm mt-2">All you need to know about Notepediax platform plans and classrooms.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-brand-card rounded-2xl border border-brand-border overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-bold text-brand-text transition-colors hover:text-brand-primary"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-brand-muted transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180 text-brand-primary' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaqIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-brand-border"
                    >
                      <p className="px-5 py-4 text-xs text-brand-muted leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
