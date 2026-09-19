import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  BookOpen,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { interviewApi } from '../services/api';
import ScoreCard from '../components/ScoreCard';
import ProgressBar from '../components/ProgressBar';
import { AiThinkingState } from '../components/LoadingSkeleton';

const InterviewResultsPage = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const res = await interviewApi.getById(id);
      setSession(res.data.session);

      // Trigger celebratory confetti if score is solid!
      if (res.data.session?.overallInterviewScore >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load interview results.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <AiThinkingState message="Calculating final interview rubric performance & recommendations..." />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Results Unavailable</h2>
        <p className="text-xs text-slate-400">{error || 'Session not found.'}</p>
        <Link
          to="/interview"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold"
        >
          Return to Interview Coach <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const categoryPerf = session.categoryPerformance || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interview Performance Scorecard</h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent/15 text-brand-accent border border-brand-accent/30 capitalize">
              {session.interviewType}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Comprehensive evaluation for <strong className="text-slate-200">{session.targetRole}</strong> across {session.totalQuestions} questions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/interview"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Practice Another
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md shadow-brand-primary/20 flex items-center gap-2 transition-all"
          >
            Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScoreCard
          title="Overall Interview Score"
          score={session.overallInterviewScore}
          subtitle={session.summaryFeedback}
          size="large"
        />

        {/* 4 Rubric Dimensions */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-accent" />
            Evaluation Rubric Breakdown
          </h3>

          <div className="space-y-3.5 pt-2">
            <ProgressBar
              label="Technical Accuracy (Correctness of engineering concepts)"
              value={categoryPerf.technicalAccuracy}
              color="indigo"
            />
            <ProgressBar
              label="Relevance (Directness and focus on the question prompt)"
              value={categoryPerf.relevance}
              color="cyan"
            />
            <ProgressBar
              label="Completeness (Coverage of trade-offs & edge cases)"
              value={categoryPerf.completeness}
              color="emerald"
            />
            <ProgressBar
              label="Communication (Clarity, technical phrasing & structured flow)"
              value={categoryPerf.communication}
              color="amber"
            />
          </div>
        </div>
      </div>

      {/* Strong & Weak Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Demonstrated Strengths
          </h3>
          <ul className="space-y-2">
            {session.strongAreas?.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Areas for Refinement
          </h3>
          <ul className="space-y-2">
            {session.weakAreas?.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Topics */}
      {session.recommendedTopics?.length > 0 && (
        <div className="glass-card rounded-2xl p-6 space-y-3 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-accent flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Recommended Practice Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {session.recommendedTopics.map((topic, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-slate-300">
                {topic}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Review */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-primary" />
          Question-by-Question Diagnostic Review
        </h3>

        <div className="space-y-4">
          {session.questions.map((q, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-dark-850 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <span className="text-xs font-bold text-white">
                  Q{q.questionNumber}: {q.questionText}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">{q.category}</span>
                  <span className="px-2.5 py-0.5 rounded font-extrabold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                    {q.evaluation?.overallScore || 0}/10
                  </span>
                </div>
              </div>

              {q.userAnswer && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Your Answer:</span>
                  <p className="text-xs text-slate-300 bg-dark-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed font-mono">
                    "{q.userAnswer}"
                  </p>
                </div>
              )}

              {q.evaluation && (
                <div className="text-xs text-slate-400 space-y-1 pt-1">
                  <p><strong className="text-emerald-400">Positive:</strong> {q.evaluation.whatWentWell}</p>
                  <p><strong className="text-amber-400">Improvement:</strong> {q.evaluation.howToImprove}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewResultsPage;
