/**
 * Classifies a data-source string into a visible provenance tier so the UI
 * can show judges/users exactly what's live, what's a real dated reference
 * dataset, and what's still simulated demo content — instead of silently
 * presenting everything the same way.
 */
export type ProvenanceTier = 'live' | 'reference' | 'illustrative';

export function provenanceOf(source: string | undefined | null): ProvenanceTier {
  if (!source) return 'illustrative';
  if (/open-meteo/i.test(source)) return 'live';
  if (/\(placeholder\)/i.test(source)) return 'illustrative';
  return 'reference';
}

/** Strips the internal "(placeholder)" marker so raw mock source strings
 *  never leak that literal text into the UI — the badge conveys the tier instead. */
export function cleanSource(source: string | undefined | null): string {
  if (!source) return '';
  return source.replace(/\s*\(placeholder\)\s*/i, '').trim();
}
