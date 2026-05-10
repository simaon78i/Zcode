import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, homeForRole } from "../auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center justify-between px-5 h-14">
          <Link to={user ? homeForRole(user.role) : "/"} className="flex items-center gap-2.5">
            <img src="/games/zcode-icon.jpeg" alt="ZCode" className="w-9 h-9 rounded-lg object-cover shadow-md" />
            <span className="text-lg font-black tracking-tight">ZCode</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                type="text"
                placeholder="Search games..."
                className="w-full h-10 pl-10 pr-4 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <RoleBadge role={user.role} />
              <div className="hidden sm:block">
                <div className="text-sm font-bold leading-tight">{user.name}</div>
                <div className="text-xs text-zinc-500 leading-tight">{user.email}</div>
              </div>
              <Avatar name={user.name} />
              <button
                onClick={handleLogout}
                className="ml-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-sm font-black transition shadow-[0_3px_0_0_rgb(5,150,105)] hover:shadow-[0_1px_0_0_rgb(5,150,105)] active:translate-y-px"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  type Item = { to: string; label: string; icon: ReactNode };
  const items: Item[] = [{ to: "/", label: "Home", icon: <IconHome /> }];

  if (user?.role === "student") {
    items.push(
      { to: "/profile", label: "My Profile", icon: <IconUser /> },
      { to: "/games", label: "My Games", icon: <IconGame /> },
    );
  }
  if (user?.role === "teacher") {
    items.push(
      { to: "/teacher/dashboard", label: "Dashboard", icon: <IconDash /> },
      { to: "/teacher/create-game", label: "Create Game", icon: <IconPlus /> },
    );
  }
  if (user?.role === "admin") {
    items.push({ to: "/admin", label: "Admin Panel", icon: <IconShield /> });
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-zinc-900 border-r border-zinc-800 py-4 px-3 gap-1">
      {items.map((it) => {
        const active = location.pathname === it.to;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition ${
              active
                ? "bg-zinc-800 text-emerald-400"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            <span className="w-5 h-5">{it.icon}</span>
            {it.label}
          </Link>
        );
      })}

      {!user && (
        <div className="mt-auto p-3 bg-zinc-800/60 rounded-xl text-xs text-zinc-400">
          Sign in to track your progress and access games assigned to you.
        </div>
      )}
    </aside>
  );
}

export function RoleBadge({ role }: { role: "student" | "teacher" | "admin" }) {
  const styles =
    role === "admin"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : role === "teacher"
      ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  const label = role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "Student";
  return (
    <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-md text-xs font-black border ${styles}`}>
      {label}
    </span>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center font-black text-zinc-950 text-sm shadow-md">
      {initials || "?"}
    </div>
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
function IconHome()   { return <svg viewBox="0 0 24 24" {...stroke}><path d="M3 11l9-8 9 8M5 10v10h14V10" /></svg>; }
function IconUser()   { return <svg viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>; }
function IconGame()   { return <svg viewBox="0 0 24 24" {...stroke}><rect x="2" y="7" width="20" height="12" rx="3" /><path d="M7 13h2M8 12v2M15 13h.01M17 13h.01" /></svg>; }
function IconDash()   { return <svg viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>; }
function IconPlus()   { return <svg viewBox="0 0 24 24" {...stroke}><path d="M12 5v14M5 12h14" /></svg>; }
function IconShield() { return <svg viewBox="0 0 24 24" {...stroke}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /></svg>; }
