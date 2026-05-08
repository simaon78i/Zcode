import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../auth";

interface Game {
  id: string;
  slug: string;            // matches filename in /public/games/<slug>.png
  title: string;
  category: string;
  emoji: string;           // fallback if image missing
  difficulty: "Easy" | "Medium" | "Hard";
  players: number;
  accent: string;          // tailwind gradient classes (fallback bg)
  path?: string;           // route to navigate to when card clicked; undefined = "coming soon"
}

const GAMES: Game[] = [
  { id: "0",  slug: "codebreaker",       title: "CodeBreaker: Diamond Heist", category: "Code", emoji: "💎", difficulty: "Medium", players: 4200, accent: "from-purple-500 via-fuchsia-500 to-pink-500", path: "/play/codebreaker" },
  { id: "00", slug: "coderunner",        title: "CodeRunner",         category: "Code",    emoji: "🏎️", difficulty: "Medium", players: 3100, accent: "from-cyan-500 via-sky-500 to-blue-600", path: "/play/coderunner" },
  { id: "1",  slug: "array-basics",      title: "Array Basics",     category: "Code",    emoji: "🔵", difficulty: "Easy",   players: 2840, accent: "from-blue-500 to-cyan-500" },
  { id: "2",  slug: "loop-master",       title: "Fix the Loop",     category: "Code",    emoji: "🔴", difficulty: "Easy",   players: 1920, accent: "from-red-500 to-orange-500", path: "/play/fix-the-loop" },
  { id: "3",  slug: "recursion-quest",   title: "Recursion Quest",  category: "Code",    emoji: "🟡", difficulty: "Hard",   players: 760,  accent: "from-yellow-400 to-amber-500" },
  { id: "4",  slug: "algorithm-race",    title: "Algorithm Race",   category: "Code",    emoji: "🟢", difficulty: "Medium", players: 1340, accent: "from-emerald-500 to-green-500" },
  { id: "5",  slug: "data-structure",    title: "Data Structure",   category: "Code",    emoji: "🟣", difficulty: "Hard",   players: 980,  accent: "from-purple-500 to-fuchsia-500" },
  { id: "6",  slug: "gravity-sim",       title: "Gravity Sim",      category: "Physics", emoji: "⚙️", difficulty: "Medium", players: 1100, accent: "from-slate-500 to-zinc-500" },
  { id: "7",  slug: "force-calc",        title: "Force Calc",       category: "Physics", emoji: "⚡", difficulty: "Hard",   players: 540,  accent: "from-yellow-500 to-orange-600" },
  { id: "8",  slug: "motion-lab",        title: "Motion Lab",       category: "Physics", emoji: "🚀", difficulty: "Easy",   players: 2200, accent: "from-sky-500 to-indigo-500" },
  { id: "9",  slug: "vocab-builder",     title: "Vocab Builder",    category: "English", emoji: "📖", difficulty: "Easy",   players: 3100, accent: "from-pink-500 to-rose-500" },
  { id: "10", slug: "grammar-run",       title: "Grammar Run",      category: "English", emoji: "✏️", difficulty: "Medium", players: 1450, accent: "from-violet-500 to-purple-600" },
  { id: "11", slug: "speed-reading",     title: "Speed Reading",    category: "English", emoji: "📚", difficulty: "Hard",   players: 620,  accent: "from-amber-500 to-red-500" },
  { id: "12", slug: "calculus-quest",    title: "Calculus Quest",   category: "Math",    emoji: "📐", difficulty: "Hard",   players: 880,  accent: "from-teal-500 to-emerald-600" },
  { id: "13", slug: "algebra-master",    title: "Algebra Master",   category: "Math",    emoji: "🔢", difficulty: "Medium", players: 1760, accent: "from-cyan-500 to-blue-600" },
  { id: "14", slug: "geometry-pro",      title: "Geometry Pro",     category: "Math",    emoji: "🔺", difficulty: "Easy",   players: 2050, accent: "from-lime-500 to-green-600" },
];

