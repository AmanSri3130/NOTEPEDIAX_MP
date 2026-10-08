import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, TrendingUp, BookOpen, BarChart2 } from 'lucide-react';
import { fastapiService } from '../services/fastapiService';

export default function CoverageDashboard() {
  const [data, setData] = useState<any>(null);
  const [learnerData, setLearnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(async () => {
      const learner = await fastapiService.getStudentState('student_001');
      setLearnerData(learner);
      setData({
        topGaps: [
          { query: "How does a PN junction diode work?", userClass: "Class 12", count: 24 },
          { query: "What is photosynthesis?", userClass: "Class 9", count: 18 },
          { query: "Explain Bernoulli's theorem", userClass: "Class 11", count: 12 },
          { query: "UPSC essay writing structure", userClass: "UPSC", count: 9 },
          { query: "Trigonometric identities proof", userClass: "Class 11", count: 7 },
        ],
        coverageStats: [
          { chapter: "Kinematics", subject: "Physics", classOrLevel: "Class 11", chunkCount: 28, coverageStatus: "good", contentTypeMix: { theory: 10, formula: 8, solved_example: 5, PYQ: 5 } },
          { chapter: "A Letter to God", subject: "English", classOrLevel: "Class 10", chunkCount: 7, coverageStatus: "thin", contentTypeMix: { prose: 5, solved_example: 2 } },
          { chapter: "Organic Chemistry", subject: "Chemistry", classOrLevel: "Class 12", chunkCount: 0, coverageStatus: "none", contentTypeMix: {} },
          { chapter: "Photosynthesis", subject: "Biology", classOrLevel: "Class 9", chunkCount: 3, coverageStatus: "thin", contentTypeMix: { theory: 3 } },
          { chapter: "Profit & Loss", subject: "Mathematics", classOrLevel: "Class 10", chunkCount: 15, coverageStatus: "good", contentTypeMix: { formula: 5, solved_example: 10 } },
        ]
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-400 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading Coverage Data...
        </div>
      </div>
    );
  }

  const masteryEntries = Object.entries(learnerData?.mastery || {});

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Coverage Dashboard</h1>
          <p className="text-slate-400 text-sm">Admin view · Corpus health and student learning analytics</p>
        </div>

        {/* Learner Analytics from Engine */}
        {learnerData && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" /> Learner Engine Analytics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {masteryEntries.map(([subject, score]: any) => (
                <motion.div
                  key={subject}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800 border border-slate-700/50 rounded-xl p-4"
                >
                  <p className="text-xs text-slate-400 mb-2 font-medium">{subject}</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">{Math.round(score * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score * 100}%` }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className={`h-full rounded-full ${score > 0.7 ? 'bg-emerald-500' : score > 0.4 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-800 border border-amber-500/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Weak Topics Detected
                </h3>
                <div className="space-y-2">
                  {learnerData.weak_topics?.map((t: string) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800 border border-rose-500/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Spaced Revision Due
                </h3>
                <div className="space-y-2">
                  {learnerData.revision_due?.map((t: string) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Gaps and Corpus Coverage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400" /> Top Content Gaps
            </h2>
            <p className="text-xs text-slate-400 mb-4">Queries with no retrieval hit — add content for these topics.</p>
            <div className="space-y-3">
              {data.topGaps.map((gap: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-white truncate">"{gap.query}"</p>
                    <p className="text-xs text-slate-400 mt-0.5">{gap.userClass}</p>
                  </div>
                  <span className="ml-3 shrink-0 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded text-xs font-bold">
                    {gap.count} misses
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-400" /> Taxonomy Coverage
            </h2>
            <p className="text-xs text-slate-400 mb-4">Chunk density per curriculum node.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left pb-2 text-xs font-semibold text-slate-400">Topic</th>
                    <th className="text-left pb-2 text-xs font-semibold text-slate-400">Class</th>
                    <th className="text-right pb-2 text-xs font-semibold text-slate-400">Chunks</th>
                    <th className="text-right pb-2 text-xs font-semibold text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {data.coverageStats.map((stat: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3">
                        <p className="font-medium text-white">{stat.chapter}</p>
                        <p className="text-xs text-slate-400">{stat.subject}</p>
                      </td>
                      <td className="py-3 text-slate-300 text-xs">{stat.classOrLevel}</td>
                      <td className="py-3 text-right text-slate-300 font-mono text-xs">{stat.chunkCount}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          stat.coverageStatus === 'good' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          stat.coverageStatus === 'thin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {stat.coverageStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
