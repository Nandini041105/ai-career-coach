import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Map,
  HelpCircle
} from 'lucide-react';
import { skillGapApi } from '../services/api';
import SkillBadge from '../components/SkillBadge';
import { AiThinkingState } from '../components/LoadingSkeleton';

const SkillGapPage = () => {
  const [skillGap, setSkillGap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSkillGaps();
  }, []);

  const fetchSkillGaps = async () => {
    try {
      const res = await skillGapApi.getLatest();
      setSkillGap(res.data.skillGap);
    } catch (err) {
      setError(err.message || 'Failed to load skill gap data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <AiThinkingState message="Analyzing prioritized skill gaps and engineering justifications..." />
      </div>
    );
  }

  if (!skillGap || !skillGap.skillGaps || skillGap.skillGaps.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">No Skill Gaps Recorded</h2>
        <p className="text-xs text-slate-400">
          Match a job description against your resume to identify missing technical skills and learning priorities.
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md"
        >
          Go to Job Matcher <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const gaps = skillGap.skillGaps || [];
  const highPriority = gaps.filter((g) => g.priority === 'High');
  const mediumPriority = gaps.filter((g) => g.priority === 'Medium');
  const lowPriority = gaps.filter((g) => g.priority === 'Low');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Skill Gap Analysis & Roadmap Priorities
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent/15 text-brand-accent border border-brand-accent/30">
              {skillGap.targetRole}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Target role requirements comparison identifying prerequisite mastery and specific curriculum topics.
          </p>
        </div>

        <Link
          to="/roadmap"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25 flex items-center gap-2 hover:opacity-95 transition-all"
        >
          <Map className="w-4 h-4" />
          Generate 4-Week Roadmap
        </Link>
      </div>

      {/* Matched Skills Overview Card */}
      {skillGap.matchedSkills?.length > 0 && (
        <div className="glass-card rounded-2xl p-6 space-y-3 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Verified Skills Present on Your Resume ({skillGap.matchedSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {skillGap.matchedSkills.map((skill, idx) => (
              <SkillBadge key={idx} skill={skill} type="matched" />
            ))}
          </div>
        </div>
      )}

      {/* Detailed Skill Gap Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Missing Skills Categorized by Urgency ({gaps.length})
          </h3>
          <span className="text-xs text-slate-400">
            {highPriority.length} High • {mediumPriority.length} Medium • {lowPriority.length} Low
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gaps.map((item, idx) => (
            <div
              key={idx}
              className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 border border-slate-800 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{item.skill}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Target Level: <strong className="text-slate-200">{item.recommendedLevel}</strong>
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      item.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : item.priority === 'Medium'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                </div>

                {/* Why It Matters */}
                <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why It Matters for {skillGap.targetRole}:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.whyItMatters}</p>
                </div>

                {/* Suggested Topics to Learn */}
                {item.learningTopics?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
                      Suggested Key Learning Topics:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                      {item.learningTopics.map((topic, tIdx) => (
                        <li key={tIdx} className="leading-relaxed">
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Ready to study?</span>
                <Link to="/roadmap" className="text-brand-accent hover:underline flex items-center gap-1 font-semibold">
                  Add to Roadmap <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;
