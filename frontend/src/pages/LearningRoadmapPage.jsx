import React, { useState, useEffect } from 'react';
import {
  Map,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen,
  Code,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { roadmapApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AiThinkingState } from '../components/LoadingSkeleton';

const LearningRoadmapPage = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await roadmapApi.getLatest();
      setRoadmap(res.data.roadmap);
    } catch (err) {
      setError(err.message || 'Failed to load roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await roadmapApi.generate({});
      setRoadmap(res.data.roadmap);
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <AiThinkingState message="Formulating your customized 4-week technical learning roadmap..." />
      </div>
    );
  }

  const weeklyPlan = roadmap?.weeklyPlan || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Map className="w-7 h-7 text-emerald-400" />
              Personalized Learning Roadmap
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {roadmap?.targetRole || user?.targetRole}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Structured week-by-week technical curriculum designed to bridge verified skill gaps and optimize interview readiness.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Regenerate Roadmap
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {weeklyPlan.length > 0 ? (
        <div className="space-y-6">
          {weeklyPlan.map((week, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800 relative overflow-hidden"
            >
              <div className="glow-primary w-40 h-40 -top-10 -right-10 bg-emerald-500/10" />

              {/* Week Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-sm border border-emerald-500/30 font-mono">
                    WEEK {week.week}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{week.title}</h3>
                    <p className="text-xs text-brand-accent font-medium">Focus Skill: {week.skill}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Difficulty: <strong className="text-white">{week.difficulty}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    ~{week.estimatedHours} hrs
                  </span>
                </div>
              </div>

              {/* Content Grid: Prerequisites, Topics, Suggested Practice */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Prerequisites */}
                <div className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                    Prerequisites
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {week.prerequisites?.map((pre, pIdx) => (
                      <li key={pIdx}>{pre}</li>
                    ))}
                  </ul>
                </div>

                {/* Core Learning Topics */}
                <div className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Topics to Master
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {week.topics?.map((top, tIdx) => (
                      <li key={tIdx}>{top}</li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Hands-on Practice */}
                <div className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    Hands-On Practice
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {week.suggestedPractice?.map((prac, prIdx) => (
                      <li key={prIdx}>{prac}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 glass-card rounded-2xl text-center space-y-4 border border-dashed border-slate-800">
          <Map className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Roadmap Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click below to generate a tailored 4-week roadmap based on your current resume and target career role.
          </p>
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-lg shadow-brand-primary/20"
          >
            Generate My Roadmap
          </button>
        </div>
      )}
    </div>
  );
};

export default LearningRoadmapPage;
