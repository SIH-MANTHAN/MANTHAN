import type { DashboardSnapshot, LocaleCode } from '../types';
import { LOCALE_META } from '../i18n/ui';

/**
 * Optional, pluggable real-LLM chat layer. Bring-your-own-key: reads
 * VITE_LLM_PROVIDER / VITE_LLM_API_KEY from the build's .env file (see
 * .env.example). If no key is configured, or the call fails for any reason
 * (network, CORS, quota), this returns null and the caller (chatService)
 * silently falls back to the offline template system — the chat never
 * breaks, it just loses the "real model" polish.
 *
 * SECURITY NOTE: this is a client-side, browser-only app. Any key placed in
 * VITE_LLM_API_KEY is bundled into the shipped JS and visible to anyone who
 * opens dev tools — fine for a hackathon/demo build with a scoped, low-limit
 * key, not something to reuse for a public production deployment. For that,
 * proxy this call through a backend (e.g. the FastAPI conversation_agent
 * already planned for this project) instead.
 */

type Provider = 'anthropic' | 'openai' | 'google';

function getProvider(): Provider {
  const raw = (import.meta.env.VITE_LLM_PROVIDER as string | undefined)?.toLowerCase();
  if (raw === 'openai' || raw === 'google') return raw;
  return 'anthropic';
}

function getApiKey(): string | undefined {
  return import.meta.env.VITE_LLM_API_KEY as string | undefined;
}

export function llmConfigured(): boolean {
  return Boolean(getApiKey());
}

function summarizeDashboard(dashboard: DashboardSnapshot | null): string {
  if (!dashboard) return 'No live dashboard data loaded yet.';
  const o = dashboard.ocean;
  const nearest = [...dashboard.nearbyPfz].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const topAlert = dashboard.alerts[0];
  return [
    `Location: ${dashboard.locationLabel} (${dashboard.location.lat.toFixed(3)}, ${dashboard.location.lng.toFixed(3)})`,
    `SST: ${o.sst.valueC}°C (${o.sst.source})`,
    `Chlorophyll-a: ${o.chlorophyll.valueMgM3} mg/m3 (${o.chlorophyll.source})`,
    `Waves: ${o.waves.heightM} m, period ${o.waves.periodS}s, severity ${o.waves.severity} (${o.waves.source})`,
    `Wind: ${o.wind.speedKnots} kt, gusts ${o.wind.gustKnots} kt (${o.wind.source})`,
    `Weather: ${o.weather.description}, ${o.weather.temperatureC}°C (${o.weather.source})`,
    `Overall safety: ${dashboard.safety.overall} — ${dashboard.safety.summary}`,
    nearest
      ? `Nearest PFZ: ${nearest.name}, ${nearest.distanceKm} km away, productivity ${nearest.productivity}, safety ${nearest.safety}`
      : 'No PFZ data.',
    topAlert ? `Top alert: ${topAlert.title} — ${topAlert.summary}` : 'No active alerts.',
    `Marine-life sightings on record: ${dashboard.marineLife.length}`,
  ].join('\n');
}

function buildSystemPrompt(locale: LocaleCode, dashboard: DashboardSnapshot | null): string {
  const langName = LOCALE_META[locale]?.native ?? 'English';
  return [
    'You are MANTHAN, a multi-agent marine-intelligence assistant for Indian coastal fishers, researchers, ',
    'maritime and coastal-authority users. You have access to a live dashboard snapshot below — ground your ',
    'answer in it, and say clearly when something is a general estimate rather than a measured reading. ',
    'Keep answers concise (roughly 3-6 sentences unless the question needs a list), practical, and safety-aware ',
    `(flag any real risk plainly). Reply only in ${langName}. Never claim to be a different product.`,
    '',
    '--- Current dashboard snapshot ---',
    summarizeDashboard(dashboard),
  ].join('\n');
}

async function callAnthropic(apiKey: string, system: string, question: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: (import.meta.env.VITE_LLM_MODEL as string) || 'claude-sonnet-5',
      max_tokens: 700,
      system,
      messages: [{ role: 'user', content: question }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data = await res.json();
  const text = data?.content?.map((b: any) => b.text ?? '').join('\n').trim();
  if (!text) throw new Error('Empty Anthropic response');
  return text;
}

async function callOpenAI(apiKey: string, system: string, question: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: (import.meta.env.VITE_LLM_MODEL as string) || 'gpt-4o-mini',
      max_tokens: 700,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: question },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty OpenAI response');
  return text;
}

async function callGemini(apiKey: string, system: string, question: string): Promise<string> {
  const model = (import.meta.env.VITE_LLM_MODEL as string) || 'gemini-2.0-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('\n').trim();
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

/** Returns a real-LLM answer, or null if unconfigured / the call failed —
 *  callers should fall back to the offline template system on null. */
export async function askLlm(
  question: string,
  locale: LocaleCode,
  dashboard: DashboardSnapshot | null,
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const system = buildSystemPrompt(locale, dashboard);
  try {
    const provider = getProvider();
    if (provider === 'openai') return await callOpenAI(apiKey, system, question);
    if (provider === 'google') return await callGemini(apiKey, system, question);
    return await callAnthropic(apiKey, system, question);
  } catch (err) {
    console.warn('[MANTHAN] Live LLM call failed, falling back to offline templates:', err);
    return null;
  }
}