const CATEGORIES = ["Code", "Physics", "English", "Math"];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <Hero
          user={user ? { name: user.name, role: user.role } : null}
          onCTA={() => navigate(user ? "/games" : "/signup")}
        />

        <Section title="🔥 Trending This Week" subtitle="The most-played games">
          <CardRow games={[...GAMES].sort((a, b) => b.players - a.players).slice(0, 6)} />
        </Section>

        {CATEGORIES.map((cat) => (
          <Section
            key={cat}
            title={`${categoryEmoji(cat)} ${cat}`}
            subtitle={`${GAMES.filter((g) => g.category === cat).length} games`}
          >
            <CardRow games={GAMES.filter((g) => g.category === cat)} />
          </Section>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </AppShell>
  );
}

function Hero({
  user,
  onCTA,
}: {
  user: { name: string; role: string } | null;
  onCTA: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 via-zinc-900 to-sky-500/20 border border-zinc-800 p-8 md:p-10 mb-10">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(16,185,129,.4), transparent 50%), radial-gradient(circle at 80% 80%, rgba(14,165,233,.4), transparent 50%)",
        }}
      />
      <div className="relative">
        {user ? (
          <>
            <p className="text-emerald-400 font-black text-sm tracking-widest uppercase mb-2">Welcome back</p>
            <h2 className="text-4xl md:text-5xl font-black mb-3 leading-tight">{user.name}</h2>
            <p className="text-zinc-400 text-lg mb-6 max-w-xl">
              Pick up where you left off, or explore new games waiting for you.
            </p>
          </>
        ) : (
          <>
            <p className="text-emerald-400 font-black text-sm tracking-widest uppercase mb-2">
              Interactive learning platform
            </p>
            <h2 className="text-4xl md:text-5xl font-black mb-3 leading-tight">Learn through games</h2>
            <p className="text-zinc-400 text-lg mb-6 max-w-xl">
              Hundreds of mini-games in code, physics, math, and English. Sign in, play, learn.
            </p>
          </>
        )}
        <button
          onClick={onCTA}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-black transition shadow-[0_4px_0_0_rgb(5,150,105)] hover:shadow-[0_2px_0_0_rgb(5,150,105)] active:translate-y-px"
        >
          {user ? "Keep playing →" : "Get started →"}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
        <button className="text-sm font-bold text-zinc-400 hover:text-emerald-400 transition">
          See all →
        </button>
      </div>
      {children}
    </section>
  );
}

function CardRow({ games }: { games: Game[] }) {
  return (
    <div className="overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6">
      <div className="flex gap-4 min-w-min">
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  // Image with graceful fallback to gradient+emoji if file is missing
  const [imageOk, setImageOk] = useState(true);
  const imageUrl = `/games/${game.slug}.png`;
  const isPlayable = !!game.path;

  const inner = (
    <>
      <div className={`h-32 relative overflow-hidden bg-gradient-to-br ${game.accent}`}>
        {imageOk ? (
          <img
            src={imageUrl}
            alt={game.title}
            loading="lazy"
            onError={() => setImageOk(false)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-lg pointer-events-none">
            {game.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent pointer-events-none" />
        {!isPlayable && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-zinc-950/80 border border-zinc-700 rounded text-[10px] font-black uppercase tracking-wider text-zinc-300">
            Soon
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h4 className="font-black text-base mb-2 truncate">{game.title}</h4>
        <div className="flex items-center justify-between">
          <DifficultyPill d={game.difficulty} />
          <span className="text-xs text-zinc-500 font-bold">👥 {formatNum(game.players)}</span>
        </div>
      </div>
    </>
  );

  const baseClasses =
    "group flex-shrink-0 w-52 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 transition-all duration-200 text-left shadow-lg block";

  if (isPlayable && game.path) {
    return (
      <Link
        to={game.path}
        className={`${baseClasses} hover:border-zinc-700 hover:-translate-y-1 hover:shadow-2xl`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={`${baseClasses} cursor-default opacity-75`}>
      {inner}
    </div>
  );
}

function DifficultyPill({ d }: { d: "Easy" | "Medium" | "Hard" }) {
  const map = {
    Easy: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Hard: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  } as const;
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-black rounded border ${map[d]}`}>
      {d}
    </span>
  );
}

function formatNum(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}
function categoryEmoji(c: string) {
  return ({ Code: "💻", Physics: "⚛️", English: "📚", Math: "🧮" } as Record<string, string>)[c] || "";
}
