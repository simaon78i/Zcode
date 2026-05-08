import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api/auth";

export type Role = "student" | "teacher" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  totalScore?: number;
  teacherId?: number | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: "student" | "teacher",
    teacherId?: number,
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setInitializing(false);
      return;
    }
    fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        else localStorage.removeItem("token");
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return { success: true, user: data.user as User };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch {
      return { success: false, message: "Network error" };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: "student" | "teacher",
      teacherId?: number,
    ) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, role, teacherId }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("token", data.token);
          setUser(data.user);
          return { success: true, user: data.user as User };
        }
        return { success: false, message: data.message || "Signup failed" };
      } catch {
        return { success: false, message: "Network error" };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, initializing, login, signup, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (roles && !roles.includes(user.role)) {
      navigate("/", { replace: true });
    }
  }, [user, initializing, roles, navigate]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        Loading...
      </div>
    );
  }
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return <>{children}</>;
}

export function homeForRole(role: Role): string {
  switch (role) {
    case "teacher": return "/teacher/dashboard";
    case "admin":   return "/admin";
    case "student":
    default:        return "/profile";
  }
}

/* ------------------------------------------------------------------ */
/*  Auth Shell                                                         */
/* ------------------------------------------------------------------ */

function AuthShell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="relative max-w-md w-full p-8 bg-zinc-900/80 backdrop-blur rounded-2xl border border-zinc-800 shadow-2xl">
        <button
          onClick={onBack}
          className="mb-5 text-zinc-400 hover:text-white text-sm font-bold transition"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center font-black text-zinc-950 text-lg shadow-lg">
            Z
          </div>
          <h1 className="text-2xl font-black tracking-tight">ZCode</h1>
        </div>
        <h2 className="text-xl font-bold mb-6 text-zinc-300">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Field & Button components                                          */
/* ------------------------------------------------------------------ */

function Field({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      disabled={disabled}
      className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
    />
  );
}

function PrimaryButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full px-4 py-3 mt-2 bg-emerald-500 hover:bg-emerald-400 active:translate-y-px text-zinc-950 rounded-xl font-black text-base transition shadow-[0_4px_0_0_rgb(5,150,105)] hover:shadow-[0_2px_0_0_rgb(5,150,105)] disabled:opacity-50"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Login Form                                                         */
/* ------------------------------------------------------------------ */

export function LoginForm() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.success && result.user) {
      navigate(homeForRole(result.user.role), { replace: true });
    } else {
      setError(result.message || "Login failed");
    }
  };

  return (
    <AuthShell title="Sign in" onBack={() => navigate("/")}>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field type="email" placeholder="Email" value={email} onChange={setEmail} disabled={loading} />
        <Field type="password" placeholder="Password" value={password} onChange={setPassword} disabled={loading} />
        <PrimaryButton loading={loading} label="Sign in" loadingLabel="Loading..." />
      </form>
      <p className="mt-5 text-center text-sm text-zinc-500">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="text-emerald-400 hover:text-emerald-300 font-bold"
        >
          Sign up
        </button>
      </p>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Signup Form                                                        */
/* ------------------------------------------------------------------ */

export function SignupForm() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (role === "student" && (!teacherId || Number(teacherId) <= 0)) {
      setError("Teacher ID is required for students");
      return;
    }

    const result = await signup(
      email,
      password,
      name,
      role,
      role === "student" ? Number(teacherId) : undefined,
    );

    if (result.success && result.user) {
      navigate(homeForRole(result.user.role), { replace: true });
    } else {
      setError(result.message || "Signup failed");
    }
  };

  return (
    <AuthShell title="Create account" onBack={() => navigate("/")}>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field placeholder="Full Name" value={name} onChange={setName} disabled={loading} />
        <Field type="email" placeholder="Email" value={email} onChange={setEmail} disabled={loading} />
        <Field type="password" placeholder="Password" value={password} onChange={setPassword} disabled={loading} />

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          {(["student", "teacher"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={`py-2.5 rounded-lg font-bold text-sm transition ${
                role === r
                  ? "bg-zinc-700 text-white shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {r === "student" ? "👨‍🎓 Student" : "👨‍🏫 Teacher"}
            </button>
          ))}
        </div>

        {/* Teacher ID - only for students */}
        {role === "student" && (
          <div>
            <input
              type="number"
              placeholder="Teacher ID (ask your teacher)"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
            />
            <p className="text-xs text-zinc-500 mt-1 px-1">
              Ask your teacher for their ID to link your account.
            </p>
          </div>
        )}

        <PrimaryButton loading={loading} label="Sign up" loadingLabel="Loading..." />
      </form>
      <p className="mt-5 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-emerald-400 hover:text-emerald-300 font-bold"
        >
          Sign in
        </button>
      </p>
    </AuthShell>
  );
}