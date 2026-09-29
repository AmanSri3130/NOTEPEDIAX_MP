import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Logo from './ui/Logo';

export default function Footer() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to Notepediax newsletters!');
  };

  return (
    <footer className="relative border-t border-brand-border bg-white dark:bg-brand-base py-12 px-4 sm:px-6 lg:px-8 z-10 transition-colors duration-300">
      
      {/* Top thin brand gradient line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-brand-primary via-brand-orange to-brand-pink opacity-60 shadow-sm" />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-block self-start hover:opacity-95 transition-opacity">
              <Logo size="md" showTagline={true} />
            </Link>
            <p className="text-xs text-brand-muted leading-relaxed">
              India's premium, AI-powered EdTech suite designed to supercharge student learning, track study streaks, and make notes interactive.
            </p>
            <div className="flex items-center gap-4 text-brand-muted">
              {/* YouTube Icon */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors" aria-label="YouTube">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" className="hover:text-brand-primary transition-colors" aria-label="Twitter">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="hover:text-brand-primary transition-colors" aria-label="LinkedIn">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" className="hover:text-brand-primary transition-colors" aria-label="GitHub">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-jakarta text-xs font-bold text-brand-text uppercase tracking-wider">Platform</h3>
            <ul className="mt-4 space-y-2 text-xs text-brand-muted">
              <li><Link to="/courses" className="hover:text-brand-primary transition-colors">Video Courses</Link></li>
              <li><Link to="/notes" className="hover:text-brand-primary transition-colors">Notes Library</Link></li>
              <li><Link to="/ai-tools" className="hover:text-brand-primary transition-colors flex items-center gap-1">AI Tools Suite <Sparkles className="h-3 w-3 text-brand-orange animate-pulse" /></Link></li>
              <li><Link to="/leaderboard" className="hover:text-brand-primary transition-colors">Leaderboards</Link></li>
            </ul>
          </div>

          {/* Institutional Links */}
          <div>
            <h3 className="font-jakarta text-xs font-bold text-brand-text uppercase tracking-wider">Institutional</h3>
            <ul className="mt-4 space-y-2 text-xs text-brand-muted">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Notepediax for Schools</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Partner Program</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Careers Board</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy & Terms</a></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="flex flex-col gap-4">
            <h3 className="font-jakarta text-xs font-bold text-brand-text uppercase tracking-wider">Join Newsletter</h3>
            <p className="text-xs text-brand-muted">
              Receive the latest revision frameworks and AI updates direct.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="w-full rounded-xl border border-brand-border bg-brand-card px-3 py-2 text-xs outline-none text-brand-text focus:border-brand-primary"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-primary-dark transition-colors shadow-sm"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        <div className="mt-8 border-t border-brand-border pt-8 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-brand-light font-mono">
            &copy; {new Date().getFullYear()} Notepediax. All rights reserved.
          </p>
          <span className="text-[10px] text-brand-pink font-mono tracking-wider">
            MADE WITH ❤️ FOR STUDENTS OF INDIA 🇮🇳
          </span>
        </div>
      </div>
    </footer>
  );
}
