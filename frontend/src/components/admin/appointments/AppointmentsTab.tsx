"use client";

import { useState } from "react";
import type { Appointment, AppointmentFilters } from "@/types";
import { cancelAppointment } from "@/lib/api";
import StatsRow from "./StatsRow";
import FilterBar from "./FilterBar";
import AppTable from "./AppTable";
import CancelModal from "./CancelModal";

interface Props {
  appointments: Appointment[];
  isLoading: boolean;
  lastRefresh: Date | null;
  onRefresh: () => void;
  getAuthHeader: () => Record<string, string>;
}

export default function AppointmentsTab({
  appointments,
  isLoading,
  lastRefresh,
  onRefresh,
  getAuthHeader,
}: Props) {
  const [filters, setFilters] = useState<AppointmentFilters>({
    date: "",
    status: "",
    search: "",
  });
  const [pendingCancel, setPendingCancel] = useState<Appointment | null>(null);

  async function handleConfirmCancel(reason: string) {
    if (!pendingCancel) return;
    try {
      await cancelAppointment(pendingCancel.id, reason, getAuthHeader());
      setPendingCancel(null);
      onRefresh();
    } catch {
      alert("Failed to cancel appointment. Please try again.");
      setPendingCancel(null);
    }
  }

  return (
    <div>
      <StatsRow appointments={appointments} />
      <FilterBar filters={filters} onChange={setFilters} />
      {isLoading ? (
        <div className="text-center py-10 text-grey-600 italic">Loading…</div>
      ) : (
        <AppTable
          appointments={appointments}
          filters={filters}
          onCancelClick={setPendingCancel}
        />
      )}
      <footer className="mt-5 text-[0.78rem] text-grey-400 text-center">
        Auto-refreshes every 60 s
        {lastRefresh && (
          <> · Last updated: {lastRefresh.toLocaleTimeString()}</>
        )}
      </footer>

      {pendingCancel && (
        <CancelModal
          appointment={pendingCancel}
          onConfirm={handleConfirmCancel}
          onAbort={() => setPendingCancel(null)}
        />
      )}
    </div>
  );
}
