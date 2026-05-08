import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { MentorPanel, type HintRequest } from "../components/MentorPanel";

const API_BASE = "http://localhost:3001/api";

const GAME_ID = "fix-the-loop";
const GAME_TITLE = "Fix the Loop";

const PROBLEM_STATEMENT = `The function below is supposed to return the sum of all integers from 1 to n (inclusive).
For example, sumTo(5) should return 15 (1+2+3+4+5).
But it has a bug! Fix it.`;

const EXPECTED = "sumTo(n) returns 1 + 2 + ... + n";

const STARTER_CODE = `function sumTo(n) {
  let sum = 0;
  for (let i = 1; i < n; i++) {
    sum += i;
  }
  return sum;
}`;

// Hidden test cases
const TEST_CASES: { input: number; expected: number }[] = [
  { input: 1, expected: 1 },
  { input: 5, expected: 15 },
  { input: 10, expected: 55 },
  { input: 100, expected: 5050 },
];

export default function FixTheLoopGame() {
  const navigate = useNavigate();
  const [code, setCode] = useState(STARTER_CODE);
  const [output, setOutput] = useState<string>("");
  const [lastError, setLastError] = useState<string>("");
  const [passed, setPassed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const sessionIdRef = useRef<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Start session on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/sessions/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gameId: GAME_ID, gameTitle: GAME_TITLE }),
      });
      const data = await res.json();
      if (!cancelled && data.success) {
        sessionIdRef.current = data.sessionId;
        setSessionId(data.sessionId);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const logAttempt = async (didPass: boolean, error?: string) => {
    if (!sessionIdRef.current) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/sessions/${sessionIdRef.current}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ passed: didPass, code, error }),
    });
  };

  const runTests = () => {
    setOutput("");
    setLastError("");

    let fn: any;
    try {
      // Sandbox-light: wrap in IIFE so user's `function sumTo` becomes a value.
      // NOT a real sandbox — fine for trusted educational use.
      fn = new Function(`${code}; return sumTo;`)();
      if (typeof fn !== "function") throw new Error("sumTo is not a function");
    } catch (err) {
      const msg = (err as Error).message;
      setLastError(msg);
      setOutput(`❌ Could not run your code: ${msg}`);
      logAttempt(false, msg);
      return;
    }

    const results: string[] = [];
    let allPassed = true;
    for (const t of TEST_CASES) {
      try {
        const got = fn(t.input);
        const ok = got === t.expected;
        if (!ok) allPassed = false;
        results.push(`${ok ? "✅" : "❌"} sumTo(${t.input}) → ${got}  (expected ${t.expected})`);
      } catch (err) {
        allPassed = false;
        results.push(`❌ sumTo(${t.input}) threw: ${(err as Error).message}`);
      }
    }

    setOutput(results.join("\n"));
    setPassed(allPassed);
    if (allPassed) {
      setLastError("");
      logAttempt(true);
    } else {
      // Set lastError to the first failing test for the mentor to see
      const firstFail = results.find((r) => r.startsWith("❌"));
      setLastError(firstFail || "Some tests failed");
      logAttempt(false, firstFail);
    }
  };

  const finish = async () => {
    if (!sessionIdRef.current) return;
    const token = localStorage.getItem("token");
    // Score: 100 if passed first try, lose 10 per hint, min 50
    const finalScore = passed ? 100 : 0;
    const res = await fetch(`${API_BASE}/sessions/${sessionIdRef.current}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ score: finalScore }),
    });
    const data = await res.json();
    setScore(finalScore);
    setSummary(data.summary || null);
    setCompleted(true);
  };

  // What MentorPanel will read whenever user clicks Hint
  const getMentorContext = (): HintRequest => ({
    problemStatement: PROBLEM_STATEMENT,
    studentAttempt: code,
    expectedBehavior: EXPECTED,
    lastError: lastError || undefined,
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-5">
          <button onClick={() => navigate("/")} className="text-zinc-400 hover:text-white text-sm font-bold mb-3">
            ← Back to games
          </button>
          <h1 className="text-3xl font-black">{GAME_TITLE}</h1>
          <p className="text-zinc-400 mt-1 text-sm">Code challenge · Easy</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-stretch">
          {/* Main game area */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-500 mb-2">Problem</h2>
              <p className="text-zinc-200 whitespace-pre-line leading-relaxed">{PROBLEM_STATEMENT}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-500">Your Code</h2>
                <button
                  onClick={() => setCode(STARTER_CODE)}
                  className="text-xs font-bold text-zinc-500 hover:text-white transition"
                >
                  Reset
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={10}
                spellCheck={false}
                className="w-full px-4 py-3 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-emerald-300 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition font-mono text-sm resize-none leading-relaxed"
              />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-500">Output</h2>
                <div className="flex gap-2">
                  <button
                    onClick={runTests}
                    disabled={completed}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 rounded-xl font-black text-sm transition shadow-[0_3px_0_0_rgb(5,150,105)] hover:shadow-[0_1px_0_0_rgb(5,150,105)] active:translate-y-px"
                  >
                    ▶ Run Tests
                  </button>
                  {passed && !completed && (
                    <button
                      onClick={finish}
                      className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 rounded-xl font-black text-sm transition shadow-[0_3px_0_0_rgb(2,132,199)] hover:shadow-[0_1px_0_0_rgb(2,132,199)] active:translate-y-px"
                    >
                      Finish ✓
                    </button>
                  )}
                </div>
              </div>
              <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-sm min-h-24 whitespace-pre-wrap text-zinc-300">
                {output || "Click \"Run Tests\" to check your code."}
              </pre>
            </div>

            {completed && (
              <div className="bg-zinc-900 border-2 border-emerald-500/40 rounded-2xl p-5">
                <h2 className="text-emerald-400 font-black text-lg mb-1">Session complete!</h2>
                <p className="text-zinc-400 text-sm mb-3">Final score: {score} · Your teacher will see a summary of how it went.</p>
                {summary ? (
                  <details className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                    <summary className="cursor-pointer text-xs font-black uppercase tracking-wider text-zinc-500">
                      Preview teacher summary
                    </summary>
                    <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap leading-relaxed">{summary}</p>
                  </details>
                ) : (
                  <p className="text-xs text-zinc-500">(No summary generated — mentor may be unavailable.)</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => navigate("/profile")} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-bold transition">
                    Back to profile
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mentor panel */}
          <div className="lg:sticky lg:top-20 self-start lg:h-[calc(100vh-6rem)]">
            <MentorPanel sessionId={sessionId} getContext={getMentorContext} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
