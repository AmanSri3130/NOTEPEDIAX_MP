import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Users, Briefcase, UserCheck } from 'lucide-react';

// UI components
import GlowButton from '../components/ui/GlowButton';
import Logo from '../components/ui/Logo';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('free_student');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await register(name, email, password, role);
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
            Create Account
          </h2>
          <p className="mt-2 text-xs text-cosmic-muted">
            Start learning and earning XP points
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Name */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-cosmic-border bg-cosmic-base/80 py-3 pl-10 pr-4 text-xs outline-none text-cosmic-text focus:border-cosmic-cyan"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-xl border border-cosmic-border bg-cosmic-base/80 py-3 pl-10 pr-4 text-xs outline-none text-cosmic-text focus:border-cosmic-cyan"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 dark:text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full rounded-xl border border-cosmic-border bg-cosmic-base/80 py-3 pl-10 pr-4 text-xs outline-none text-cosmic-text focus:border-cosmic-cyan"
              />
            </div>


            {/* Role Buttons */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-cosmic-muted uppercase tracking-wider block">Choose Profile Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'free_student', label: 'Free Student', icon: User },
                  { id: 'elite_student', label: 'Elite Student', icon: Users },
                  { id: 'teacher', label: 'Teacher', icon: Briefcase },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id)}
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all cursor-pointer ${
                        role === item.id 
                          ? 'border-cosmic-cyan bg-cosmic-cyan/5 text-cosmic-cyan font-semibold shadow-glow-cyan' 
                          : 'border-cosmic-border bg-cosmic-base hover:bg-cosmic-surface/60 text-cosmic-muted hover:text-cosmic-text'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div>
            <GlowButton
              type="submit"
              variant="primary"
              className="w-full text-xs"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Sign Up'}
            </GlowButton>
          </div>
        </form>

        {/* Redirect */}
        <div className="text-center text-xs">
          <span className="text-cosmic-muted">Already have an account? </span>
          <Link to="/login" className="font-semibold text-cosmic-cyan hover:text-cosmic-text transition-colors">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
