import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// Layout & UI
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomCursor from './components/ui/CustomCursor';
import CosmicLoader from './components/animations/CosmicLoader';
import NotepediaXChatbot from './modules/notepediax-chatbot';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const CoursePlayer = lazy(() => import('./pages/CoursePlayer'));
const Notes = lazy(() => import('./pages/Notes'));
const AITools = lazy(() => import('./pages/AITools'));
const MockTest = lazy(() => import('./pages/MockTest'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const LiveClass = lazy(() => import('./pages/LiveClass'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const PersonalizedLearning = lazy(() => import('./pages/PersonalizedLearning'));

// Animated Page HOC
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="w-full"
  >
    {children}
  </motion.div>
);

// Protected Router Check
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <CosmicLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Route component wrapper to pass location to AnimatePresence
function AnimatedRoutes() {
  const location = useLocation();
  const { loading } = useAuth();

  if (loading) return <CosmicLoader />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        
        {/* Core Products */}
        <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
        <Route path="/courses/:id" element={<PageTransition><CourseDetail /></PageTransition>} />
        <Route path="/notes" element={<PageTransition><Notes /></PageTransition>} />
        <Route path="/ai-tools" element={<PageTransition><AITools /></PageTransition>} />
        <Route path="/personalized-learning" element={<PageTransition><PersonalizedLearning /></PageTransition>} />
        <Route path="/dashboard/personalized" element={<PageTransition><PersonalizedLearning /></PageTransition>} />
        
        {/* Private Dashboards */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses/:id/player" 
          element={
            <ProtectedRoute>
              <PageTransition><CoursePlayer /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/live-class" 
          element={
            <ProtectedRoute>
              <PageTransition><LiveClass /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mock-test" 
          element={
            <ProtectedRoute>
              <PageTransition><MockTest /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute>
              <PageTransition><Leaderboard /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <PageTransition><Cart /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <PageTransition><Checkout /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/payments" 
          element={
            <ProtectedRoute>
              <PageTransition><AdminPayments /></PageTransition>
            </ProtectedRoute>
          } 
        />

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-bg-base text-text-body font-body selection:bg-brand-primary/40 select-none relative overflow-hidden">
          {/* Custom Cursor Dot */}
          <CustomCursor />
          
          {/* Noise background grain filter */}
          <div className="noise-bg" />

          {/* Global Ambient Glow Orbs */}
          <div className="absolute top-1/4 left-[-10%] w-[450px] h-[450px] rounded-full bg-brand-accent/5 dark:bg-brand-accent/10 blur-[130px] pointer-events-none z-0" />
          <div className="absolute top-2/3 right-[-10%] w-[550px] h-[550px] rounded-full bg-brand-primary/5 dark:bg-brand-primary/5 blur-[160px] pointer-events-none z-0" />
          
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'bg-bg-card text-text-primary border border-border-base text-xs font-semibold rounded-xl px-5 py-3 shadow-lg relative z-50',
              duration: 3500,
            }}
          />

          <Navbar />
          
          <main className="flex-grow z-10 relative">
            <Suspense fallback={<CosmicLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </main>

          <Footer />

          {/* Self-Contained AI Chatbot Companion */}
          <NotepediaXChatbot />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
