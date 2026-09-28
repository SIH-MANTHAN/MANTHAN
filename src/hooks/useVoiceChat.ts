import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocaleCode } from '../types';
import { LOCALE_META, stripMarkdown } from '../i18n/ui';

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult:
    | ((event: {
        resultIndex: number;
        results: {
          length: number;
          [index: number]: { 0: { transcript: string }; isFinal: boolean };
        };
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speechLangCandidates(locale: LocaleCode): string[] {
  const primary = LOCALE_META[locale].speech;
  const extras: string[] = [];
  switch (locale) {
    case 'en':
      extras.push('en-IN', 'en-US', 'en-GB');
      break;
    case 'hi':
      extras.push('hi-IN', 'en-IN');
      break;
    case 'mr':
      extras.push('mr-IN', 'hi-IN', 'en-IN');
      break;
    case 'ta':
      extras.push('ta-IN', 'en-IN');
      break;
    case 'te':
      extras.push('te-IN', 'en-IN');
      break;
    case 'kn':
      extras.push('kn-IN', 'en-IN');
      break;
    case 'ml':
      extras.push('ml-IN', 'en-IN');
      break;
    case 'bn':
      extras.push('bn-IN', 'bn-BD', 'en-IN');
      break;
    case 'gu':
      extras.push('gu-IN', 'hi-IN', 'en-IN');
      break;
    default:
      extras.push('en-IN');
  }
  return [...new Set([primary, ...extras, 'en-IN', 'en-US'])];
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) {
      resolve(existing);
      return;
    }
    const done = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', done);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', done);
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', done);
      resolve(window.speechSynthesis.getVoices());
    }, 900);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], locale: LocaleCode): SpeechSynthesisVoice | null {
  const candidates = speechLangCandidates(locale).map((l) => l.toLowerCase());
  for (const lang of candidates) {
    const exact = voices.find((v) => v.lang.toLowerCase() === lang);
    if (exact) return exact;
  }
  for (const lang of candidates) {
    const prefix = lang.split('-')[0];
    const soft = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (soft) return soft;
  }
  return voices.find((v) => v.lang.toLowerCase().startsWith('en')) ?? voices[0] ?? null;
}

export function useVoiceChat(locale: LocaleCode) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState('');
  const [supported, setSupported] = useState({ stt: false, tts: false });
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef('');
  const liveRef = useRef('');
  const onFinalRef = useRef<((transcript: string) => void) | null>(null);
  const langIndexRef = useRef(0);
  const retryingLangRef = useRef(false);
  const wantListenRef = useRef(false);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    setSupported({
      stt: Boolean(getRecognitionCtor()),
      tts: typeof window !== 'undefined' && 'speechSynthesis' in window,
    });
    void waitForVoices();
  }, []);

  const commitIfAny = useCallback(() => {
    const payload = (finalRef.current || liveRef.current).trim();
    const cb = onFinalRef.current;
    onFinalRef.current = null;
    finalRef.current = '';
    liveRef.current = '';
    setInterim('');
    if (payload && cb) cb(payload);
  }, []);

  const stopListening = useCallback(
    (discard = false) => {
      wantListenRef.current = false;
      if (discard) onFinalRef.current = null;
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
      if (discard) setInterim('');
    },
    [],
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const startRecognitionWithLang = useCallback((lang: string) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = finalRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? '';
        if (event.results[i].isFinal) finalText += `${finalText ? ' ' : ''}${piece}`;
        else interimText += piece;
      }
      finalRef.current = finalText.trim();
      const combined = `${finalText} ${interimText}`.trim();
      liveRef.current = combined;
      setInterim(combined);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;

      if (event.error === 'language-not-supported') {
        const langs = speechLangCandidates(localeRef.current);
        langIndexRef.current += 1;
        if (langIndexRef.current < langs.length) {
          retryingLangRef.current = true;
          startRecognitionWithLang(langs[langIndexRef.current]);
          return;
        }
        setError('Language not supported by this browser. Type your question instead — Chrome works best for Hindi and English.');
        wantListenRef.current = false;
        setListening(false);
        return;
      }

      if (event.error === 'no-speech') {
        return;
      }

      wantListenRef.current = false;
      setListening(false);
      if (event.error === 'not-allowed') setError('micDenied');
      else if (event.error === 'network') setError('Speech needs an internet connection.');
      else setError(event.error);
    };

    recognition.onend = () => {
      if (retryingLangRef.current) {
        retryingLangRef.current = false;
        return;
      }
      if (wantListenRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          /* fall through and commit */
        }
      }
      setListening(false);
      commitIfAny();
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setError(null);
    } catch {
      setError('Could not start microphone. Use Chrome/Edge on http://localhost:5173');
      setListening(false);
      wantListenRef.current = false;
    }
  }, [commitIfAny]);

  const startListening = useCallback(
    (onFinal: (transcript: string) => void) => {
      setError(null);
      setInterim('');
      finalRef.current = '';
      liveRef.current = '';
      onFinalRef.current = onFinal;
      langIndexRef.current = 0;
      retryingLangRef.current = false;
      wantListenRef.current = true;

      if (!window.isSecureContext) {
        setError('Voice requires https or localhost.');
        wantListenRef.current = false;
        return;
      }
      if (!getRecognitionCtor()) {
        setError('voiceUnsupported');
        wantListenRef.current = false;
        return;
      }

      stopSpeaking();
      startRecognitionWithLang(speechLangCandidates(locale)[0]);
    },
    [locale, startRecognitionWithLang, stopSpeaking],
  );

  const speak = useCallback(async (text: string) => {
    setError(null);
    if (!('speechSynthesis' in window)) {
      setError('voiceUnsupported');
      return;
    }

    const clean = stripMarkdown(text).trim();
    if (!clean) return;

    window.speechSynthesis.cancel();
    setSpeaking(false);

    const voices = await waitForVoices();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = speechLangCandidates(locale)[0];
    const voice = pickVoice(voices, locale);
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    }
    utter.rate = 0.95;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => {
      setSpeaking(false);
    };

    window.setTimeout(() => {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utter);
      } catch {
        setSpeaking(false);
      }
    }, 80);
  }, [locale]);

  useEffect(
    () => () => {
      wantListenRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },
    [],
  );

  return {
    listening,
    speaking,
    interim,
    supported,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearError: () => setError(null),
  };
}
