import type { Appointment } from "@/types";
import StatCard from "./StatCard";

export default function StatsRow({ appointments }: { appointments: Appointment[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = appointments.filter((a) => a.date === today).length;
  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6 max-sm:grid-cols-2">
      <StatCard value={todayCount} label="Today" accentColor="blue" />
      <StatCard value={confirmed} label="Confirmed" accentColor="green" />
      <StatCard value={cancelled} label="Cancelled" accentColor="red" />
      <StatCard value={appointments.length} label="All Time" accentColor="grey" />
    </div>
  );
}
