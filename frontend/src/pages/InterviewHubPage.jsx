import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  MessageSquare,
  Bot,
  Sparkles,
  Cpu,
  UserCheck,
  FolderGit2,
  Shuffle,
  FileText,
  Briefcase,
  ArrowRight,
  Clock,
  History,
  AlertCircle
} from 'lucide-react';
import { interviewApi, resumeApi, jobApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AiThinkingState } from '../components/LoadingSkeleton';

const TARGET_ROLES = [
  'RTL Design Engineer',
  'FPGA Design Engineer',
  'VLSI Engineer',
  'Physical Design Engineer',
  'Embedded Systems Engineer',
  'Software Engineer',
  'Data/AI Engineer',
  'Other'
];

const InterviewHubPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [targetRole, setTargetRole] = useState(user?.targetRole || 'RTL Design Engineer');
  const [interviewType, setInterviewType] = useState('technical');
  const [questionSource, setQuestionSource] = useState('role');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(location.state?.jobDescriptionId || '');
  const [loading, setLoading] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resumesRes, jobsRes, historyRes] = await Promise.all([
        resumeApi.getAll(),
        jobApi.getAll(),
        interviewApi.getHistory()
      ]);
      setResumes(resumesRes.data.resumes || []);
      if (resumesRes.data.resumes?.length > 0) {
        setSelectedResumeId(resumesRes.data.resumes[0]._id);
      }
      setJobs(jobsRes.data.jobs || []);
      if (!selectedJobId && jobsRes.data.jobs?.length > 0) {
        setSelectedJobId(jobsRes.data.jobs[0]._id);
      }
      setRecentSessions(historyRes.data.sessions?.slice(0, 3) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await interviewApi.start({
        targetRole,
        interviewType,
        questionSource,
        totalQuestions,
        resumeId: questionSource === 'resume' || questionSource === 'mixed' ? selectedResumeId : undefined,
        jobDescriptionId: questionSource === 'job' || questionSource === 'mixed' ? selectedJobId : undefined
      });

      const session = res.data.session;
      navigate(`/interview/${session._id}`);
    } catch (err) {
      setError(err.message || 'Failed to initialize interview session.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <AiThinkingState message={`Generating personalized ${interviewType} questions for ${targetRole}...`} />
      </div>
    );
  }

  const interviewModes = [
    {
      id: 'technical',
      title: 'Technical Round',
      desc: 'In-depth domain questions covering protocols, architecture, logic design, and problem solving.',
      icon: Cpu,
      color: 'border-brand-primary text-brand-primary'
    },
    {
      id: 'hr',
      title: 'HR & Behavioral',
      desc: 'Evaluate communication, culture fit, conflict handling, and STAR-format scenarios.',
      icon: UserCheck,
      color: 'border-brand-secondary text-brand-secondary'
    },
    {
      id: 'project',
      title: 'Project Defense',
      desc: 'Drill down into architectural decisions, individual contributions, bugs, and testing.',
      icon: FolderGit2,
      color: 'border-emerald-500 text-emerald-400'
    },
    {
      id: 'mixed',
      title: 'Mixed Full Loop',
      desc: 'Balanced simulation featuring technical problems, project deep-dives, and HR questions.',
      icon: Shuffle,
      color: 'border-amber-500 text-amber-400'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-brand-primary" />
            AI Mock Interview Coach
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Practice role-specific interview simulations with real-time rubric feedback (accuracy, relevance, completeness, communication).
          </p>
        </div>

        <Link
          to="/interview-history"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <History className="w-4 h-4" />
          Past Interview History
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Configuration Grid */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-8 border border-slate-800">
        {/* Step 1: Select Target Role */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            1. Target Engineering Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {TARGET_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setTargetRole(role)}
                className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                  targetRole === role
                    ? 'bg-brand-primary/20 border-brand-primary text-white shadow-md'
                    : 'bg-dark-850 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Interview Mode */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            2. Interview Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {interviewModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = interviewType === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => setInterviewType(mode.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10'
                      : 'bg-dark-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className={`w-10 h-10 rounded-xl bg-dark-900 border flex items-center justify-center ${mode.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{mode.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{mode.desc}</p>
                  </div>
                  <div className="pt-3 flex items-center gap-1.5 text-xs font-semibold">
                    <span className={isSelected ? 'text-brand-accent' : 'text-slate-500'}>
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Question Source & Length */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          {/* Question Source */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Question Source
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'role', label: 'Role Pool', icon: Cpu },
                { id: 'resume', label: 'My Resume', icon: FileText },
                { id: 'job', label: 'Job Posting', icon: Briefcase }
              ].map((src) => {
                const Icon = src.icon;
                const isSelected = questionSource === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setQuestionSource(src.id)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-brand-accent/15 border-brand-accent text-brand-accent'
                        : 'bg-dark-850 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{src.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Context Selectors */}
            {questionSource === 'resume' && (
              <div className="pt-2">
                <label className="text-[11px] text-slate-400">Select active resume:</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white"
                >
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.originalFileName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {questionSource === 'job' && (
              <div className="pt-2">
                <label className="text-[11px] text-slate-400">Select job posting:</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-dark-900 border border-slate-700 text-xs text-white"
                >
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} ({j.company})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Session Length */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              4. Session Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTotalQuestions(count)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    totalQuestions === count
                      ? 'bg-brand-primary/20 border-brand-primary text-indigo-300'
                      : 'bg-dark-850 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-lg font-bold text-white">{count}</span>
                  <span className="text-[10px] text-slate-400">Questions</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              5 questions takes ~10 mins • 10 questions takes ~20 mins • 15 questions takes ~30 mins.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartInterview}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-brand-primary/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          Start Interactive AI Interview ({totalQuestions} Questions)
        </button>
      </div>

      {/* Recent Completed Sessions */}
      {recentSessions.length > 0 && (
        <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-brand-accent" />
            Recent Practice Sessions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentSessions.map((s) => (
              <div
                key={s._id}
                className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white capitalize">{s.interviewType}</span>
                  <span className="text-xs font-extrabold text-emerald-400">
                    {s.overallInterviewScore}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {s.targetRole} • {s.totalQuestions} questions
                </p>
                <Link
                  to={`/interview/${s._id}/results`}
                  className="text-xs text-brand-accent hover:underline flex items-center gap-1 pt-1"
                >
                  View Performance Review <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewHubPage;
