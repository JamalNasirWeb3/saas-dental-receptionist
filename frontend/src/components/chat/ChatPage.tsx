"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSSEChat } from "@/hooks/useSSEChat";
import { useVoice } from "@/hooks/useVoice";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ToolBar from "./ToolBar";
import VoiceBar from "./VoiceBar";
import ChatFooter from "./ChatFooter";

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [lang, setLang] = useState("en");

  const { messages, sendMessage, isStreaming, isBotTyping, toolName } = useSSEChat();

  // Use refs to expose current values inside stable callbacks
  const sessionIdRef = useRef<string | null>(null);
  const isMutedRef = useRef(isMuted);
  const langRef = useRef(lang);
  sessionIdRef.current = sessionId;
  isMutedRef.current = isMuted;
  langRef.current = lang;

  /** Sends a message via SSE, then optionally speaks the reply */
  const doSend = useCallback(
    async (text: string) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      if (typeof window !== "undefined") speechSynthesis.cancel();

      await sendMessage(text, sid, (fullText) => {
        if (typeof window !== "undefined" && !isMutedRef.current && fullText.trim()) {
          speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(fullText);
          utter.lang = langRef.current === "en" ? "en-US" : langRef.current;
          utter.rate = 0.95;
          speechSynthesis.speak(utter);
        }
      });
    },
    [sendMessage],
  );

  const voice = useVoice(lang, doSend);

  // Initialize session once on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("sessionId");
    if (stored) {
      setSessionId(stored);
    } else {
      fetch("/session")
        .then((r) => r.json())
        .then((data: { session_id: string }) => {
          setSessionId(data.session_id);
          sessionStorage.setItem("sessionId", data.session_id);
        })
        .catch(console.error);
    }
  }, []);

  function handleMuteToggle() {
    setIsMuted((m) => {
      if (!m && typeof window !== "undefined") speechSynthesis.cancel();
      return !m;
    });
  }

  function handleMicClick() {
    if (voice.isListening) voice.stopListening();
    else voice.startListening();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex justify-center">
      <div className="w-full max-w-[760px] h-screen flex flex-col bg-white shadow-chat">
        <ChatHeader
          isMuted={isMuted}
          onMuteToggle={handleMuteToggle}
          lang={lang}
          onLangChange={setLang}
        />
        <MessageList messages={messages} isBotTyping={isBotTyping} />
        <ToolBar toolName={toolName} />
        <VoiceBar status={voice.voiceStatus} />
        <ChatFooter
          onSend={doSend}
          onMicClick={handleMicClick}
          isStreaming={isStreaming}
          isListening={voice.isListening}
        />
      </div>
    </div>
  );
}
