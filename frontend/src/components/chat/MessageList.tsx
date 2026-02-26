"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface Props {
  messages: ChatMessage[];
  isBotTyping: boolean;
}

export default function MessageList({ messages, isBotTyping }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3 thin-scroll scroll-smooth">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isBotTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </main>
  );
}
