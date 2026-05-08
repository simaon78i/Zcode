import { useState } from "react";
import { AppShell, RoleBadge } from "../components/AppShell";

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<ManagedUser[]>([
    { id: 1, name: "Ahmed Sayed", email: "ahmed@example.com", role: "student", createdAt: "2025-09-12" },
    { id: 2, name: "Sara Levi", email: "sara@example.com", role: "teacher", createdAt: "2025-08-03" },
    { id: 3, name: "Omar Cohen", email: "omar@example.com", role: "student", createdAt: "2025-10-21" },
    { id: 4, name: "Maya Bar", email: "maya@example.com", role: "admin", createdAt: "2025-01-01" },
  ]);
  const [filter, setFilter] = useState<"all" | "student" | "teacher" | "admin">("all");

  const counts = {
    all: users.length,
    student: users.filter((u) => u.role === "student").length,
    teacher: users.filter((u) => u.role === "teacher").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);

  const changeRole = (id: number, role: ManagedUser["role"]) => {
    setUsers((arr) => arr.map((u) => (u.id === id ? { ...u, role } : u)));
  };
  const remove = (id: number) => {
    if (!confirm("Permanently delete this user?")) return;
    setUsers((arr) => arr.filter((u) => u.id !== id));
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-rose-400 font-black text-xs tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-3xl font-black">User Management</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatTile label="Total Users" value={counts.all} accent="text-white" />
          <StatTile label="Students" value={counts.student} accent="text-emerald-400" />
          <StatTile label="Teachers" value={counts.teacher} accent="text-sky-400" />
          <StatTile label="Admins" value={counts.admin} accent="text-rose-400" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", "student", "teacher", "admin"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-black transition ${
                filter === f
                  ? "bg-emerald-500 text-zinc-950"
                  : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              {f === "all" ? "All" : f === "student" ? "Students" : f === "teacher" ? "Teachers" : "Admins"}
            </button>
          ))}
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-black text-zinc-500 uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 w-1 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/40 transition">
                  <td className="px-4 py-3 font-bold">{u.name}</td>
                  <td className="px-4 py-3 text-zinc-400 text-sm">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">{u.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value as ManagedUser["role"])}
                        className="bg-zinc-950 border border-zinc-800 text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => remove(u.id)}
                        className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-black transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="px-4 py-10 text-center text-zinc-500">No users in this category</div>}
        </div>
      </div>
    </AppShell>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
      <div className="text-xs font-bold text-zinc-500 mb-1">{label}</div>
      <div className={`text-3xl font-black ${accent}`}>{value}</div>
    </div>
  );
}
