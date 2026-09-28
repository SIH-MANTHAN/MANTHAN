import type { LocaleCode, Severity, SafetyStatus } from '../../types';
import { severityLabel, safetyStatusLabel, provenanceLabel, provenanceHint } from '../../i18n/ui';
import { provenanceOf, cleanSource } from '../../utils/provenance';
import './ui.css';

export function SeverityPill({ severity, locale = 'en' }: { severity: Severity; locale?: LocaleCode }) {
  return <span className={`pill severity-${severity}`}>{severityLabel(locale, severity)}</span>;
}

export function SafetyPill({ status, locale = 'en' }: { status: SafetyStatus; locale?: LocaleCode }) {
  return <span className={`pill safety-${status}`}>{safetyStatusLabel(locale, status)}</span>;
}

/** Shows judges/users at a glance whether a figure is live, a real dated
 *  reference dataset, or still-simulated demo content — and, on hover, the
 *  cleaned-up (no "(placeholder)" literal) source name. */
export function ProvenanceBadge({ source, locale = 'en' }: { source?: string | null; locale?: LocaleCode }) {
  const tier = provenanceOf(source);
  const cleaned = cleanSource(source);
  return (
    <span
      className={`provenance-badge tier-${tier}`}
      title={cleaned ? `${provenanceHint(locale, tier)} — ${cleaned}` : provenanceHint(locale, tier)}
    >
      {provenanceLabel(locale, tier)}
    </span>
  );
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="state-box empty">
      <p className="state-title">{title}</p>
      {detail && <p className="state-detail">{detail}</p>}
    </div>
  );
}

export function ErrorState({
  title,
  detail,
  onRetry,
  retryLabel = 'Try again',
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="state-box error">
      <p className="state-title">{title}</p>
      {detail && <p className="state-detail">{detail}</p>}
      {onRetry && (
        <button type="button" className="link-btn" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state-box loading">
      <span className="spinner" aria-hidden />
      <p className="state-detail">{label}</p>
    </div>
  );
}

export function Skeleton({ height = 64 }: { height?: number }) {
  return <div className="skeleton" style={{ height }} aria-hidden />;
}
