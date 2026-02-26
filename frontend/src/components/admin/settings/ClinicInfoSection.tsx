"use client";

import { useState, useEffect } from "react";
import type { ClinicInfo } from "@/types";

interface Props {
  initial: ClinicInfo;
  onSave: (info: ClinicInfo) => Promise<void>;
}

const inputCls =
  "w-full border-[1.5px] border-grey-300 rounded-[7px] px-3 py-[7px] text-[0.88rem] outline-none focus:border-blue-500 transition-colors";
const labelCls =
  "block text-[0.8rem] font-semibold text-grey-600 mb-[5px] uppercase tracking-[0.04em]";

export default function ClinicInfoSection({ initial, onSave }: Props) {
  const [form, setForm] = useState<ClinicInfo>(initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  function set(key: keyof ClinicInfo, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    await onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="bg-white rounded-card border border-grey-300 px-6 py-6 shadow-card">
      <h3 className="text-[1rem] font-semibold text-grey-800 mb-4">Clinic Information</h3>
      <div className="mb-4">
        <label className={labelCls}>Clinic Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Bright Smile Dental"
          className={inputCls}
        />
      </div>
      <div className="mb-4">
        <label className={labelCls}>Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Street address"
          className={inputCls}
        />
      </div>
      <div className="mb-4">
        <label className={labelCls}>Phone</label>
        <input
          type="text"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="e.g. 0301-9568220"
          className={inputCls}
        />
      </div>
      <div className="mb-4">
        <label className={labelCls}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="e.g. clinic@example.com"
          className={inputCls}
        />
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
