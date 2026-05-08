import React, { useEffect, useState } from "react";
import type { RankInfo } from "../levels";

interface RewardOverlayProps {
  xpEarned: number;
  diamonds: number;
  bonuses: string[];
  rank: RankInfo;
  missionTitle: string;
  isLastMission: boolean;
  onContinue: () => void;
}

export function RewardOverlay({
  xpEarned,
  diamonds,
  bonuses,
  rank,
  missionTitle,
  isLastMission,
  onContinue,
}: RewardOverlayProps) {
  const [visible, setVisible] = useState(false);

  // Animate in after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Card */}
      <div
        className={`relative z-10 bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl transition-all duration-500 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
      >
        {/* Trophy */}
        <div className="text-6xl mb-3 animate-bounce">
          {isLastMission ? "🏆" : "✅"}
        </div>

        <h2 className="text-2xl font-bold text-emerald-400 mb-1">
          {isLastMission ? "Heist Complete!" : "Mission Complete!"}
        </h2>
        <p className="text-slate-400 text-sm mb-6">{missionTitle}</p>

        {/* Main rewards */}
        <div className="flex justify-center gap-8 mb-5">
          <div>
            <p className="text-3xl font-extrabold text-yellow-400">+{xpEarned}</p>
            <p className="text-xs text-slate-500 mt-0.5">XP</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-3xl font-extrabold text-blue-300">
              +{diamonds} 💎
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Diamonds</p>
          </div>
        </div>

        {/* Bonus tags */}
        {bonuses.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            {bonuses.map((b, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold"
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Current rank */}
        <p className={`text-sm font-bold mb-6 ${rank.color}`}>
          Rank: {rank.name}
        </p>

        {/* Floating diamonds decoration */}
        <div className="flex justify-center gap-2 mb-6 text-xl" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="animate-bounce"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              💎
            </span>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl transition-all text-sm"
        >
          {isLastMission ? "🏆 Return to Base" : "→ Next Mission"}
        </button>
      </div>
    </div>
  );
}
