import type { AppointmentFilters } from "@/types";

interface Props {
  filters: AppointmentFilters;
  onChange: (filters: AppointmentFilters) => void;
}

const inputCls =
  "border-[1.5px] border-grey-300 rounded-[7px] px-3 py-[7px] text-[0.88rem] outline-none focus:border-blue-500 transition-colors bg-white";

export default function FilterBar({ filters, onChange }: Props) {
  function set(key: keyof AppointmentFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange({ date: "", status: "", search: "" });
  }

  return (
    <div className="flex gap-2.5 flex-wrap items-center bg-white px-[18px] py-3.5 rounded-card shadow-card mb-4">
      <input
        type="date"
        value={filters.date}
        onChange={(e) => set("date", e.target.value)}
        title="Filter by date"
        className={inputCls}
      />
      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value)}
        className={inputCls}
      >
        <option value="">All Statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input
        type="text"
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        placeholder="Search patient name…"
        className={`${inputCls} flex-1 min-w-[160px]`}
      />
      <button
        onClick={clearAll}
        className="inline-flex items-center px-3 py-[6px] rounded-[7px] border border-grey-300 bg-transparent text-grey-800 text-[0.82rem] font-medium cursor-pointer hover:bg-grey-100 transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
}
