import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Map,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Cpu,
  Info
} from 'lucide-react';
import { jobApi, matchApi, resumeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScoreCard from '../components/ScoreCard';
import ProgressBar from '../components/ProgressBar';
import SkillBadge from '../components/SkillBadge';
import { AiThinkingState } from '../components/LoadingSkeleton';

const JobMatcherPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [jobsRes, resumesRes] = await Promise.all([jobApi.getAll(), resumeApi.getAll()]);
      setJobs(jobsRes.data.jobs || []);
      setResumes(resumesRes.data.resumes || []);
      if (resumesRes.data.resumes?.length > 0) {
        setSelectedResumeId(resumesRes.data.resumes[0]._id);
      }
      if (jobsRes.data.jobs?.length > 0) {
        setActiveJob(jobsRes.data.jobs[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFillSampleJob = () => {
    setCompany('Apex Semiconductor Corp');
    setTitle('Senior RTL Design & Verification Engineer');
    setRawText(`
Job Title: Senior RTL Design & Verification Engineer
Company: Apex Semiconductor Corp
Target Role: RTL Design Engineer

About the Role:
We are seeking an experienced RTL Design & Verification Engineer to design next-generation hardware acceleration blocks for high-bandwidth neural network processors.

Key Responsibilities:
- Design, simulate, and synthesize complex digital logic using Verilog and SystemVerilog.
- Develop multi-clock domain crossing (CDC) synchronizers and asynchronous FIFOs.
- Implement Finite State Machines (FSM) optimized for low latency and area constraints.
- Collaborate with the verification team to define UVM testbench architectures and write SystemVerilog assertions (SVA).
- Perform Static Timing Analysis (STA), constraint generation (SDC), and FPGA emulation using Xilinx Vivado.

Requirements:
- Bachelor's or Master's degree in Electrical Engineering, Computer Engineering, or related discipline.
- Strong proficiency in Verilog, SystemVerilog, and digital circuit design principles.
- Hands-on experience with FPGA prototyping (Vivado, Quartus) and simulation tools (ModelSim, VCS).
- Familiarity with UVM, C/C++ firmware integration, and Python/Tcl automation scripting.
    `.trim());
  };

  const handleCreateAndMatch = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setStatusMessage('Analyzing job requirements and matching with active resume...');

    try {
      // 1. Create and extract Job Description
      const jobRes = await jobApi.create({
        company: company || 'Target Employer',
        title: title || 'Engineering Position',
        rawText,
        targetRole: user?.targetRole
      });

      const newJob = jobRes.data.job;
      setActiveJob(newJob);
      setJobs((prev) => [newJob, ...prev]);

      // 2. Run Match Analysis
      const matchRes = await matchApi.calculate({
        jobDescriptionId: newJob._id,
        resumeId: selectedResumeId || undefined
      });

      setMatchResult(matchRes.data.match);
      setStatusMessage('Match analysis successfully generated!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <AiThinkingState message="Matching Resume Credentials against Job Description Requirements..." />
      </div>
    );
  }

  const scores = matchResult?.categoryScores || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-brand-accent" />
          Job Description Analyzer & Compatibility Matcher
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Paste any job description to parse technical prerequisites and compute transparent match scores against your resume.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      {/* Input Form Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            Paste Target Job Posting
          </h2>
          <button
            type="button"
            onClick={handleFillSampleJob}
            className="text-xs text-brand-accent hover:underline font-semibold"
          >
            Auto-Fill Sample Hardware JD
          </button>
        </div>

        <form onSubmit={handleCreateAndMatch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Semiconductor, Nvidia, Google"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior RTL Design Engineer"
                className="w-full px-4 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Job Description Text</label>
              <span className="text-[11px] text-slate-500">{rawText.length} characters</span>
            </div>
            <textarea
              required
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full job posting, requirements, and responsibilities here..."
              className="w-full px-4 py-3 rounded-xl bg-dark-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent leading-relaxed font-mono text-xs"
            />
          </div>

          {resumes.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Resume to Compare With</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent"
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.originalFileName} (Uploaded {new Date(r.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-accent to-blue-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Analyze Job & Calculate Match Score
          </button>
        </form>
      </div>

      {/* Match Results Display */}
      {matchResult && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* ATS Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3 text-xs text-slate-300">
            <Info className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">AI Compatibility Disclaimer:</strong> {matchResult.disclaimer}
            </div>
          </div>

          {/* Scores Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ScoreCard
              title="Estimated ATS Match Score"
              score={matchResult.overallMatchScore}
              subtitle={matchResult.summaryFeedback}
              size="large"
            />

            {/* Category Breakdown */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-accent" />
                Transparent Weighted Breakdown
              </h3>

              <div className="space-y-3.5 pt-2">
                <ProgressBar
                  label="Technical Skills (Weight: 40%)"
                  value={scores.technicalSkills}
                  color="indigo"
                />
                <ProgressBar
                  label="Keyword Alignment (Weight: 20%)"
                  value={scores.keywords}
                  color="cyan"
                />
                <ProgressBar
                  label="Relevant Experience (Weight: 15%)"
                  value={scores.experience}
                  color="emerald"
                />
                <ProgressBar
                  label="Project Demonstrations (Weight: 15%)"
                  value={scores.projects}
                  color="amber"
                />
                <ProgressBar
                  label="Education Alignment (Weight: 10%)"
                  value={scores.education}
                  color="indigo"
                />
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Skills ({matchResult.matchedSkills?.length || 0})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResult.matchedSkills?.length > 0 ? (
                  matchResult.matchedSkills.map((skill, idx) => (
                    <SkillBadge key={idx} skill={skill} type="matched" />
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No overlapping technical skills detected.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Skills ({matchResult.missingSkills?.length || 0})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingSkills?.length > 0 ? (
                  matchResult.missingSkills.map((skill, idx) => (
                    <SkillBadge key={idx} skill={skill} type="missing" priority="High" />
                  ))
                ) : (
                  <p className="text-xs text-emerald-400">All key job skills match your resume!</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Launch Roadmap & Interview Buttons */}
          <div className="p-6 glass-card rounded-2xl border border-brand-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Next Steps for This Job</h4>
              <p className="text-xs text-slate-400">
                Bridge your {matchResult.missingSkills?.length || 0} skill gaps or practice interview questions based on this JD.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/skill-gaps"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                View Skill Gaps
              </Link>
              <Link
                to="/roadmap"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center gap-2 transition-all shadow-md"
              >
                <Map className="w-4 h-4" />
                Generate Roadmap
              </Link>
              <Link
                to="/interview"
                state={{ jobDescriptionId: activeJob?._id }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent border border-brand-accent/30 flex items-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Practice Interview
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatcherPage;
