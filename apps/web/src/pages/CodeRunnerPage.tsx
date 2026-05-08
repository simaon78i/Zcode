/**
 * CodeRunnerPage — embeds the imported CodeRunner game.
 *
 * Per integration decision: no session tracking yet. The game runs in its own
 * full-viewport bubble (it has its own zustand store and lifecycle) and we just
 * provide a route to reach it plus a way back out.
 *
 * To wire up sessions later: subscribe to useGameStore.stageState and call
 *   POST /api/sessions/:id/attempt when it transitions to "passed" or "failed".
 *   POST /api/sessions/:id/complete on unmount.
 */

import { useNavigate } from "react-router-dom";
import { CodeRunnerMVP } from "../games/coderunner/game/CodeRunnerMVP";
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function CodeRunnerPage() {
  return (
    <ErrorBoundary>
      <CodeRunnerPageInner />
    </ErrorBoundary>
  );
}

function CodeRunnerPageInner() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Floating exit button — sits over the game, top-left */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-3 left-3 z-[60] px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur border border-zinc-700 rounded-lg text-xs font-bold text-zinc-200 transition"
      >
        ← Back to games
      </button>

      <CodeRunnerMVP />
    </div>
  );
}
