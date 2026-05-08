/**
 * Converts raw JavaScript engine errors into kid-friendly explanations.
 * Each pattern returns a two-line message: what went wrong + how to fix it.
 */
export function analyzeError(rawError: string): string {
  const e = rawError;
  const lower = e.toLowerCase();

  // ── Syntax errors ──────────────────────────────────────────────────────────
  if (lower.includes("syntaxerror") || lower.includes("unexpected token")) {
    if (lower.includes("}") || lower.includes("{")) {
      return (
        "🔍 Missing or extra curly bracket { }\n" +
        "Check that every opening { has a matching closing }."
      );
    }
    if (lower.includes(")") || lower.includes("(")) {
      return (
        "🔍 Parenthesis mismatch ( )\n" +
        "Every opening ( needs a closing ) on the same line."
      );
    }
    if (lower.includes("'") || lower.includes('"')) {
      return (
        '🔍 String quote problem\n' +
        'Every opening " or \' needs a matching closing one.'
      );
    }
    if (lower.includes("unexpected end") || lower.includes("unterminated")) {
      return (
        "🔍 Your code ends too early\n" +
        "Did you forget to close a { } block or a string?"
      );
    }
    if (lower.includes("unexpected identifier")) {
      return (
        "🔍 Unexpected word found\n" +
        "This usually means a missing operator (+, -, *, /) or a comma between values."
      );
    }
    return (
      "🔍 Syntax error — the code can't be read\n" +
      "Look for missing brackets, quotes, or typos near the highlighted area."
    );
  }

  // ── Reference errors ───────────────────────────────────────────────────────
  if (lower.includes("is not defined")) {
    const match = e.match(/(\w+) is not defined/i);
    const name = match?.[1] ?? "variable";
    return (
      `🔍 "${name}" doesn't exist yet\n` +
      `Create it first: let ${name} = 0;  — then you can use it.`
    );
  }

  // ── Type errors ────────────────────────────────────────────────────────────
  if (lower.includes("is not a function")) {
    const match = e.match(/([^\s.]+) is not a function/i);
    const name = match?.[1] ?? "it";
    return (
      `🔍 "${name}" is not a function\n` +
      `Make sure you wrote: function ${name}(...) { ... } before calling it.`
    );
  }

  if (lower.includes("cannot read") || lower.includes("cannot access")) {
    return (
      "🔍 Trying to use something that doesn't exist (undefined / null)\n" +
      "Check your variable names for typos."
    );
  }

  // ── Infinite loop / stack overflow ─────────────────────────────────────────
  if (
    lower.includes("stack overflow") ||
    lower.includes("maximum call stack")
  ) {
    return (
      "🔍 Infinite loop — your code never stops!\n" +
      "Check your loop condition: does it eventually become false?"
    );
  }

  // ── Range error ────────────────────────────────────────────────────────────
  if (lower.includes("rangeerror")) {
    return (
      "🔍 Number or range problem\n" +
      "A value is too large, too small, or out of the allowed range."
    );
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return `🔍 ${e}\n\nRead the error carefully — it usually points to the exact problem.`;
}
