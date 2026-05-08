/**
 * CodeBreakerPage — wraps the imported CodeBreaker game with our platform plumbing:
 *   - starts a session on mount (StrictMode-safe via useRef guard)
 *   - logs each level attempt to the backend
 *   - bridges onMentorRequest → /api/sessions/:id/hint and pops a hint dialog
 *   - completes the session and shows the AI summary when all levels are done
 *
 * The game itself is unmodified — we just feed it props and react to its callbacks.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CodeBreaker } from "../games/codebreaker/definition";
import type { LevelResult, MentorRequest } from "../games-sdk";
import { ErrorBoundary } from "../components/ErrorBoundary";

const API_BASE = "http://localhost:3001/api";

const GAME_ID = CodeBreaker.id;
const GAME_TITLE = CodeBreaker.name;

export default function CodeBreakerPage() {
  return (
    <ErrorBoundary>
      <CodeBreakerPageInner />
    </ErrorBoundary>
  );
}

function CodeBreakerPageInner() {
  const navigate = useNavigate();
  const Game = CodeBreaker.Component;

  const [level, setLevel] = useState(1);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const sessionStartedRef = useRef(false); // StrictMode guard

  // Per-session totals, accumulated across all levels
  const [totalScore, setTotalScore] = useState(0);

  // Hint dialog state
  const [hintBusy, setHintBusy] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintError, setHintError] = useState<string | null>(null);

  // End-of-game summary state
  const [completed, setCompleted] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // ── Start session once ────────────────────────────────────────────
  useEffect(() => {
    if (sessionStartedRef.current) return; // StrictMode double-invoke guard
    sessionStartedRef.current = true;

    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/sessions/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ gameId: GAME_ID, gameTitle: GAME_TITLE }),
        });
        const data = await res.json();
        if (data.success) {
          sessionIdRef.current = data.sessionId;
          setSessionId(data.sessionId);
        } else {
          console.error("Session start failed:", data);
        }
      } catch (err) {
        console.error("Session start error:", err);
      }
    })();
  }, []);

  // ── Game callbacks ────────────────────────────────────────────────

  const handleLevelComplete = useCallback(async (result: LevelResult) => {
    // Score for this level: 100 base, minus 10 per hint, minimum 30
    const levelScore = Math.max(30, 100 - (result.hintsUsed ?? 0) * 10);
    setTotalScore((prev) => prev + levelScore);

    // Log the attempt to backend
    if (sessionIdRef.current) {
      const token = localStorage.getItem("token");
      try {
        await fetch(`${API_BASE}/sessions/${sessionIdRef.current}/attempt`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            passed: result.passed,
            code: result.artifact,
            error: undefined,
          }),
        });
      } catch (err) {
        console.error("logAttempt failed:", err);
      }
    }

    // Advance to next level, or finish session if last
    const nextLevel = result.level + 1;
    if (nextLevel <= CodeBreaker.totalLevels) {
      setLevel(nextLevel);
    } else {
      // All levels done — complete session
      const finalScore = totalScore + levelScore;
      if (sessionIdRef.current) {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`${API_BASE}/sessions/${sessionIdRef.current}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ score: finalScore }),
          });
          const data = await res.json();
          setSummary(data.summary || null);
        } catch (err) {
          console.error("complete failed:", err);
        }
      }
      setCompleted(true);
    }
  }, [totalScore]);

  const handleMentorRequest = useCallback(async (req: MentorRequest) => {
    if (!sessionIdRef.current) {
      setHintError("Session not started yet — wait a moment and try again.");
      return;
    }
    setHintBusy(true);
    setHintError(null);
    setHintText(null);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionIdRef.current}/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          problemStatement: `${req.goal} — Level ${req.level} of ${GAME_TITLE}`,
          studentAttempt: req.currentCode,
          expectedBehavior: req.goal,
          lastError: req.errorMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHintText(data.hint);
      } else {
        setHintError(data.message || "Mentor unavailable.");
      }
    } catch {
      setHintError("Network error reaching the mentor.");
    } finally {
      setHintBusy(false);
    }
  }, []);

  const handleExit = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // ── End-of-session summary screen ─────────────────────────────────

  if (completed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-zinc-900 border-2 border-emerald-500/40 rounded-2xl p-8">
          <div className="text-6xl text-center mb-4">🏆</div>
          <h1 className="text-3xl font-black text-center text-emerald-400 mb-2">Heist Complete!</h1>
          <p className="text-zinc-400 text-center mb-6">Final score: <span className="text-white font-black">{totalScore}</span></p>

          {summary ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-2">
                🦉 Mentor Summary (your teacher will see this)
              </div>
              <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{summary}</p>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic mb-6 text-center">
              Mentor wasn't available to write a summary — but your progress is saved.
            </p>
          )}

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate("/profile")}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-black transition shadow-[0_3px_0_0_rgb(5,150,105)] hover:shadow-[0_1px_0_0_rgb(5,150,105)] active:translate-y-px"
            >
              Back to profile
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition"
            >
              Browse games
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render game + hint overlay ────────────────────────────────────

  return (
    <div className="relative">
      <Game
        level={level}
        onLevelComplete={handleLevelComplete}
        onMentorRequest={handleMentorRequest}
        onExit={handleExit}
      />

      {/* Floating session indicator (subtle, top-left, doesn't fight the game UI) */}
      {sessionId === null && (
        <div className="fixed top-3 left-3 z-50 px-3 py-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold backdrop-blur">
          Connecting to session...
        </div>
      )}

      {/* Hint dialog */}
      {(hintBusy || hintText || hintError) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-lg">
                🦉
              </div>
              <div>
                <div className="font-black">ZCode Mentor</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">AI Hint</div>
              </div>
            </div>

            {hintBusy && (
              <div className="py-6 text-center text-zinc-400 text-sm">Thinking...</div>
            )}

            {hintError && (
              <div className="px-3 py-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {hintError}
              </div>
            )}

            {hintText && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 mb-3 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {hintText}
              </div>
            )}

            <button
              onClick={() => { setHintText(null); setHintError(null); }}
              className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-black text-sm transition shadow-[0_3px_0_0_rgb(5,150,105)] hover:shadow-[0_1px_0_0_rgb(5,150,105)] active:translate-y-px"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
