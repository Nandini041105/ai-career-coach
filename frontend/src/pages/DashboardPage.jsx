import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Layers,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreCard from '../components/ScoreCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getSummary();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="h-10 bg-slate-800 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentMatches = data?.recentMatches || [];
  const recentInterviews = data?.recentInterviews || [];
  const trends = data?.trends || { interviews: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Quick Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Engineer'}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-accent text-xs font-semibold border border-brand-primary/30">
              {stats.targetRole}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Track your ATS compatibility, address technical skill gaps, and practice AI mock interviews.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/resume"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center gap-1.5 shadow-md shadow-brand-primary/20 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Resume
          </Link>
          <Link
            to="/interview"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-accent" />
            Practice Interview
          </Link>
        </div>
      </div>

      {/* 4 Major KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard
          title="Resume Quality"
          score={stats.resumeScore}
          subtitle={
            stats.hasResume
              ? `Active file: ${stats.latestResumeFileName || 'Uploaded PDF'}`
              : 'No resume scanned yet. Upload your PDF to calculate.'
          }
        />
        <ScoreCard
          title="Best Job Match"
          score={stats.bestJobMatch}
          subtitle="Compatibility based on required skills, projects & experience."
        />
        <ScoreCard
          title="Interview Score"
          score={stats.interviewScore}
          subtitle="Rubric assessment across accuracy, clarity & technical depth."
        />
        <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Skill Gaps</h3>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 border-amber-500/30 text-amber-300">
              Action Items
            </span>
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold text-amber-400">{stats.skillGapsCount}</span>
            <span className="text-xs text-slate-400 ml-2">identified skills to learn</span>
          </div>
          <Link
            to="/skill-gaps"
            className="text-xs text-brand-accent hover:underline flex items-center gap-1 pt-3 border-t border-slate-800"
          >
            View prioritization & roadmap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Progress Chart & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recharts Progress Visualizer */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-accent" />
                Performance Progression Over Time
              </h3>
              <p className="text-xs text-slate-400">Scores across completed mock interviews and resume iterations</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {trends.interviews?.length > 1 || trends.resumes?.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.interviews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#818cf8', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Interview Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
                <Clock className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-300">Not enough history yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                  Complete at least two mock interview sessions or resume scans to view dynamic progression charts.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="glass-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              Quick Actions
            </h3>
            <p className="text-xs text-slate-400">Launch specialized coaching tools</p>
          </div>

          <div className="space-y-3">
            <Link
              to="/resume"
              className="p-3.5 rounded-xl bg-dark-850 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-brand-primary" />
                <div>
                  <p className="text-xs font-semibold text-white">Upload & Analyze Resume</p>
                  <p className="text-[10px] text-slate-400">Get quality scores & bullet improvements</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/jobs"
              className="p-3.5 rounded-xl bg-dark-850 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-brand-accent" />
                <div>
                  <p className="text-xs font-semibold text-white">Match Job Description</p>
                  <p className="text-[10px] text-slate-400">Estimate ATS fit & missing skills</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/roadmap"
              className="p-3.5 rounded-xl bg-dark-850 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Personalized Roadmap</p>
                  <p className="text-[10px] text-slate-400">Step-by-step 4-week learning path</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/interview"
              className="p-3.5 rounded-xl bg-dark-850 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-white">AI Mock Interview</p>
                  <p className="text-[10px] text-slate-400">Practice role, technical, and HR questions</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Matches & Recent Interviews Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Job Matches */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-accent" />
              Recent Job Matches
            </h3>
            <Link to="/job-matches" className="text-xs text-brand-accent hover:underline">
              View All Matches
            </Link>
          </div>

          {recentMatches.length > 0 ? (
            <div className="space-y-3">
              {recentMatches.map((m) => (
                <div
                  key={m._id}
                  className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {m.jobDescriptionId?.title || 'Target Position'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {m.jobDescriptionId?.company || 'Company'} • {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                        m.overallMatchScore >= 75
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {m.overallMatchScore}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
              <p className="text-xs font-medium text-slate-300">No job matches analyzed yet</p>
              <p className="text-[11px] text-slate-500">Paste any job description to compute compatibility.</p>
              <Link
                to="/jobs"
                className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-brand-accent/20 text-brand-accent text-xs font-semibold"
              >
                Analyze First Job
              </Link>
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-primary" />
              Recent Mock Interviews
            </h3>
            <Link to="/interview-history" className="text-xs text-brand-primary hover:underline">
              View All History
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="space-y-3">
              {recentInterviews.map((session) => (
                <div
                  key={session._id}
                  className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white capitalize">
                      {session.interviewType} Interview ({session.totalQuestions} Questions)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {session.targetRole} • {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                        session.overallInterviewScore >= 75
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {session.overallInterviewScore}/100
                    </span>
                    <Link
                      to={`/interview/${session._id}/results`}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
              <p className="text-xs font-medium text-slate-300">No mock interviews completed yet</p>
              <p className="text-[11px] text-slate-500">Practice role-tailored questions with AI evaluation.</p>
              <Link
                to="/interview"
                className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-brand-primary/20 text-indigo-300 text-xs font-semibold"
              >
                Start Practice Session
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
