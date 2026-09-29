import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Map a Supabase session/user object to our app's user shape
  const mapSupabaseUser = (supabaseUser) => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      _id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      role: supabaseUser.user_metadata?.role || 'student',
      phone: supabaseUser.user_metadata?.phone || null,
      targetExam: supabaseUser.user_metadata?.targetExam || null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
    };
  };

  // Listen to auth state changes (handles page refresh, tab switch, etc.)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = async (name, email, password, role = 'student', phone = null, targetExam = null) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, phone, targetExam },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Also insert into our custom users table so backend queries work
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            name,
            email: email.toLowerCase(),
            role,
            phone,
          }, { onConflict: 'id' });
        } catch (_) { /* non-critical */ }

        toast.success('Registration successful! Welcome to Notepediax.');
        return { success: true };
      }

      return { success: false, message: 'Registration did not complete.' };
    } catch (error) {
      const msg = error.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.user) {
        const mappedUser = mapSupabaseUser(data.user);
        toast.success(`Welcome back, ${mappedUser.name}!`);
        return { success: true };
      }

      return { success: false, message: 'Login did not complete.' };
    } catch (error) {
      const msg = error.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Logged out successfully.');
    } catch (error) {
      toast.error('Error logging out.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
