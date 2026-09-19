import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

const SkillBadge = ({ skill, type = 'matched', priority, level }) => {
  if (type === 'matched') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        {skill}
      </span>
    );
  }

  const priorityStyles = {
    High: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    Medium: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    Low: 'bg-slate-700/40 text-slate-300 border-slate-700'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
        priorityStyles[priority] || priorityStyles.Medium
      }`}
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
      <span>{skill}</span>
      {priority && (
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-bold uppercase tracking-wider">
          {priority}
        </span>
      )}
      {level && <span className="text-[10px] opacity-75">({level})</span>}
    </span>
  );
};

export default SkillBadge;
