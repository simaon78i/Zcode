import { useState } from "react";

const API_BASE = "http://localhost:3001/api";

export interface HintRequest {
  problemStatement: string;
  studentAttempt?: string;
  expectedBehavior?: string;
  lastError?: string;
}

interface Props {
  sessionId: number | null;
  /** Function the panel calls to gather the latest game state when user clicks Hint */
  getContext: () => HintRequest;
}

interface HintEntry { id: number; text: string; }

export function MentorPanel({ sessionId, getContext }: Props) {
  const [hints, setHints] = useState<HintEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentMessage, setStudentMessage] = useState("");

  const requestHint = async () => {
    if (!sessionId) {
      setError("Session not started yet.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const ctx = getContext();
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/sessions/${sessionId}/hint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...ctx, studentMessage: studentMessage || undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Couldn't get a hint.");
        return;
      }
      setHints((arr) => [...arr, { id: Date.now(), text: data.hint }]);
      setStudentMessage("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center font-black text-zinc-950 text-sm">
          🦉
        </div>
        <h3 className="font-black">Mentor</h3>
        <span className="ml-auto text-[10px] font-black uppercase tracking-wider text-zinc-500">AI Hints</span>
      </div>

      {/* Hint history */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-32">
        {hints.length === 0 && (
          <p className="text-sm text-zinc-500 leading-relaxed">
            Stuck? Ask the mentor for a nudge. You'll get up to 5 hints per game — they get more specific each time.
          </p>
        )}
        {hints.map((h, i) => (
          <div key={h.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-1">
              Hint #{i + 1}
            </div>
            <div className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{h.text}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      <textarea
        placeholder="Optional: tell the mentor what's confusing you..."
        value={studentMessage}
        onChange={(e) => setStudentMessage(e.target.value)}
        rows={2}
        disabled={loading}
        className="w-full px-3 py-2 mb-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition resize-none disabled:opacity-50"
      />
      <button
        onClick={requestHint}
        disabled={loading || !sessionId}
        className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 rounded-xl font-black text-sm transition shadow-[0_3px_0_0_rgb(5,150,105)] hover:shadow-[0_1px_0_0_rgb(5,150,105)] active:translate-y-px"
      >
        {loading ? "Thinking..." : "💡 Get a hint"}
      </button>
    </aside>
  );
}
