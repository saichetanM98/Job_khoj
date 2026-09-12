import OpenAI from "openai";

/**
 * Universally resolves OpenAI-compatible clients for free/paid AI providers:
 * 1. Groq (Free, ultra-fast): GROQ_API_KEY -> https://api.groq.com/openai/v1 (openai/gpt-oss-120b)
 * 2. Google Gemini: GEMINI_API_KEY -> https://generativelanguage.googleapis.com/v1beta/openai/ (gemini-3.6-flash)
 * 3. OpenRouter: OPENROUTER_API_KEY -> https://openrouter.ai/api/v1 (meta-llama/llama-3.3-70b-instruct:free)
 * 4. OpenAI: OPENAI_API_KEY -> https://api.openai.com/v1 (gpt-4o)
 */
export function getOpenAIClient(): { client: OpenAI; model: string } {
  // 1. Groq (Ultra-fast LLM inference, free tier with high rate limit)
  const groqKey =
    process.env.GROQ_API_KEY ||
    (process.env.OPENAI_API_KEY?.startsWith("gsk_") ? process.env.OPENAI_API_KEY : null);
  if (groqKey && groqKey.startsWith("gsk_")) {
    return {
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
        maxRetries: 1,
      }),
      model: "openai/gpt-oss-120b",
    };
  }

  // 2. Google Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 10) {
    return {
      client: new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        maxRetries: 0,
      }),
      model: "gemini-3.6-flash",
    };
  }

  // 3. OpenRouter
  const routerKey =
    process.env.OPENROUTER_API_KEY ||
    (process.env.OPENAI_API_KEY?.startsWith("sk-or-") ? process.env.OPENAI_API_KEY : null);
  if (routerKey) {
    return {
      client: new OpenAI({
        apiKey: routerKey,
        baseURL: "https://openrouter.ai/api/v1",
      }),
      model: "meta-llama/llama-3.3-70b-instruct:free",
    };
  }

  // 4. OpenAI
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && openAiKey.startsWith("sk-")) {
    return {
      client: new OpenAI({
        apiKey: openAiKey,
      }),
      model: "gpt-4o",
    };
  }

  throw new Error(
    "Missing AI API key. Please add GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY to .env.local."
  );
}

export interface AIProviderConfig {
  name: string;
  client: OpenAI;
  model: string;
}

/**
 * Returns all configured AI providers in prioritized order (Groq -> Gemini -> OpenRouter -> OpenAI),
 * initialized with an optional per-request timeout and zero retries to prevent blocking fallbacks.
 */
export function getAvailableAIProviders(timeoutMs = 15000): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];

  // 1. Groq (Ultra-fast, 120b & 27b models)
  const groqKey =
    process.env.GROQ_API_KEY ||
    (process.env.OPENAI_API_KEY?.startsWith("gsk_") ? process.env.OPENAI_API_KEY : null);
  if (groqKey && groqKey.startsWith("gsk_")) {
    providers.push({
      name: "Groq (GPT-OSS-120B)",
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
        timeout: timeoutMs,
        maxRetries: 0,
      }),
      model: "openai/gpt-oss-120b",
    });
    providers.push({
      name: "Groq (Qwen-3.8-27B)",
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
        timeout: timeoutMs,
        maxRetries: 0,
      }),
      model: "qwen/qwen3.8-27b",
    });
  }

  // 2. Google Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 10) {
    providers.push({
      name: "Google Gemini",
      client: new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        timeout: timeoutMs,
        maxRetries: 0,
      }),
      model: "gemini-3.6-flash",
    });
  }

  // 3. OpenRouter
  const routerKey =
    process.env.OPENROUTER_API_KEY ||
    (process.env.OPENAI_API_KEY?.startsWith("sk-or-") ? process.env.OPENAI_API_KEY : null);
  if (routerKey) {
    providers.push({
      name: "OpenRouter",
      client: new OpenAI({
        apiKey: routerKey,
        baseURL: "https://openrouter.ai/api/v1",
        timeout: timeoutMs,
        maxRetries: 0,
      }),
      model: "meta-llama/llama-3.3-70b-instruct:free",
    });
  }

  // 4. OpenAI
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && openAiKey.startsWith("sk-")) {
    providers.push({
      name: "OpenAI",
      client: new OpenAI({
        apiKey: openAiKey,
        timeout: timeoutMs,
        maxRetries: 0,
      }),
      model: "gpt-4o",
    });
  }

  return providers;
}

// Proxy client for backwards compatibility
export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    const { client } = getOpenAIClient();
    return (client as unknown as Record<string, unknown>)[prop as string];
  },
});
