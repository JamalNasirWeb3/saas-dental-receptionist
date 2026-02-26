import type { ChatMessage } from "@/types";

function timeStr(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isBot = message.role === "bot";

  if (isBot) {
    return (
      <div className="flex items-end gap-2">
        <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[1.1rem] flex-shrink-0 bg-blue-100">
          🦷
        </div>
        <div
          className={`max-w-[72%] px-[14px] py-[10px] rounded-bubble rounded-bl-[6px] leading-[1.55] text-[0.93rem] whitespace-pre-wrap break-words ${
            message.isError
              ? "bg-red-50 text-red-700"
              : "bg-grey-100 text-grey-800"
          }`}
        >
          {message.text}
        </div>
        <span className="text-[0.7rem] text-grey-400 px-1 pb-0.5 flex-shrink-0">
          {timeStr(message.timestamp)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 flex-row-reverse">
      <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[1.1rem] flex-shrink-0 bg-grey-200">
        🙂
      </div>
      <div className="max-w-[72%] px-[14px] py-[10px] rounded-bubble rounded-br-[6px] leading-[1.55] text-[0.93rem] whitespace-pre-wrap break-words bg-blue-600 text-white">
        {message.text}
      </div>
      <span className="text-[0.7rem] text-grey-400 px-1 pb-0.5 flex-shrink-0">
        {timeStr(message.timestamp)}
      </span>
    </div>
  );
}
