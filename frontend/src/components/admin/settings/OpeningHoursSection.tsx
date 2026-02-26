"use client";

import { useState, useEffect } from "react";
import type { ClinicHours } from "@/types";
import { DAYS_OF_WEEK } from "@/lib/constants";

interface Props {
  initial: ClinicHours;
  onSave: (hours: ClinicHours) => Promise<void>;
}

type Day = (typeof DAYS_OF_WEEK)[number];

export default function OpeningHoursSection({ initial, onSave }: Props) {
  const [form, setForm] = useState<ClinicHours>(initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  function set(day: Day, value: string) {
    setForm((prev) => ({ ...prev, [day]: value }));
  }

  async function handleSave() {
    await onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="bg-white rounded-card border border-grey-300 px-6 py-6 shadow-card">
      <h3 className="text-[1rem] font-semibold text-grey-800 mb-4">Opening Hours</h3>
      <p className="text-[0.82rem] text-grey-600 mb-3.5">
        Use &quot;Closed&quot; for days the clinic is not open.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2.5 mb-1">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <label className="w-[90px] flex-shrink-0 text-[0.85rem] font-semibold text-grey-600 uppercase tracking-[0.04em]">
              {day}
            </label>
            <input
              type="text"
              value={form[day] ?? ""}
              onChange={(e) => set(day, e.target.value)}
              placeholder="9:00 AM – 5:00 PM"
              className="flex-1 border-[1.5px] border-grey-300 rounded-[7px] px-2.5 py-[7px] text-[0.88rem] outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center gap-2.5 mt-[18px]">
        {saved && (
          <span className="text-[0.85rem] text-[#065f46] bg-[#ecfdf5] px-3 py-1 rounded-[6px]">
            Saved!
          </span>
        )}
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 rounded-[7px] bg-blue-600 hover:bg-blue-700 text-white border-0 text-[0.88rem] font-medium cursor-pointer transition-colors"
        >
          Save
        </button>
      </div>
    </section>
  );
}
