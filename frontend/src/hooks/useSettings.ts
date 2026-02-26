"use client";

import { useState, useCallback } from "react";
import type { SettingsPayload, ClinicInfo, ClinicHours, ServicesConfig } from "@/types";
import { fetchSettings, saveSettings } from "@/lib/api";

export function useSettings(
  getAuthHeader: () => Record<string, string>,
  logout: () => void,
) {
  const [settings, setSettings] = useState<SettingsPayload | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchSettings(getAuthHeader());
      setSettings(data);
    } catch (err) {
      if ((err as { status?: number }).status === 401) logout();
      else console.error("Failed to load settings:", err);
    }
  }, [getAuthHeader, logout]);

  const saveInfo = useCallback(
    async (info: ClinicInfo) => {
      await saveSettings({ info }, getAuthHeader());
    },
    [getAuthHeader],
  );

  const saveHours = useCallback(
    async (hours: ClinicHours) => {
      await saveSettings({ hours }, getAuthHeader());
    },
    [getAuthHeader],
  );

  const saveServices = useCallback(
    async (services: ServicesConfig) => {
      await saveSettings({ services }, getAuthHeader());
    },
    [getAuthHeader],
  );

  return { settings, loadSettings, saveInfo, saveHours, saveServices };
}
