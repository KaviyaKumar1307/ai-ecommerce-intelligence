import React from 'react';
import { Sparkles, Brain, Cpu, Zap, Activity } from 'lucide-react';

const AIExplanationBadge = ({ strategy, reason, score }) => {
  if (!reason && !strategy) return null;

  return (
    <div className="flex items-start space-x-1.5 p-2 rounded-lg bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-xs shadow-sm">
      <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1">
        <div className="flex items-center justify-between font-semibold text-[10px] tracking-wide uppercase text-indigo-600 mb-0.5">
          <span>{strategy ? strategy.replace(/_/g, ' ') : 'AI RECOMMENDATION'}</span>
          {score !== undefined && (
            <span className="bg-indigo-100/90 text-indigo-800 px-1.5 py-0.2 rounded font-mono">
              Score: {typeof score === 'number' ? score.toFixed(2) : score}
            </span>
          )}
        </div>
        <p className="text-slate-600 leading-tight">{reason}</p>
      </div>
    </div>
  );
};

export default AIExplanationBadge;
