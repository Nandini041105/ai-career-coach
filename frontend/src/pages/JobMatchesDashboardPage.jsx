import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, Layers, Plus } from 'lucide-react';
import { matchApi } from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';

const JobMatchesDashboardPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await matchApi.getAll();
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-brand-accent" />
            Multiple Job Matches Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare ATS compatibility and skill gaps across all saved target companies.
          </p>
        </div>

        <Link
          to="/jobs"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent border border-brand-accent/30 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Match New Job
        </Link>
      </div>

      {matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((m) => (
            <div
              key={m._id}
              className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {m.jobDescriptionId?.title || 'Target Position'}
                </h3>
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300">{m.jobDescriptionId?.company || 'Employer'}</strong> • Target Role: {m.jobDescriptionId?.targetRole || 'Software Engineer'} • Analyzed on {new Date(m.createdAt).toLocaleDateString()}
                </p>
                <p className="text-[11px] text-slate-500">
                  Compared with resume: {m.resumeId?.originalFileName || 'Active Resume'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Match Score</span>
                  <span
                    className={`text-xl font-extrabold ${
                      m.overallMatchScore >= 75
                        ? 'text-emerald-400'
                        : m.overallMatchScore >= 50
                        ? 'text-brand-accent'
                        : 'text-amber-400'
                    }`}
                  >
                    {m.overallMatchScore}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/25 text-xs font-semibold">
                    {m.missingSkills?.length || 0} Missing Skills
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 glass-card rounded-2xl text-center space-y-3 border border-dashed border-slate-800">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Job Matches Recorded</h3>
          <p className="text-xs text-slate-500">Paste job descriptions to evaluate compatibility across roles.</p>
          <Link
            to="/jobs"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold"
          >
            Match a Job Description
          </Link>
        </div>
      )}
    </div>
  );
};

export default JobMatchesDashboardPage;
