import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileSearch,
  Target,
  Layers,
  Bot,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Award,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: FileSearch,
      title: 'AI Resume Quality Audit',
      desc: 'Parses PDF structures, evaluates verb impacts, counts quantifiable metrics, and computes an objective 0–100 quality score.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Target,
      title: 'Job Description Matching',
      desc: 'Compares your actual resume credentials against job requirements with transparent weighting across technical skills, keywords, and experience.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Layers,
      title: 'Prioritized Skill Gap Analyzer',
      desc: 'Identifies missing skills, classifies them by High/Medium/Low priority, and explains why each skill matters for your target role.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Bot,
      title: 'Multi-Mode AI Mock Interview',
      desc: 'Simulates technical, HR, and project interviews. Evaluates your answers against an engineering rubric (1–10) and provides model responses.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Personalized Learning Roadmap',
      desc: 'Generates weekly step-by-step milestones, prerequisites, learning topics, and hands-on practice recommendations.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Award,
      title: 'Resume Bullet Optimizer',
      desc: 'Suggests high-impact rewrites with action verbs and metric placeholders, keeping your credentials authentic and recruiter-friendly.',
      color: 'from-violet-500 to-indigo-500'
    }
  ];

  const steps = [
    { step: '01', title: 'Upload Your Resume', text: 'Drag and drop your PDF resume for instant text extraction and section breakdown.' },
    { step: '02', title: 'Pick Role or Paste Job', text: 'Specify your career focus (RTL, FPGA, Embedded, Software, AI) or paste a real job posting.' },
    { step: '03', title: 'Discover Gaps & Roadmap', text: 'Receive an ATS compatibility score, missing skill priorities, and a week-by-week curriculum.' },
    { step: '04', title: 'Master AI Mock Interviews', text: 'Practice real questions, get instantaneous rubric feedback, and build unwavering interview confidence.' }
  ];

  const faqs = [
    {
      q: 'Is this an actual ATS proprietary score?',
      a: 'No. Our score is an AI-based compatibility estimate based on modern technical hiring rubrics. Actual corporate ATS systems and human hiring managers employ varying proprietary workflows.'
    },
    {
      q: 'Does it support hardware engineering roles like RTL and FPGA?',
      a: 'Yes! We have specialized domain engines for RTL Design, FPGA Design, VLSI, Physical Design, Embedded Systems, Software Engineering, and AI/Data roles.'
    },
    {
      q: 'Are my resume files kept private?',
      a: 'Absolutely. Resumes and answers are strictly isolated per user account. We never share your data with third-party advertisers.'
    },
    {
      q: 'Can I practice both technical and HR interview rounds?',
      a: 'Yes. You can toggle between Technical, HR, Project Deep-Dive, or Mixed interview modes with selectable 5, 10, or 15 question sessions.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="glow-primary w-96 h-96 -top-20 left-1/4 bg-brand-primary" />
        <div className="glow-primary w-96 h-96 top-40 right-1/4 bg-brand-accent" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-brand-accent shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            <span>The Next-Generation AI Career Preparation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Turn Your Resume Into Your{' '}
            <span className="bg-gradient-to-r from-brand-primary via-indigo-300 to-brand-accent bg-clip-text text-transparent">
              Career Strategy
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Analyze your resume, match it with job descriptions, uncover hidden skill gaps, and practice role-specific AI interviews with real-time rubric feedback.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? '/resume' : '/register'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-xl shadow-brand-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              Analyze My Resume
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={isAuthenticated ? '/interview' : '/register'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-brand-accent" />
              Try Interview Coach
            </Link>
          </div>

          {/* Hero Live Mockup Card */}
          <div className="pt-10">
            <div className="glass-card rounded-2xl p-6 max-w-4xl mx-auto border border-slate-700/60 shadow-2xl text-left grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400">Resume Quality</span>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-400">86</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[86%] rounded-full"></div>
                </div>
                <span className="text-[11px] text-emerald-300 mt-2">Strong Action Verbs & Metrics</span>
              </div>

              <div className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400">RTL Engineer Match</span>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-brand-accent">78%</span>
                  <span className="text-xs text-slate-500">Estimated Match</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-accent w-[78%] rounded-full"></div>
                </div>
                <span className="text-[11px] text-cyan-300 mt-2">4 of 5 Required Skills Matched</span>
              </div>

              <div className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400">Mock Interview Score</span>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-indigo-300">8.4</span>
                  <span className="text-xs text-slate-500">/ 10 Rubric</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 w-[84%] rounded-full"></div>
                </div>
                <span className="text-[11px] text-indigo-300 mt-2">Accurate Technical Reasoning</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-accent">Comprehensive Capabilities</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Engineered for Technical Job Seekers</h3>
          <p className="text-sm text-slate-400">Everything you need to transform a passive resume into an interview-winning portfolio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
                <div className="pt-2 flex items-center text-xs font-semibold text-brand-accent gap-1 group cursor-pointer">
                  <span>Explore module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-primary">The Progression</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">How Career Coach Works</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 space-y-3 border-t-2 border-t-brand-primary/60">
              <span className="text-2xl font-black text-brand-primary/60 font-mono">{st.step}</span>
              <h4 className="text-base font-bold text-white">{st.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{st.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-400">Clear answers on scoring transparency and platform features.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card rounded-xl p-5 space-y-2">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-accent flex-shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6 bg-gradient-to-br from-indigo-950/40 via-dark-850 to-dark-900 border border-brand-primary/30 shadow-2xl relative overflow-hidden">
          <div className="glow-primary w-80 h-80 -bottom-20 -right-20 bg-brand-primary" />
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">Ready to Land Your Dream Engineering Role?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Analyze your resume and get immediate insights into your ATS compatibility score and customized mock interview questions.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/30 transition-all hover:scale-105"
            >
              Start Practicing Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
