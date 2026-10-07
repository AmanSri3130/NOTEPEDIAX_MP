import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { engineApi } from '../services/api';
import ProfileHeaderWidget from '../components/personalized/ProfileHeaderWidget';
import MasteryTrackerWidget from '../components/personalized/MasteryTrackerWidget';
import RevisionAlertWidget from '../components/personalized/RevisionAlertWidget';
import RecommendationFeedWidget from '../components/personalized/RecommendationFeedWidget';
import DailyPlannerWidget from '../components/personalized/DailyPlannerWidget';
import OnboardModal from '../components/personalized/OnboardModal';
import DiagnosticModal from '../components/personalized/DiagnosticModal';
import CosmicLoader from '../components/animations/CosmicLoader';
import { Sparkles, Brain, AlertCircle, RefreshCw, Layers, Compass, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PersonalizedLearning() {
  const { user } = useAuth();

  const [studentId, setStudentId] = useState(() => {
    return localStorage.getItem('notepediax_student_id') || user?.id || null;
  });

  const [profile, setProfile] = useState(null);
  const [learnerState, setLearnerState] = useState(null);
  const [revisionDue, setRevisionDue] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [todayPlan, setTodayPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'MASTERY' | 'PLAN' | 'RECOMMENDATIONS'

  // Update studentId if user changes
  useEffect(() => {
    if (user?.id && !studentId) {
      setStudentId(user.id);
      localStorage.setItem('notepediax_student_id', user.id);
    }
  }, [user, studentId]);

  // Load all intelligence data for the student
  const fetchAllEngineData = useCallback(async (activeId = studentId, showLoading = true) => {
    if (!activeId) {
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Fetch learner state + profile
      try {
        const stateRes = await engineApi.getLearnerState(activeId);
        if (stateRes.success && stateRes.data) {
          setProfile(stateRes.data.profile);
          setLearnerState(stateRes.data.learner_state);
        }
      } catch (err) {
        console.warn('Learner state not found yet (new student):', err.message);
      }

      // 2. Fetch revision due items
      try {
        const revRes = await engineApi.getRevisionDue(activeId);
        if (revRes.success && revRes.data) {
          setRevisionDue(revRes.data);
        }
      } catch (err) {
        console.warn('Revision due fetch warning:', err.message);
      }

      // 3. Fetch recommendations
      try {
        const recRes = await engineApi.getRecommendations(activeId, 8);
        if (recRes.success && recRes.data) {
          setRecommendations(recRes.data.recommendations || []);
        }
      } catch (err) {
        console.warn('Recommendations fetch warning:', err.message);
      }

      // 4. Fetch today's study plan
      try {
        const planRes = await engineApi.getTodayPlan(activeId);
        if (planRes.success && planRes.data) {
          setTodayPlan(planRes.data);
        }
      } catch (err) {
        console.warn('Today plan fetch warning:', err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchAllEngineData(studentId, true);
    } else {
      setLoading(false);
    }
  }, [studentId, fetchAllEngineData]);

  const handleOnboardSuccess = (newStudent) => {
    setStudentId(newStudent.id);
    setProfile(newStudent);
    fetchAllEngineData(newStudent.id, true);
  };

  const handleDiagnosticComplete = () => {
    fetchAllEngineData(studentId, false);
  };

  const handleDataRefresh = () => {
    fetchAllEngineData(studentId, false);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Header & Goals Widget */}
      <ProfileHeaderWidget
        profile={profile}
        learnerState={learnerState}
        onOpenOnboard={() => setIsOnboardOpen(true)}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onRefresh={handleDataRefresh}
        loading={refreshing}
      />

      {/* If not onboarded yet, show friendly banner */}
      {!profile && !loading && (
        <div className="p-6 rounded-3xl border border-brand-orange/30 bg-brand-orange/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-text font-jakarta">
                Welcome to NotepediaX Adaptive Learning Engine!
              </h3>
              <p className="text-xs text-brand-muted mt-0.5">
                Set up your academic level and exam target to start personalized recommendation and schedule optimization.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Get Started Now
          </button>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex items-center justify-between border-b border-brand-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Modules', icon: Layers },
            { id: 'MASTERY', label: 'Knowledge & Retention', icon: Brain },
            { id: 'PLAN', label: 'Daily Planner', icon: Calendar },
            { id: 'RECOMMENDATIONS', label: 'Recommendations', icon: Compass },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary-light'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <span className="hidden sm:inline-block text-[11px] font-semibold text-brand-muted font-mono">
          Engine v0.3.0 • Online Supabase
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <CosmicLoader />
          <p className="text-xs font-semibold text-brand-muted mt-4">Connecting to Adaptive Learning Engine...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Grid: Knowledge State & Revision Alerts */}
          {(activeTab === 'ALL' || activeTab === 'MASTERY') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Topic Mastery Tracker */}
              <div className="lg:col-span-8">
                <MasteryTrackerWidget
                  learnerState={learnerState}
                  onTopicEventEmitted={handleDataRefresh}
                  loading={refreshing}
                />
              </div>

              {/* Right Column: Spaced Revision & Retention Alerts */}
              <div className="lg:col-span-4">
                <RevisionAlertWidget
                  revisionDueData={revisionDue}
                  onRevisionActionComplete={handleDataRefresh}
                  loading={refreshing}
                />
              </div>
            </div>
          )}

          {/* Daily Schedule & Planner */}
          {(activeTab === 'ALL' || activeTab === 'PLAN') && (
            <DailyPlannerWidget
              plan={todayPlan}
              studentId={studentId}
              onPlanUpdated={(newPlan) => {
                setTodayPlan(newPlan);
                handleDataRefresh();
              }}
              loading={refreshing}
            />
          )}

          {/* Ranked Recommendations Feed */}
          {(activeTab === 'ALL' || activeTab === 'RECOMMENDATIONS') && (
            <RecommendationFeedWidget
              recommendations={recommendations}
              onActivityComplete={handleDataRefresh}
              loading={refreshing}
            />
          )}
        </div>
      )}

      {/* Onboarding & Goals Modal */}
      <OnboardModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        onOnboardSuccess={handleOnboardSuccess}
        currentProfile={profile}
      />

      {/* Diagnostic Assessment Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        studentId={studentId}
        onDiagnosticComplete={handleDiagnosticComplete}
      />
    </div>
  );
}
