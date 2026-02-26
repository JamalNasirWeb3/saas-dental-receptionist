export default function VoiceBar({ status }: { status: string }) {
  if (!status) return null;
  return (
    <div className="flex items-center gap-2 px-[14px] py-1.5 bg-blue-50 border-t border-blue-100 text-[0.82rem] text-blue-700 flex-shrink-0">
      <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 animate-pulse-dot" />
      <span>{status}</span>
    </div>
  );
}
