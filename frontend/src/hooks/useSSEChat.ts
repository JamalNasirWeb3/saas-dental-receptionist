"use client";

import { useState, useRef, useCallback } from "react";
import type { ChatMessage, SSEEvent } from "@/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "bot",
  text:
    "Hello! I'm Sarah, the virtual receptionist for Bright Smile Dental. 😊\n\n" +
    "I can help you with:\n" +
    "• Checking appointment availability\n" +
    "• Booking or cancelling appointments\n" +
    "• Clinic hours, services & policies\n\n" +
    "How can I assist you today?",
  isError: false,
  timestamp: new Date(),
};

export function useSSEChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [toolName, setToolName] = useState("");

  // Refs avoid stale closures during streaming
  const isStreamingRef = useRef(false);
  const accTextRef = useRef("");
  const botMsgIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (text: string, sessionId: string, onComplete?: (full: string) => void) => {
      if (isStreamingRef.current) return;
      isStreamingRef.current = true;
      setIsStreaming(true);
      setIsBotTyping(true);
      accTextRef.current = "";
      botMsgIdRef.current = null;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text,
        isError: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, message: text }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            let payload: SSEEvent;
            try {
              payload = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            if (payload.type === "text") {
              accTextRef.current += payload.chunk;
              const acc = accTextRef.current;
              setIsBotTyping(false);
              setToolName("");

              if (!botMsgIdRef.current) {
                const id = `b-${Date.now()}`;
                botMsgIdRef.current = id;
                setMessages((prev) => [
                  ...prev,
                  { id, role: "bot", text: acc, isError: false, timestamp: new Date() },
                ]);
              } else {
                const id = botMsgIdRef.current;
                setMessages((prev) =>
                  prev.map((m) => (m.id === id ? { ...m, text: acc } : m)),
                );
              }
            } else if (payload.type === "tool") {
              setToolName(payload.name);
            } else if (payload.type === "error") {
              setIsBotTyping(false);
              setToolName("");
              setMessages((prev) => [
                ...prev,
                {
                  id: `e-${Date.now()}`,
                  role: "bot",
                  text: "⚠️ " + payload.message,
                  isError: true,
                  timestamp: new Date(),
                },
              ]);
            } else if (payload.type === "done") {
              setIsBotTyping(false);
              setToolName("");
              onComplete?.(accTextRef.current);
            }
          }
        }
      } catch (err) {
        setIsBotTyping(false);
        setToolName("");
        const msg = err instanceof Error ? err.message : "Unknown error";
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "bot",
            text: "⚠️ Connection error: " + msg,
            isError: true,
            timestamp: new Date(),
          },
        ]);
      }

      isStreamingRef.current = false;
      setIsStreaming(false);
    },
    [],
  );

  return { messages, sendMessage, isStreaming, isBotTyping, toolName };
}
