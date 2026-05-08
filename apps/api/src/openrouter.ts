/**
 * Thin wrapper around OpenRouter (OpenAI-compatible API).
 * Set OPENROUTER_API_KEY and optionally OPENROUTER_MODEL in your .env.
 */

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL ?? "openrouter/auto";
const APP_NAME = "ZCode";
const APP_URL = process.env.APP_URL ?? "http://localhost:5173";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OpenRouterError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function chat(messages: ChatMessage[], opts: { temperature?: number; maxTokens?: number } = {}): Promise<string> {
  if (!API_KEY) {
    throw new OpenRouterError(500, "OPENROUTER_API_KEY is not set");
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      // OpenRouter recommends these for app attribution + rate-limit eligibility
      "HTTP-Referer": APP_URL,
      "X-Title": APP_NAME,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.maxTokens ?? 400,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new OpenRouterError(res.status, `OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenRouterError(502, "OpenRouter returned no content");
  }
  return content.trim();
}
