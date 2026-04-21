import { useCallback, useEffect, useRef, useState } from "react";

const getRecognitionCtor = () =>
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export const SPEECH_LANG_OPTIONS = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
];

/**
 * Web Speech API hook — appends speech to text controlled by parent.
 * @param {object} options
 * @param {() => string} options.getBaseText - Current input value when a session starts (snapshot).
 * @param {(text: string) => void} options.onTextUpdate - Full text to set (base snapshot + speech).
 * @param {string} [options.lang="en-US"]
 * @param {number} [options.silenceMs=0] - Auto-stop after this many ms with no new result (0 = off).
 */
export function useSpeechRecognition({
  getBaseText,
  onTextUpdate,
  lang: initialLang = "en-US",
  silenceMs = 3000,
} = {}) {
  const [isSupported] = useState(() => Boolean(getRecognitionCtor()));
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState(initialLang);
  const [lastError, setLastError] = useState(null);

  const recognitionRef = useRef(null);
  const baseSnapshotRef = useRef("");
  const silenceTimerRef = useRef(null);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const scheduleSilenceStop = useCallback(() => {
    clearSilenceTimer();
    if (!silenceMs || silenceMs <= 0) return;
    silenceTimerRef.current = window.setTimeout(() => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    }, silenceMs);
  }, [clearSilenceTimer, silenceMs]);

  const stop = useCallback(() => {
    clearSilenceTimer();
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setIsListening(false);
  }, [clearSilenceTimer]);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || typeof getBaseText !== "function" || typeof onTextUpdate !== "function") return;

    baseSnapshotRef.current = getBaseText() ?? "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let finals = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finals += piece;
        } else {
          interim += piece;
        }
      }
      onTextUpdate(baseSnapshotRef.current + finals + interim);
      scheduleSilenceStop();
    };

    recognition.onerror = (event) => {
      const err = event.error;
      if (err === "not-allowed" || err === "service-not-allowed") {
        setLastError("Microphone permission denied.");
      } else if (err === "no-speech") {
        /* common while pausing */
      } else if (err !== "aborted") {
        setLastError(`Speech recognition error: ${err}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      clearSilenceTimer();
    };

    recognitionRef.current = recognition;

    try {
      setLastError(null);
      recognition.start();
      setIsListening(true);
      scheduleSilenceStop();
    } catch (e) {
      setLastError(e?.message || "Could not start microphone.");
      setIsListening(false);
    }
  }, [
    clearSilenceTimer,
    getBaseText,
    lang,
    onTextUpdate,
    scheduleSilenceStop,
  ]);

  const toggle = useCallback(() => {
    if (!isSupported) return;
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, isSupported, start, stop]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, [clearSilenceTimer]);

  return {
    isSupported,
    isListening,
    lang,
    setLang,
    lastError,
    setLastError,
    start,
    stop,
    toggle,
  };
}
