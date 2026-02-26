"use client";

import { useState } from "react";
import type { Appointment } from "@/types";
import { formatDate, formatTime } from "@/lib/formatters";

interface Props {
  appointment: Appointment;
  onConfirm: (reason: string) => void;
  onAbort: () => void;
}

export default function CancelModal({ appointment, onConfirm, onAbort }: Props) {
  const [reason, setReason] = useState("");

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onAbort();
  }

  return (
    <div
      className="fixed inset-0 bg-black/35 flex items-center justify-center z-[500]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-card px-7 py-8 w-full max-w-[420px] shadow-modal">
        <h3 className="text-[1.1rem] font-semibold mb-2.5">Cancel Appointment</h3>
        <p className="text-grey-600 text-[0.9rem] leading-relaxed mb-4">
          Cancel appointment for <strong>{appointment.patient_name}</strong> on{" "}
          {formatDate(appointment.date)} at {formatTime(appointment.time)}?
        </p>
        <div className="mb-1">
          <label className="block text-[0.8rem] font-semibold text-grey-600 mb-[5px] uppercase tracking-[0.04em]">
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Patient request"
            className="w-full border-[1.5px] border-grey-300 rounded-lg px-3 py-2.5 text-[0.92rem] outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="flex gap-2.5 mt-5 justify-end">
          <button
            onClick={() => onConfirm(reason.trim() || "Cancelled by staff")}
            className="inline-flex items-center px-4 py-2 rounded-[7px] bg-red-600 hover:bg-red-700 text-white border-0 text-[0.88rem] font-medium cursor-pointer transition-colors"
          >
            Yes, cancel it
          </button>
          <button
            onClick={onAbort}
            className="inline-flex items-center px-4 py-2 rounded-[7px] border border-grey-300 bg-transparent text-grey-800 text-[0.88rem] font-medium cursor-pointer hover:bg-grey-100 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
