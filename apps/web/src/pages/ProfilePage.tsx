import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, RoleBadge } from "../components/AppShell";
import { useAuth } from "../auth";

const API_BASE = "http://localhost:3001/api";

// Map gameId → route. Add new entries here as you build more games.
const GAME_ROUTES: Record<string, { path: string; emoji: string; category: string }> = {
  "fix-the-loop": { path: "/play/fix-the-loop", emoji: "🔴", category: "Code" },
  "codebreaker":  { path: "/play/codebreaker",  emoji: "💎", category: "Code" },
};

interface Session {
  id: number;
  gameId: string;
  gameTitle: string;
  startedAt: string;
  completedAt: string | null;
  finalScore: number | null;
  status: "active" | "completed" | "abandoned";
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoadingSessions(false); return; }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/sessions/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setSessions(data.sessions ?? []);
        }
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!user) return null;

  // Real stats derived from sessions
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const stats = {
    totalScore: completedSessions.reduce((sum, s) => sum + (s.finalScore ?? 0), 0),
    gamesCompleted: completedSessions.length,
    streak: 0, // placeholder until we add streak logic
    rank: 1,   // placeholder until we add a leaderboard endpoint
  };

  const recentGames = sessions.slice(0, 5);

  const badges = [
    { id: 1, label: "Hot Start", emoji: "🔥", earned: completedSessions.length >= 1 },
    { id: 2, label: "Loop Master", emoji: "🔁", earned: completedSessions.some((s) => s.gameId === "fix-the-loop") },
    { id: 3, label: "Diamond Thief", emoji: "💎", earned: completedSessions.some((s) => s.gameId === "codebreaker") },
    { id: 4, label: "Top Student", emoji: "⭐", earned: completedSessions.length >= 3 },
    { id: 5, label: "Legend", emoji: "👑", earned: completedSessions.length >= 10 },
  ];

  const handleGameClick = (gameId: string) => {
    const route = GAME_ROUTES[gameId];
    if (route) navigate(route.path);
    else navigate("/"); // fallback: send back to homepage
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/15 via-zinc-900 to-sky-500/15 border border-zinc-800 p-8 mb-8">
          <div className="absolute inset-0 opacity-25 pointer-events-none"
               style={{ backgroundImage: "radial-gradient(circle at 20% 0%, rgba(16,185,129,.5), transparent 40%)" }} />
          <div className="relative flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center font-black text-zinc-950 text-3xl shadow-xl">
              {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black">{user.name}</h1>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-zinc-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Score" value={stats.totalScore.toLocaleString()} accent="text-emerald-400" />
          <StatCard label="Games Completed" value={stats.gamesCompleted} accent="text-sky-400" />
          <StatCard label="Day Streak" value={`🔥 ${stats.streak}`} accent="text-amber-400" />
          <StatCard label="Sessions" value={sessions.length} accent="text-rose-400" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
            <h3 className="text-lg font-black mb-4">Recent Sessions</h3>
            {loadingSessions ? (
              <p className="text-sm text-zinc-500">Loading...</p>
            ) : recentGames.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-zinc-500 mb-3">No sessions yet — go play a game!</p>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-black text-sm transition shadow-[0_3px_0_0_rgb(5,150,105)] hover:shadow-[0_1px_0_0_rgb(5,150,105)] active:translate-y-px"
                >
                  Browse games
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentGames.map((s) => {
                  const route = GAME_ROUTES[s.gameId];
                  const isPlayable = !!route;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleGameClick(s.gameId)}
                      disabled={!isPlayable}
                      className={`w-full flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 transition text-left ${
                        isPlayable
                          ? "hover:border-emerald-500/50 hover:-translate-y-0.5 cursor-pointer"
                          : "opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-lg bg-zinc-800 flex items-center justify-center text-2xl">
                        {route?.emoji ?? "🎮"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{s.gameTitle}</div>
                        <div className="text-xs text-zinc-500">
                          {route?.category ?? "Game"} • {formatDate(s.startedAt)}
                          {s.status !== "completed" && (
                            <span className="ml-2 text-amber-400">· {s.status}</span>
                          )}
                        </div>
                      </div>
                      {s.finalScore !== null && (
                        <div className="text-emerald-400 font-black shrink-0">{s.finalScore}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5">
            <h3 className="text-lg font-black mb-4">Badges</h3>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => (
                <div key={b.id} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition ${
                  b.earned ? "bg-zinc-950 border-zinc-700" : "bg-zinc-950/50 border-zinc-800 opacity-40"
                }`}>
                  <span className="text-3xl">{b.emoji}</span>
                  <span className="text-[11px] font-bold text-center text-zinc-300">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
      <div className="text-xs font-bold text-zinc-500 mb-1">{label}</div>
      <div className={`text-2xl font-black ${accent}`}>{value}</div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return d.toLocaleDateString();
}
