import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";

export function CreateGame() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = () => {
    if (!title || !content) {
      alert("Please fill all fields");
      return;
    }
    console.log("Create game:", { title, description, content });
    navigate("/teacher/dashboard");
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-emerald-400 font-black text-xs tracking-widest uppercase mb-1">New Game</p>
          <h1 className="text-3xl font-black">Create Game</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <FormField label="Game Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Array Basics"
              className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what students will learn"
              rows={3}
              className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </FormField>

          <FormField label="Game Content (JSON)">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='{"questions": [], "answers": []}'
              rows={10}
              className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition font-mono text-sm resize-none"
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              className="flex-1 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-black transition shadow-[0_4px_0_0_rgb(5,150,105)] hover:shadow-[0_2px_0_0_rgb(5,150,105)] active:translate-y-px"
            >
              Create Game
            </button>
            <button
              onClick={() => navigate("/teacher/dashboard")}
              className="flex-1 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-black transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}
