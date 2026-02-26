"use client";

import { useState, useRef, useCallback } from "react";

export function useVoice(lang: string, onTranscribed: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // Keep latest lang + callback in refs so MediaRecorder handlers see current values
  const langRef = useRef(lang);
  const onTranscribedRef = useRef(onTranscribed);
  langRef.current = lang;
  onTranscribedRef.current = onTranscribed;

  const stopListening = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      });

      recorder.addEventListener("stop", async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setVoiceStatus("Processing…");
        try {
          const form = new FormData();
          form.append("audio", blob, "recording.webm");
          form.append("language", langRef.current);
          const res = await fetch("/transcribe", { method: "POST", body: form });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const { text } = (await res.json()) as { text: string };
          setVoiceStatus("");
          if (text?.trim()) onTranscribedRef.current(text);
        } catch (err) {
          console.error("Transcription error:", err);
          setVoiceStatus("");
        }
      });

      recorder.start();
      setIsListening(true);
      setVoiceStatus("Listening…");
    } catch (err) {
      console.error("Mic error:", err);
      setVoiceStatus("");
      alert("Microphone access denied or unavailable.");
    }
  }, []);

  const speakText = useCallback((text: string, isMuted: boolean) => {
    if (typeof window === "undefined") return;
    if (isMuted || !text.trim()) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langRef.current === "en" ? "en-US" : langRef.current;
    utter.rate = 0.95;
    speechSynthesis.speak(utter);
  }, []);

  return { isListening, voiceStatus, startListening, stopListening, speakText };
}
