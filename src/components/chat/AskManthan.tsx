import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { useManthan } from '../../context/ManthanContext';
import { getSuggestedQuestions } from '../../services/dataService';
import { formatTime } from '../../utils/format';
import { Button } from '../ui/Button';
import { ExplanationBlocks } from './ExplanationBlocks';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import { LOCALE_META, t } from '../../i18n/ui';
import type { LocaleCode } from '../../types';
import './Chat.css';

export function AskManthan() {
  const { messages, sendMessage, chatStatus, focusMap, setActivePanel, profile, setLocale } =
    useManthan();
  const locale = profile?.locale ?? 'en';
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const voiceOriginRef = useRef(false);
  const suggestions = getSuggestedQuestions(locale);
  const voice = useVoiceChat(locale);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatStatus]);

  useEffect(() => {
    if (voice.listening && voice.interim) setInput(voice.interim);
  }, [voice.listening, voice.interim]);

  useEffect(() => {
    if (!voiceOriginRef.current || chatStatus !== 'idle') return;
    const last = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!last || last.status === 'planning' || last.status === 'error') return;
    voiceOriginRef.current = false;
    if (voice.supported.tts) void voice.speak(last.content);
  }, [messages, chatStatus, voice]);

  const submit = useCallback(
    async (text?: string) => {
      const q = (text ?? input).trim();
      if (!q || chatStatus === 'planning') return;
      setInput('');
      voice.stopListening(true);
      await sendMessage(q);
    },
    [input, chatStatus, sendMessage, voice],
  );

  const toggleMic = () => {
    if (!voice.supported.stt) {
      voice.startListening(() => undefined);
      return;
    }
    if (voice.listening) {
      voice.stopListening();
      return;
    }
    voice.startListening((transcript) => {
      voiceOriginRef.current = true;
      setInput('');
      void submit(transcript);
    });
  };

  const voiceErrorLabel =
    voice.error === 'voiceUnsupported'
      ? t(locale, 'voiceUnsupported')
      : voice.error === 'micDenied'
        ? t(locale, 'micDenied')
        : voice.error;

  return (
    <div className="chat-root">
      <div className="chat-intro">
        <div className="chat-intro-row">
          <div>
            <p className="section-kicker">{t(locale, 'askManthanKicker')}</p>
            <h3 className="chat-title">{t(locale, 'askTitle')}</h3>
          </div>
          <label className="chat-lang">
            <span className="sr-only">{t(locale, 'language')}</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as LocaleCode)}
              aria-label={t(locale, 'language')}
            >
              {(Object.keys(LOCALE_META) as LocaleCode[]).map((code) => (
                <option key={code} value={code}>
                  {LOCALE_META[code].native}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="chat-lede">{t(locale, 'askLede')}</p>
      </div>

      <div className="chat-suggestions scrollable">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="suggest-chip"
            onClick={() => void submit(s)}
            disabled={chatStatus === 'planning'}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="chat-thread scrollable">
        {messages.map((m) => (
          <article key={m.id} className={`chat-msg role-${m.role} ${m.status ?? ''}`}>
            {m.role === 'assistant' && m.status === 'planning' ? (
              <div className="planning">
                <span className="spinner" />
                <div>
                  <p className="planning-title">{t(locale, 'coordinating')}</p>
                  <p className="planning-detail">{t(locale, 'plannerChain')}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="chat-bubble-row">
                  <div
                    className="chat-bubble"
                    dangerouslySetInnerHTML={{
                      __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                  {m.role === 'assistant' && m.status !== 'error' && voice.supported.tts && (
                    <button
                      type="button"
                      className="audio-btn"
                      title={voice.speaking ? t(locale, 'stopAudio') : t(locale, 'playAudio')}
                      aria-label={voice.speaking ? t(locale, 'stopAudio') : t(locale, 'playAudio')}
                      onClick={() => {
                        if (voice.speaking) voice.stopSpeaking();
                        else voice.speak(m.content);
                      }}
                    >
                      {voice.speaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                  )}
                </div>
                <time className="chat-time mono">{formatTime(m.timestamp, locale)}</time>
                {m.explanation && (
                  <>
                    <ExplanationBlocks explanation={m.explanation} locale={locale} />
                    {m.explanation.mapFocus && (
                      <Button
                        size="sm"
                        variant="soft"
                        className="view-map-btn"
                        onClick={() => {
                          const mf = m.explanation!.mapFocus!;
                          focusMap({
                            center: mf.center,
                            zoom: mf.zoom,
                            highlightIds: mf.highlightIds,
                          });
                          setActivePanel('overview');
                        }}
                      >
                        <MapPin size={14} /> {t(locale, 'viewOnMap')}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </article>
        ))}
        <div ref={bottomRef} />
      </div>

      {voiceErrorLabel && <p className="voice-error">{voiceErrorLabel}</p>}
      {voice.listening && <p className="voice-listening">{t(locale, 'listening')}</p>}

      <form
        className="chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <button
          type="button"
          className={`mic-btn ${voice.listening ? 'on' : ''}`}
          onClick={toggleMic}
          disabled={chatStatus === 'planning'}
          aria-label={voice.listening ? t(locale, 'stop') : t(locale, 'speak')}
          title={
            voice.supported.stt
              ? voice.listening
                ? t(locale, 'stop')
                : t(locale, 'speak')
              : t(locale, 'voiceUnsupported')
          }
        >
          {voice.listening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(locale, 'askPlaceholder')}
          aria-label="Ask MANTHAN"
          disabled={chatStatus === 'planning'}
        />
        <Button type="submit" disabled={!input.trim() || chatStatus === 'planning'} aria-label="Send">
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
