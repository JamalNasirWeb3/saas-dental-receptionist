export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-lg flex-shrink-0 bg-blue-100">
        🦷
      </div>
      <div className="bg-grey-100 rounded-bubble rounded-bl-[6px] px-[14px] py-[12px] flex items-center gap-1">
        <span className="w-[7px] h-[7px] bg-grey-400 rounded-full animate-bounce-dot" />
        <span
          className="w-[7px] h-[7px] bg-grey-400 rounded-full animate-bounce-dot"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="w-[7px] h-[7px] bg-grey-400 rounded-full animate-bounce-dot"
          style={{ animationDelay: "0.30s" }}
        />
      </div>
    </div>
  );
}
