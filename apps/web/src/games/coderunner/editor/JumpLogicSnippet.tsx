import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function JumpLogicSnippet({
  blanks,
  onChange,
  onRequestApply,
}: {
  blanks: { inputProp: string; action: string };
  onChange: (patch: Partial<{ inputProp: string; action: string }>) => void;
  /** Called when user presses Enter in a blank (submit / bind logic). */
  onRequestApply?: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-600 bg-[#070b17] px-4 py-4 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
      <div className="relative overflow-hidden rounded-lg border border-cyan-500/10 bg-[#050814] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.06)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.03]" />
        <pre
          className="relative whitespace-pre pl-5 font-mono text-[15px] leading-relaxed"
          style={{
            fontFamily: "\"JetBrains Mono\", ui-monospace, monospace",
            margin: 0,
            borderLeft: "2px solid rgba(34,211,238,0.14)",
          }}
        >
          <span className="font-semibold text-violet-300">if</span> <LockTok>(</LockTok>
          <span className="text-emerald-300/95">input</span>
          <LockTok>.</LockTok>
          <BlankInput
            value={blanks.inputProp}
            pulseDelay={0}
            onChange={(next) => onChange({ inputProp: next })}
            onRequestApply={onRequestApply}
          />
          <LockTok> === </LockTok>
          <span className="text-amber-200/95">&quot;Space&quot;</span>
          <LockTok>)</LockTok> <LockTok>{"{"}</LockTok>
          {"\n"}
          {"  "}
          <span className="text-cyan-200/95">car</span>
          <LockTok>.</LockTok>
          <BlankInput
            value={blanks.action}
            pulseDelay={1.25}
            onChange={(next) => onChange({ action: next })}
            onRequestApply={onRequestApply}
          />
          <span className="text-emerald-200/90">()</span>
          {"\n"}
          <LockTok>{"}"}</LockTok>
        </pre>
      </div>
      <div className="mt-3 border-t border-slate-700/80 pt-2 text-[11px] text-slate-500">
        Locked tokens are dim but legible; glowing blanks are the only slots the interpreter waits on.
      </div>
    </div>
  );
}

function LockTok({ children }: { children: ReactNode }) {
  return <span className="text-slate-500/82">{children}</span>;
}

function BlankInput({
  value,
  pulseDelay,
  onChange,
  onRequestApply,
}: {
  value: string;
  pulseDelay?: number;
  onChange: (v: string) => void;
  onRequestApply?: () => void;
}) {
  return (
    <motion.span
      className="inline-flex align-middle"
      animate={{
        boxShadow: [
          "0 0 0 rgba(34,211,238,0)",
          "0 0 12px rgba(34,211,238,0.45)",
          "0 0 0 rgba(34,211,238,0)",
        ],
      }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: pulseDelay ?? 0 }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onRequestApply?.();
          }
        }}
        aria-label="Scaffold blank"
        className="mx-[2px] min-w-[4.75rem] max-w-[160px] rounded border border-cyan-400/55 bg-[#022032] px-2 py-[1px] text-center align-middle font-mono font-semibold text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.28)] outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:shadow-[0_0_14px_rgba(34,211,238,0.55)]"
        placeholder="_____"
        spellCheck={false}
      />
    </motion.span>
  );
}
