"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";

interface Props {
  getStoredUser: () => string;
  onPasswordChanged: (newPass: string) => void;
}

const inputCls =
  "w-full border-[1.5px] border-grey-300 rounded-[7px] px-3 py-[7px] text-[0.88rem] outline-none focus:border-blue-500 transition-colors";
const labelCls =
  "block text-[0.8rem] font-semibold text-grey-600 mb-[5px] uppercase tracking-[0.04em]";

export default function ChangePasswordSection({ getStoredUser, onPasswordChanged }: Props) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setError("");
    setSuccess(false);

    if (!current) return setError("Please enter your current password.");
    if (newPass.length < 8) return setError("New password must be at least 8 characters.");
    if (newPass !== confirm) return setError("New passwords do not match.");

    try {
      await changePassword(getStoredUser(), current, newPass, confirm);
      onPasswordChanged(newPass);
      setSuccess(true);
      setCurrent("");
      setNewPass("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const status = (err as { status?: number }).status;
      setError(
        status === 401
          ? "Current password is incorrect."
          : err instanceof Error
          ? err.message
          : "Failed to change password.",
      );
    }
  }

  return (
    <section className="bg-white rounded-card border border-grey-300 px-6 py-6 shadow-card">
      <h3 className="text-[1rem] font-semibold text-grey-800 mb-4">Change Password</h3>
      <div className="mb-4">
        <label className={labelCls}>Current Password</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Current password"
          autoComplete="current-password"
          className={inputCls}
        />
      </div>
      <div className="mb-4">
        <label className={labelCls}>New Password</label>
        <input
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          className={inputCls}
        />
      </div>
      <div className="mb-4">
        <label className={labelCls}>Confirm New Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat new password"
          autoComplete="new-password"
          className={inputCls}
        />
      </div>
      {error && (
        <div className="bg-red-50 text-red-600 rounded-[6px] px-3 py-2 text-[0.85rem] mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[#ecfdf5] text-[#065f46] rounded-[6px] px-3 py-2 text-[0.85rem] mb-3">
          Password changed successfully.
        </div>
      )}
      <div className="flex justify-end mt-[18px]">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 rounded-[7px] bg-blue-600 hover:bg-blue-700 text-white border-0 text-[0.88rem] font-medium cursor-pointer transition-colors"
        >
          Change Password
        </button>
      </div>
    </section>
  );
}
