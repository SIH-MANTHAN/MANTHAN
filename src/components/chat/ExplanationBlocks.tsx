import type { ChatMessage, LocaleCode } from '../../types';
import { formatTime } from '../../utils/format';
import { t, agentLabel } from '../../i18n/ui';
import './Chat.css';

export function ExplanationBlocks({
  explanation,
  locale = 'en',
}: {
  explanation: NonNullable<ChatMessage['explanation']>;
  locale?: LocaleCode;
}) {
  return (
    <div className="explain">
      <div className="explain-block data">
        <p className="explain-label">{t(locale, 'dataLabel')}</p>
        <div className="explain-data">
          {explanation.data.map((d) => (
            <div key={d.label} className="explain-datum">
              <span>{d.label}</span>
              <span className="mono">
                {d.value}
                {d.unit ? ` ${d.unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="explain-block interpretation">
        <p className="explain-label">{t(locale, 'interpretationLabel')}</p>
        <p>{explanation.interpretation}</p>
      </div>

      {explanation.safety && (
        <div className="explain-block safety">
          <p className="explain-label">{t(locale, 'explainSafetyLabel')}</p>
          <p>{explanation.safety}</p>
        </div>
      )}

      <div className="explain-block evidence">
        <p className="explain-label">{t(locale, 'evidenceLabel')}</p>
        <ul className="evidence-list">
          {explanation.evidence.map((e) => (
            <li key={e.id}>
              <span className="evidence-label">{e.label}</span>
              <span className="evidence-meta mono">
                {e.dataset} · {formatTime(e.timestamp, locale)} · {e.reliability}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {explanation.actionable && explanation.actionable.length > 0 && (
        <div className="explain-block actions">
          <p className="explain-label">{t(locale, 'suggestedActions')}</p>
          <ul>
            {explanation.actionable.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="agent-trail" aria-label="Agents involved">
        {explanation.agentsInvolved.map((a) => (
          <span key={a} className="agent-chip">
            {agentLabel(locale, a)}
          </span>
        ))}
      </div>
    </div>
  );
}
