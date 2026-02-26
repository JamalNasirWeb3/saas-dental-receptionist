"use client";

import { useState, useEffect } from "react";
import type { ServicesConfig, ServiceConfig } from "@/types";
import { SERVICE_KEYS } from "@/lib/constants";

interface Props {
  initial: ServicesConfig;
  onSave: (services: ServicesConfig) => Promise<void>;
}

const empty: ServiceConfig = { name: "", duration_min: 0, price: "" };
const inputCls =
  "w-full border-[1.5px] border-grey-300 rounded-[6px] px-2 py-1.5 text-[0.88rem] outline-none focus:border-blue-500 transition-colors";

export default function ServicesSection({ initial, onSave }: Props) {
  const [form, setForm] = useState<ServicesConfig>(() => {
    const out: ServicesConfig = {};
    SERVICE_KEYS.forEach((k) => (out[k] = { ...empty }));
    return out;
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const merged: ServicesConfig = {};
    SERVICE_KEYS.forEach((k) => (merged[k] = initial[k] ?? { ...empty }));
    setForm(merged);
  }, [initial]);

  function setField(key: string, field: keyof ServiceConfig, value: string | number) {
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  async function handleSave() {
    await onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const thCls =
    "text-left text-[0.75rem] font-semibold text-grey-600 uppercase tracking-[0.05em] px-2 py-[6px] border-b-2 border-grey-200";

  return (
    <section className="bg-white rounded-card border border-grey-300 px-6 py-6 shadow-card">
      <h3 className="text-[1rem] font-semibold text-grey-800 mb-4">Services &amp; Pricing</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse mb-1">
          <thead>
            <tr>
              <th className={thCls}>Service Key</th>
              <th className={thCls}>Display Name</th>
              <th className={thCls}>Duration (min)</th>
              <th className={thCls}>Price</th>
            </tr>
          </thead>
          <tbody>
            {SERVICE_KEYS.map((key) => (
              <tr key={key}>
                <td className="px-2 py-[5px] border-b border-grey-100 font-mono text-[0.82rem] text-grey-600 whitespace-nowrap align-middle">
                  {key}
                </td>
                <td className="px-2 py-[5px] border-b border-grey-100 align-middle">
                  <input
                    type="text"
                    value={form[key]?.name ?? ""}
                    onChange={(e) => setField(key, "name", e.target.value)}
                    className={inputCls}
                  />
                </td>
                <td className="px-2 py-[5px] border-b border-grey-100 align-middle">
                  <input
                    type="number"
                    min={1}
                    value={form[key]?.duration_min ?? ""}
                    onChange={(e) =>
                      setField(key, "duration_min", parseInt(e.target.value) || 0)
                    }
                    className={`${inputCls} w-[80px]`}
                  />
                </td>
                <td className="px-2 py-[5px] border-b border-grey-100 align-middle">
                  <input
                    type="text"
                    value={form[key]?.price ?? ""}
                    onChange={(e) => setField(key, "price", e.target.value)}
                    className={inputCls}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
