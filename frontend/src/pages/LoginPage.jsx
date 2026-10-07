import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock } from 'lucide-react';

// UI components
import GlowButton from '../components/ui/GlowButton';
import Logo from '../components/ui/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await login(email, password);
    if (res?.success && res?.data?.role) {
      navigate(`/dashboard/${res.data.role}`);
    } else if (res?.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-cosmic-base">
      <div className="w-full max-w-md space-y-8 cosmic-glass p-8 rounded-3xl shadow-glow-sm border border-cosmic-border">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-4 hover:opacity-95 transition-opacity">
            <Logo size="lg" showTagline={true} />
          </Link>
          <h2 className="font-display text-2xl text-cosmic-text">
            Welcome Back
          </h2>
          <p className="mt-2 text-xs text-cosmic-muted">
            Sign in to resume your learning streaks
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-cosmic-border bg-cosmic-base/80 py-3 pl-10 pr-4 text-xs outline-none text-cosmic-text focus:border-cosmic-cyan"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-cosmic-border bg-cosmic-base/80 py-3 pl-10 pr-4 text-xs outline-none text-cosmic-text focus:border-cosmic-cyan"
              />
            </div>

          </div>

          <div>
            <GlowButton
              type="submit"
              variant="primary"
              className="w-full text-xs"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Log In'}
            </GlowButton>
          </div>
        </form>

        {/* Redirect */}
        <div className="text-center text-xs">
          <span className="text-cosmic-muted">Don't have an account? </span>
          <Link to="/register" className="font-semibold text-cosmic-cyan hover:text-cosmic-text transition-colors">
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}
