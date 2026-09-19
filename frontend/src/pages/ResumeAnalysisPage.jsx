import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Briefcase,
  Zap,
  Info
} from 'lucide-react';
import { analysisApi } from '../services/api';
import ScoreCard from '../components/ScoreCard';
import ProgressBar from '../components/ProgressBar';
import { CardSkeleton, AiThinkingState } from '../components/LoadingSkeleton';

const ResumeAnalysisPage = () => {
  const location = useLocation();
  const [analysis, setAnalysis] = useState(location.state?.analysis || null);
  const [loading, setLoading] = useState(!location.state?.analysis);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!analysis) {
      fetchLatestAnalysis();
    }
  }, [analysis]);

  const fetchLatestAnalysis = async () => {
    try {
      const res = await analysisApi.getLatest();
      if (res.data.analysis) {
        setAnalysis(res.data.analysis);
      } else {
        setError('No resume analysis found. Please upload and analyze a resume first.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch resume analysis.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <AiThinkingState message="Loading your comprehensive Resume Quality Score..." />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">No Analysis Available</h2>
        <p className="text-xs text-slate-400">{error || 'Upload your PDF resume to generate your score.'}</p>
        <Link
          to="/resume"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold"
        >
          Go to Resume Upload <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const scores = analysis.categoryScores || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Role Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Resume Quality Audit</h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent/15 text-brand-accent border border-brand-accent/30">
              {analysis.targetRole}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deep analytical breakdown of structure, quantifiable impacts, action verbs, and keyword density.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-brand-primary/25 flex items-center gap-2 hover:opacity-95 transition-all"
          >
            <Briefcase className="w-4 h-4" />
            Match with Job Description
          </Link>
        </div>
      </div>

      {/* Required ATS Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">AI Compatibility Disclaimer:</strong> {analysis.disclaimer}
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ScoreCard
            title="Overall Resume Quality Score"
            score={analysis.overallScore}
            subtitle="Calculated across 8 core resume engineering categories."
            size="large"
          />
        </div>

        {/* 8 Subcategory Progress Bars */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-accent" />
            Category Score Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 pt-2">
            <ProgressBar label="Technical Skills" value={scores.skills} color="indigo" />
            <ProgressBar label="Projects Demonstration" value={scores.projects} color="cyan" />
            <ProgressBar label="Work & Internships" value={scores.experience} color="emerald" />
            <ProgressBar label="Education & Credentials" value={scores.education} color="indigo" />
            <ProgressBar label="Target Keywords" value={scores.keywords} color="amber" />
            <ProgressBar label="Quantifiable Metrics" value={scores.achievements} color="rose" />
            <ProgressBar label="Formatting & Structure" value={scores.structure} color="cyan" />
            <ProgressBar label="Role Relevance" value={scores.relevance} color="emerald" />
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Key Strengths Identified ({analysis.strengths?.length || 0})
          </h3>
          <ul className="space-y-2.5">
            {analysis.strengths?.map((str, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Opportunities */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Areas for Enhancement ({analysis.weaknesses?.length || 0})
          </h3>
          <ul className="space-y-2.5">
            {analysis.weaknesses?.map((weak, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Verbs & Metrics Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Verbs */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-accent" />
              Action Verbs Analysis
            </h3>
            <span className="text-[11px] text-slate-400">
              {analysis.actionVerbs?.strong?.length || 0} active verbs
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Strong Verbs Found:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {analysis.actionVerbs?.strong?.map((verb, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                >
                  {verb}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
            {analysis.actionVerbs?.feedback || 'Good dynamic action verbs detected throughout the resume.'}
          </p>
        </div>

        {/* Quantifiable Achievements */}
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Quantifiable Impact Metrics
            </h3>
            <span className="text-xs font-bold text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              {analysis.quantifiableAchievements?.count || 0} Metrics
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {analysis.quantifiableAchievements?.feedback || 'Including quantitative metrics like throughput, latency, or percent gains elevates recruiter engagement.'}
          </p>

          {analysis.quantifiableAchievements?.examples?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {analysis.quantifiableAchievements.examples.map((ex, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700"
                >
                  {ex}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bullet Point Improvements (Before vs After) */}
      {analysis.bulletImprovements?.length > 0 && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              Suggested Bullet Point Transformations
            </h3>
            <p className="text-xs text-slate-400">
              Transform passive task descriptions into measurable accomplishments without exaggerating credentials.
            </p>
          </div>

          <div className="space-y-4">
            {analysis.bulletImprovements.map((bullet, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">
                    Original Bullet:
                  </span>
                  <p className="text-xs text-slate-400 italic bg-dark-900/60 p-2.5 rounded-lg border border-slate-800">
                    "{bullet.original}"
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                    AI Recommended Enhancement:
                  </span>
                  <p className="text-xs text-slate-200 font-medium bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-200">
                    "{bullet.suggested}"
                  </p>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  <strong className="text-slate-300">Rationale:</strong> {bullet.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysisPage;
