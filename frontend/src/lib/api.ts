import type { Appointment, SettingsPayload, ClinicInfo, ClinicHours, ServicesConfig } from "@/types";

type AuthHeaders = Record<string, string>;

export async function fetchAppointments(authHeaders: AuthHeaders): Promise<Appointment[]> {
  const res = await fetch("/api/appointments", { headers: authHeaders });
  if (!res.ok) {
    const err = new Error("fetch appointments failed") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function cancelAppointment(
  id: number,
  reason: string,
  authHeaders: AuthHeaders,
): Promise<void> {
  const res = await fetch(`/api/appointments/${id}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Cancel failed");
}

export async function fetchSettings(authHeaders: AuthHeaders): Promise<SettingsPayload> {
  const res = await fetch("/api/settings", { headers: authHeaders });
  if (!res.ok) {
    const err = new Error("fetch settings failed") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function saveSettings(
  payload: { info?: ClinicInfo; hours?: ClinicHours; services?: ServicesConfig },
  authHeaders: AuthHeaders,
): Promise<void> {
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Save settings failed");
}

export async function changePassword(
  storedUser: string,
  currentPass: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> {
  const tempAuth = "Basic " + btoa(storedUser + ":" + currentPass);
  const res = await fetch("/api/admin/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: tempAuth },
    body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword }),
  });
  if (res.status === 401) {
    const e = new Error("Incorrect current password") as Error & { status: number };
    e.status = 401;
    throw e;
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { detail?: string }).detail || "Failed to change password");
  }
}
