import React from "react";
import { HINT_XP_COSTS } from "../levels";

interface HintSystemProps {
  hints: string[];
  revealed: number;
  onReveal: () => void;
}

export function HintSystem({ hints, revealed, onReveal }: HintSystemProps) {
  if (hints.length === 0) return null;

  const nextCost = HINT_XP_COSTS[revealed] ?? 50;
  const hasMore = revealed < hints.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
          Hints
        </p>
        {revealed > 0 && (
          <span className="text-xs text-slate-600">
            {revealed}/{hints.length} revealed
          </span>
        )}
      </div>

      {revealed === 0 ? (
        <p className="text-xs text-slate-600 italic mb-3">
          Try on your own first. Reveal hints only if you're truly stuck.
        </p>
      ) : null}

      {/* Revealed hints */}
      <div className="space-y-2 mb-3">
        {hints.slice(0, revealed).map((hint, i) => (
          <div
            key={i}
            className="bg-amber-500/8 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-200/80 whitespace-pre-wrap leading-relaxed"
          >
            {hint}
          </div>
        ))}
      </div>

      {/* Reveal button */}
      {hasMore && (
        <button
          onClick={onReveal}
          className="w-full py-2 border border-amber-500/30 hover:border-amber-400/50 text-amber-400 hover:text-amber-300 text-xs font-semibold rounded-lg transition-colors bg-amber-500/5 hover:bg-amber-500/10"
        >
          💡 Reveal Hint {revealed + 1}
          {nextCost > 0 ? ` (−${nextCost} XP)` : " (Free)"}
        </button>
      )}

      {!hasMore && revealed > 0 && (
        <p className="text-xs text-slate-600 text-center">
          All hints revealed
        </p>
      )}
    </div>
  );
}
