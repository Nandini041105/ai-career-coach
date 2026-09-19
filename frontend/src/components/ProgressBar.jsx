import React from 'react';

const ProgressBar = ({ label, value = 0, max = 100, color = 'indigo', showValue = true }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorVariants = {
    indigo: 'from-indigo-500 to-indigo-400',
    cyan: 'from-cyan-500 to-blue-500',
    emerald: 'from-emerald-500 to-teal-400',
    amber: 'from-amber-500 to-yellow-400',
    rose: 'from-rose-500 to-pink-500'
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || showValue) && (
        <div className="flex justify-between text-xs font-medium">
          {label && <span className="text-slate-300">{label}</span>}
          {showValue && <span className="text-slate-400">{percentage}%</span>}
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorVariants[color] || colorVariants.indigo} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
