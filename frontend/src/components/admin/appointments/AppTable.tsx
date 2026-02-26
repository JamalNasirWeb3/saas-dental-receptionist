import type { Appointment, AppointmentFilters } from "@/types";
import { formatDate, formatTime, formatService } from "@/lib/formatters";

interface Props {
  appointments: Appointment[];
  filters: AppointmentFilters;
  onCancelClick: (apt: Appointment) => void;
}

export default function AppTable({ appointments, filters, onCancelClick }: Props) {
  const { date, status, search } = filters;
  const rows = appointments.filter((a) => {
    if (date && a.date !== date) return false;
    if (status && a.status !== status) return false;
    if (search && !a.patient_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const thCls =
    "px-4 py-[13px] text-left text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-grey-600 border-b-2 border-grey-200 whitespace-nowrap bg-grey-50";
  const tdCls = "px-4 py-3 border-b border-grey-200 text-[0.88rem] align-middle";

  return (
    <div className="bg-white rounded-card shadow-card overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["ID", "Patient", "Phone", "Service", "Date", "Time", "Status", "Actions"].map(
              (h) => (
                <th key={h} className={thCls}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="text-center text-grey-600 py-10 italic text-[0.88rem]"
              >
                No appointments found.
              </td>
            </tr>
          ) : (
            rows.map((a) => (
              <tr key={a.id} className="hover:bg-grey-50">
                <td className={tdCls}>{a.id}</td>
                <td className={tdCls}>
                  <strong>{a.patient_name}</strong>
                </td>
                <td className={tdCls}>{a.phone}</td>
                <td className={tdCls}>{formatService(a.service)}</td>
                <td className={tdCls}>{formatDate(a.date)}</td>
                <td className={tdCls}>{formatTime(a.time)}</td>
                <td className={tdCls}>
                  <span
                    className={`inline-block px-2.5 py-[3px] rounded-full text-[0.76rem] font-semibold capitalize ${
                      a.status === "confirmed"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className={tdCls}>
                  {a.status === "confirmed" ? (
                    <button
                      onClick={() => onCancelClick(a)}
                      className="px-3 py-[5px] text-[0.8rem] bg-transparent text-red-600 border border-red-400 rounded-[6px] cursor-pointer hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
