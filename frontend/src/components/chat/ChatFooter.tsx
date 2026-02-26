"use client";

import { useRef, type KeyboardEvent } from "react";

interface Props {
  onSend: (text: string) => void;
  onMicClick: () => void;
  isStreaming: boolean;
  isListening: boolean;
}

function MicSVG() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
    >
      <rect x={9} y={2} width={6} height={11} rx={3} />
      <path d="M19 10a7 7 0 0 1-14 0" />
      <line x1={12} y1={19} x2={12} y2={22} />
      <line x1={8} y1={22} x2={16} y2={22} />
    </svg>
  );
}

function SendSVG() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
    >
      <line x1={22} y1={2} x2={11} y2={13} />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function ChatFooter({ onSend, onMicClick, isStreaming, isListening }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const text = textareaRef.current?.value.trim();
    if (!text || isStreaming) return;
    onSend(text);
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 160) + "px";
  }

  const btnBase =
    "w-[42px] h-[42px] border-0 rounded-full cursor-pointer flex items-center justify-center flex-shrink-0 transition-all [&_svg]:stroke-white";

  return (
    <footer className="flex items-end gap-2 px-[14px] py-3 border-t border-grey-200 bg-white flex-shrink-0">
      <textarea
        ref={textareaRef}
        placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
        rows={1}
        autoComplete="off"
        spellCheck={true}
        disabled={isStreaming}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="flex-1 resize-none border-[1.5px] border-grey-200 rounded-[22px] px-4 py-2.5 text-[0.92rem] leading-[1.4] max-h-[160px] outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
      />
      <button
        onClick={onMicClick}
        disabled={isStreaming}
        aria-label="Voice input"
        title="Voice input"
        className={`${btnBase} ${
          isStreaming
            ? "bg-grey-400 cursor-not-allowed"
            : isListening
            ? "bg-red-600 animate-mic-pulse hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700 active:scale-95"
        }`}
      >
        <MicSVG />
      </button>
      <button
        onClick={handleSend}
        disabled={isStreaming}
        title="Send message"
        aria-label="Send"
        className={`${btnBase} ${
          isStreaming
            ? "bg-grey-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-95"
        }`}
      >
        <SendSVG />
      </button>
    </footer>
  );
}
