import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, ChevronDown, LogOut,
  LayoutDashboard, Sparkles, Search,
  Compass, FileText, Bot, ArrowRight, ShieldCheck, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ui/ThemeToggle';
import CartIcon from './cart/CartIcon';
import Logo from './ui/Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'courses' | 'notes' | 'ai' | null
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const coursesMenu = [
    { title: 'For Kids (Class 1–8)', subtitle: 'Coding, Math, English foundations', path: '/courses?category=Kids' },
    { title: 'CBSE Board (Class 6–12)', subtitle: 'Curriculum & Boards alignment', path: '/courses?category=Boards' },
    { title: 'ICSE Board (Class 6–12)', subtitle: 'Comprehensive syllabus training', path: '/courses?category=Boards' },
    { title: 'JEE Main & Advanced', subtitle: 'Crack IIT Admissions prep', path: '/courses?category=JEE' },
    { title: 'NEET Undergrad prep', subtitle: 'Crack Medical College exams', path: '/courses?category=NEET' },
    { title: 'UPSC & Govt Exams', subtitle: 'Civil service & state tests prep', path: '/courses?category=Boards' }
  ];

  const notesMenu = [
    { title: 'By Subject notes', subtitle: 'Physics, Chemistry, Maths, Bio', path: '/notes?filter=Subject' },
    { title: 'By Exam Board', subtitle: 'CBSE, ICSE & State books', path: '/notes?filter=Board' },
    { title: 'By Class Grade', subtitle: 'Class 6 to 12 study booklets', path: '/notes?filter=Class' },
    { title: 'Handwritten Sheets', subtitle: 'Topper classroom notebooks', path: '/notes?filter=Handwritten' },
    { title: 'Formula Sheets booklet', subtitle: 'Quick revisions summaries', path: '/notes?filter=Formulas' }
  ];

  const aiToolsMenu = [
    { title: 'AI Doubt Solver', subtitle: 'Instant step-by-step logic replies', path: '/ai-tools?tool=doubt' },
    { title: 'AI Note Summariser', subtitle: 'Upload PDFs to extract highlights', path: '/ai-tools?tool=summarise' },
    { title: 'AI Quiz Generator', subtitle: 'Custom mock assessments creator', path: '/ai-tools?tool=quiz' },
    { title: 'AI Flashcard Maker', subtitle: 'Build revision sets from context', path: '/ai-tools?tool=flashcard' },
    { title: 'AI Study Planner', subtitle: 'Auto-schedule study calendars', path: '/ai-tools?tool=planner' },
    { title: 'AI Mentor Chatbot', subtitle: 'Ask career paths guidance questions', path: '/ai-tools?tool=mentor' }
  ];

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'border-b border-brand-border/60 bg-white/90 dark:bg-brand-base/90 backdrop-blur-xl shadow-sm' 
          : 'border-b border-brand-border bg-white dark:bg-brand-base'
      }`}
      onMouseLeave={() => setActiveMegaMenu(null)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 shrink-0 py-1 hover:opacity-95 transition-opacity">
              <Logo size="sm" showTagline={true} />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6">
              
              {/* Courses Toggle */}
              <div 
                className="relative py-5 cursor-pointer"
                onMouseEnter={() => setActiveMegaMenu('courses')}
              >
                <span className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                  activeMegaMenu === 'courses' ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-text'
                }`}>
                  Courses
                  <ChevronDown className={`h-4 w-4 transition-transform duration-250 ${activeMegaMenu === 'courses' ? 'rotate-180 text-brand-primary' : ''}`} />
                </span>
              </div>

              {/* Notes Toggle */}
              <div 
                className="relative py-5 cursor-pointer"
                onMouseEnter={() => setActiveMegaMenu('notes')}
              >
                <span className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                  activeMegaMenu === 'notes' ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-text'
                }`}>
                  Notes Library
                  <ChevronDown className={`h-4 w-4 transition-transform duration-250 ${activeMegaMenu === 'notes' ? 'rotate-180 text-brand-primary' : ''}`} />
                </span>
              </div>

              {/* AI Tools Toggle */}
              <div 
                className="relative py-5 cursor-pointer"
                onMouseEnter={() => setActiveMegaMenu('ai')}
              >
                <span className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                  activeMegaMenu === 'ai' ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-text'
                }`}>
                  AI Tools
                  <ChevronDown className={`h-4 w-4 transition-transform duration-250 ${activeMegaMenu === 'ai' ? 'rotate-180 text-brand-primary' : ''}`} />
                </span>
              </div>

              <Link to="/mock-test" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors">
                Mock Tests
              </Link>
              <Link to="/leaderboard" className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors">
                Leaderboard
              </Link>
              <Link to="/ai-tutor" className="text-sm font-semibold flex items-center gap-1.5 text-indigo-500 hover:text-indigo-400 transition-colors">
                <Brain className="h-4 w-4" /> AI Tutor
              </Link>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            
            {/* Animated Search Bar Toggle */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.form 
                    onSubmit={handleSearchSubmit}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute right-9 bg-white dark:bg-brand-card border border-brand-border rounded-xl shadow-sm overflow-hidden flex items-center"
                  >
                    <input 
                      type="text" 
                      placeholder="Search JEE, NEET, Boards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-1.5 w-full text-xs outline-none text-brand-text bg-transparent"
                      autoFocus
                    />
                  </motion.form>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-xl text-brand-muted hover:text-brand-text transition-colors cursor-pointer hover:bg-brand-primary-light"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Cart Icon */}
            {user && <CartIcon />}

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* Account Switchers / Free Trial buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-card px-3 py-1.5 text-xs font-semibold hover:border-brand-primary transition-colors cursor-pointer shadow-sm"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-primary to-brand-orange text-white text-[10px] font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="max-w-[80px] truncate text-brand-text">{user.name}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-brand-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-brand-border bg-white dark:bg-brand-card p-1.5 shadow-lg z-50">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-brand-text hover:bg-brand-primary-light"
                      >
                        <LayoutDashboard className="h-4 w-4 text-brand-primary" />
                        Dashboard
                      </Link>
                      {(user.role === 'admin' || user.role === 'school_admin') && (
                        <Link
                          to="/admin/payments"
                          onClick={() => setDropdownOpen(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-brand-text hover:bg-brand-primary-light"
                        >
                          <ShieldCheck className="h-4 w-4 text-brand-orange" />
                          Verify Payments
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-text px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="relative inline-flex items-center justify-center rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold tracking-wider text-white hover:bg-brand-orange/95 hover:shadow-md border border-brand-orange/20 transition-all font-jakarta shadow-sm"
                  >
                    Free Trial
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-brand-muted hover:bg-brand-primary-light"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mega Menus Dropdowns Dropdowns */}
      <AnimatePresence>
        {activeMegaMenu && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:block absolute left-0 right-0 bg-white dark:bg-brand-card border-b border-brand-border shadow-lg z-40 py-8 px-4"
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="mx-auto max-w-7xl grid grid-cols-12 gap-8">
              
              {/* Left visual accent helper */}
              <div className="col-span-3 bg-brand-primary-light dark:bg-brand-base rounded-2xl p-6 flex flex-col justify-between border border-brand-border/40">
                <div>
                  <h4 className="font-jakarta text-sm font-bold text-brand-primary flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-brand-orange animate-pulse" />
                    Notepediax AI Core
                  </h4>
                  <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                    Access real-time lecture streams, curriculum note boards, exam mock modules, and custom student AI mentor bots.
                  </p>
                </div>
                <Link 
                  to="/register" 
                  onClick={() => setActiveMegaMenu(null)}
                  className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:gap-1.5 transition-all mt-4"
                >
                  Join Free Trial <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Right column listing */}
              <div className="col-span-9 grid grid-cols-3 gap-6">
                
                {/* Courses Listing */}
                {activeMegaMenu === 'courses' && (
                  coursesMenu.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setActiveMegaMenu(null)}
                      className="p-3 rounded-xl hover:bg-brand-primary-light transition-colors group flex items-start gap-3"
                    >
                      <div className="h-8 w-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                        <Compass className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-brand-text group-hover:text-brand-primary transition-colors">{item.title}</h5>
                        <p className="text-[10px] text-brand-muted mt-0.5 leading-normal">{item.subtitle}</p>
                      </div>
                    </Link>
                  ))
                )}

                {/* Notes Listing */}
                {activeMegaMenu === 'notes' && (
                  notesMenu.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setActiveMegaMenu(null)}
                      className="p-3 rounded-xl hover:bg-brand-primary-light transition-colors group flex items-start gap-3"
                    >
                      <div className="h-8 w-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-brand-text group-hover:text-brand-primary transition-colors">{item.title}</h5>
                        <p className="text-[10px] text-brand-muted mt-0.5 leading-normal">{item.subtitle}</p>
                      </div>
                    </Link>
                  ))
                )}

                {/* AI Tools Listing */}
                {activeMegaMenu === 'ai' && (
                  aiToolsMenu.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setActiveMegaMenu(null)}
                      className="p-3 rounded-xl hover:bg-brand-primary-light transition-colors group flex items-start gap-3"
                    >
                      <div className="h-8 w-8 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-brand-text group-hover:text-brand-orange transition-colors">{item.title}</h5>
                        <p className="text-[10px] text-brand-muted mt-0.5 leading-normal">{item.subtitle}</p>
                      </div>
                    </Link>
                  ))
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-brand-border bg-white dark:bg-brand-base px-4 pb-6 pt-3 space-y-4 overflow-y-auto max-h-[80vh]"
          >
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search study chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 text-xs border border-brand-border rounded-xl w-full outline-none text-brand-text bg-brand-card focus:border-brand-primary"
              />
              <button type="submit" className="rounded-xl bg-brand-primary text-white px-3 py-2 text-xs font-bold">Go</button>
            </form>

            {/* Mobile Appearance Selector */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border pb-3">
              <span className="text-xs font-bold text-brand-text">Appearance Mode</span>
              <ThemeToggle />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brand-primary tracking-wider uppercase block px-4 py-1">Courses</span>
              {coursesMenu.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-brand-text hover:bg-brand-primary-light flex items-center justify-between"
                >
                  <span>{item.title}</span>
                  <ChevronDown className="h-3 w-3 -rotate-90 text-brand-muted" />
                </Link>
              ))}

              <span className="text-[10px] font-bold text-brand-primary tracking-wider uppercase block px-4 py-3">Study Notes</span>
              {notesMenu.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-brand-text hover:bg-brand-primary-light flex items-center justify-between"
                >
                  <span>{item.title}</span>
                  <ChevronDown className="h-3 w-3 -rotate-90 text-brand-muted" />
                </Link>
              ))}

              <span className="text-[10px] font-bold text-brand-orange tracking-wider uppercase block px-4 py-3">AI Widgets</span>
              {aiToolsMenu.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-brand-text hover:bg-brand-primary-light flex items-center justify-between"
                >
                  <span>{item.title}</span>
                  <ChevronDown className="h-3 w-3 -rotate-90 text-brand-muted" />
                </Link>
              ))}
            </div>

            <hr className="border-brand-border" />
            
            <div className="flex flex-col gap-2 pt-2 px-2">
              <Link to="/mock-test" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-brand-text hover:bg-brand-primary-light">
                Mock Test Series
              </Link>
              <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-brand-text hover:bg-brand-primary-light">
                Leaderboard Rankings
              </Link>
            </div>

            <hr className="border-brand-border" />
            
            {user ? (
              <div className="space-y-2 px-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-brand-text hover:bg-brand-primary-light flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4 text-brand-primary" />
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout Account
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 px-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-xl border border-brand-border py-2.5 text-center text-xs font-bold text-brand-text hover:bg-brand-primary-light"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-xl bg-brand-orange py-2.5 text-center text-xs font-bold text-white shadow-sm"
                >
                  Free Trial
                </Link>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
