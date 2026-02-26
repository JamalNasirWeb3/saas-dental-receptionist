import { TOOL_LABELS } from "@/lib/constants";

export default function ToolBar({ toolName }: { toolName: string }) {
  if (!toolName) return null;
  return (
    <div className="flex items-center gap-2.5 px-5 py-2 bg-blue-50 border-t border-blue-100 text-[0.82rem] text-blue-700 flex-shrink-0">
      <span className="w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin-fast flex-shrink-0" />
      <span>{TOOL_LABELS[toolName] || "Processing…"}</span>
    </div>
  );
}
