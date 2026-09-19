import React from 'react';

const getScoreDetails = (score) => {
  if (score >= 85) {
    return {
      label: 'Exceptional',
      colorText: 'text-emerald-400',
      bgBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      progressStroke: '#10b981',
      bgGlow: 'from-emerald-500/20 to-transparent'
    };
  }
  if (score >= 70) {
    return {
      label: 'Strong Match',
      colorText: 'text-brand-accent',
      bgBadge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      progressStroke: '#06b6d4',
      bgGlow: 'from-cyan-500/20 to-transparent'
    };
  }
  if (score >= 50) {
    return {
      label: 'Moderate',
      colorText: 'text-amber-400',
      bgBadge: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      progressStroke: '#f59e0b',
      bgGlow: 'from-amber-500/20 to-transparent'
    };
  }
  return {
    label: 'Needs Focus',
    colorText: 'text-rose-400',
    bgBadge: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    progressStroke: '#ef4444',
    bgGlow: 'from-rose-500/20 to-transparent'
  };
};

const ScoreCard = ({ title, score = 0, subtitle, size = 'default' }) => {
  const details = getScoreDetails(score);
  const radius = size === 'large' ? 48 : 36;
  const strokeWidth = size === 'large' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      <div className={`glow-primary w-32 h-32 -top-10 -right-10 bg-gradient-to-br ${details.bgGlow}`} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</h3>
          <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${details.bgBadge}`}>
            {details.label}
          </span>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center">
          <svg
            className="transform -rotate-90"
            width={radius * 2 + strokeWidth * 2}
            height={radius * 2 + strokeWidth * 2}
          >
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke={details.progressStroke}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${details.colorText}`}>{score}</span>
            <span className="text-[10px] text-slate-500 -mt-1 font-medium">/100</span>
          </div>
        </div>
      </div>

      {subtitle && (
        <p className="mt-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default ScoreCard;
