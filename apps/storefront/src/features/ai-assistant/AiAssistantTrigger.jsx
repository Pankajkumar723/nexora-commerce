import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Floating AI Trigger Button component (compact & sleek)
 */
export function AiAssistantTrigger({ onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-navy to-royal-blue hover:from-royal-blue hover:to-teal text-white px-3.5 py-2 rounded-full shadow-md flex items-center gap-2 font-medium text-xs transition-all hover:scale-105 active:scale-95 border border-white/20 group cursor-pointer pointer-events-auto"
      aria-label="Ask AI - Shopping Assistant"
      title="Ask Nexora AI"
    >
      <Sparkles className="w-3.5 h-3.5 text-teal group-hover:rotate-12 transition-transform" />
      <span className="font-semibold text-xs text-white">Ask AI</span>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
      </span>
    </button>
  );
}
