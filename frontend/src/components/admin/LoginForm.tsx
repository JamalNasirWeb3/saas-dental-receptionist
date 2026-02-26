"use client";

import { useState, type FormEvent } from "react";
import type { useAdminAuth } from "@/hooks/useAdminAuth";

interface Props {
  auth: ReturnType<typeof useAdminAuth>;
  onLoginSuccess: () => void;
}

export default function LoginForm({ auth, onLoginSuccess }: Props) {
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      auth.login(user, pass);
      const res = await fetch("/api/appointments", { headers: auth.getAuthHeader() });
      if (res.status === 401) {
        auth.logout();
        setError("Invalid username or password.");
        return;
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      onLoginSuccess();
    } catch (err) {
      auth.logout();
      setError(err instanceof Error ? "Login failed: " + err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full border-[1.5px] border-grey-300 rounded-lg px-3 py-2.5 text-[0.92rem] outline-none focus:border-blue-500 transition-colors";
  const labelCls =
    "block text-[0.8rem] font-semibold text-grey-600 mb-[5px] uppercase tracking-[0.04em]";

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center z-[999]">
      <div className="bg-white rounded-card px-9 py-10 w-full max-w-[380px] shadow-modal text-center">
        <div className="text-[2.8rem] mb-3">🦷</div>
        <h2 className="text-[1.4rem] font-bold text-grey-800 mb-1.5">Staff Login</h2>
        <p className="text-[0.85rem] text-grey-600 mb-6">
          Bright Smile Dental — Appointments Dashboard
        </p>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="text-left mb-4">
            <label className={labelCls} htmlFor="loginUser">
              Username
            </label>
            <input
              id="loginUser"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div className="text-left mb-4">
            <label className={labelCls} htmlFor="loginPass">
              Password
            </label>
            <input
              id="loginPass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
              className={inputCls}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 rounded-[6px] px-3 py-2 text-[0.85rem] text-left mb-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg py-2.5 text-[0.92rem] font-medium cursor-pointer transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
