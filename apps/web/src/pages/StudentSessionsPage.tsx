import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";

const API_BASE = "http://localhost:3001/api";

interface SessionEvent {
  type: "attempt" | "hint_request" | "hint_given" | "completed";
  at: string;
  payload: any;
}
interface Session {
  id: number;
  studentId: number;
  gameId: string;
  gameTitle: string;
  startedAt: string;
  completedAt: string | null;
  finalScore: number | null;
  status: "active" | "completed" | "abandoned";
  events: SessionEvent[];
  summary: string | null;
}

export default function StudentSessionsPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE}/sessions/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.message || "Could not load sessions");
          return;
        }
        setSessions(data.sessions);
      } catch {
        setError("Network error");
      }
    })();
  }, [studentId]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/teacher/dashboard")}
          className="text-zinc-400 hover:text-white text-sm font-bold mb-3"
        >
          ← Back to dashboard
        </button>
        <h1 className="text-3xl font-black mb-2">Student Sessions</h1>
        <p className="text-zinc-400 text-sm mb-6">AI-generated summaries from each game session.</p>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-4">
            {error}
          </div>
        )}

        {!sessions && !error && <p className="text-zinc-500">Loading...</p>}
        {sessions && sessions.length === 0 && (
          <p className="text-zinc-500">This student hasn't completed any sessions yet.</p>
        )}

        <div className="space-y-3">
          {sessions?.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      </div>
    </AppShell>
  );
}

function SessionCard({ session }: { session: Session }) {
  const [showLog, setShowLog] = useState(false);
  const minutes = session.completedAt
    ? Math.max(1, Math.round((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000))
    : null;
  const attempts = session.events.filter((e) => e.type === "attempt").length;
  const hints = session.events.filter((e) => e.type === "hint_given").length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-black">{session.gameTitle}</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {new Date(session.startedAt).toLocaleString()} •{" "}
            <span className={
              session.status === "completed" ? "text-emerald-400" :
              session.status === "abandoned" ? "text-rose-400" : "text-amber-400"
            }>
              {session.status}
            </span>
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          {session.finalScore !== null && (
            <span className="px-2 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded font-black">
              {session.finalScore} pts
            </span>
          )}
          {minutes && (
            <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded font-bold">{minutes}m</span>
          )}
          <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded font-bold">{attempts} attempts</span>
          <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded font-bold">{hints} hints</span>
        </div>
      </div>

      {session.summary ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mt-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-2">
            🦉 Mentor Summary
          </div>
          <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{session.summary}</p>
        </div>
      ) : (
        <p className="text-xs text-zinc-500 italic">No summary available.</p>
      )}

      <button
        onClick={() => setShowLog((v) => !v)}
        className="mt-3 text-xs font-bold text-zinc-500 hover:text-white transition"
      >
        {showLog ? "▾ Hide event log" : "▸ Show event log"}
      </button>
      {showLog && (
        <pre className="mt-2 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-[11px] font-mono text-zinc-400 overflow-x-auto">
          {session.events.map((e, i) => (
            `${new Date(e.at).toISOString().slice(11, 19)}  ${e.type.padEnd(14)}  ${
              e.type === "attempt" ? `passed=${e.payload.passed}${e.payload.error ? ` (${e.payload.error.slice(0, 60)})` : ""}` :
              e.type === "hint_given" ? `"${e.payload.hint.slice(0, 80)}..."` :
              e.type === "hint_request" ? (e.payload.studentMessage || "(no message)") :
              e.type === "completed" ? `score=${e.payload.score}` : ""
            }\n`
          )).join("")}
        </pre>
      )}
    </div>
  );
}
