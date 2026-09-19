import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card rounded-2xl p-6 animate-pulse space-y-4">
    <div className="h-4 bg-slate-800 rounded w-1/3"></div>
    <div className="h-8 bg-slate-800/60 rounded w-2/3"></div>
    <div className="space-y-2 pt-2">
      <div className="h-3 bg-slate-800/40 rounded w-full"></div>
      <div className="h-3 bg-slate-800/40 rounded w-4/5"></div>
    </div>
  </div>
);

export const AiThinkingState = ({ message = 'AI is analyzing your profile...' }) => (
  <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-5 border border-brand-primary/20">
    <div className="relative">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary animate-spin opacity-40 blur-md"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-dark-900 border border-brand-primary/50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-brand-accent animate-ping"></div>
        </div>
      </div>
    </div>
    <div className="space-y-1.5">
      <h3 className="text-base font-semibold text-white">{message}</h3>
      <p className="text-xs text-slate-400">Synthesizing deep feedback & industry heuristics...</p>
    </div>
  </div>
);

export default CardSkeleton;
