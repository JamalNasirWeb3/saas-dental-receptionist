"use client";

import { useState, useCallback } from "react";
import type { Appointment } from "@/types";
import { fetchAppointments } from "@/lib/api";

export function useAppointments(
  getAuthHeader: () => Record<string, string>,
  logout: () => void,
) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAppointments(getAuthHeader());
      setAppointments(data);
      setLastRefresh(new Date());
    } catch (err) {
      if ((err as { status?: number }).status === 401) {
        logout();
      } else {
        console.error("Failed to load appointments:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader, logout]);

  return { appointments, isLoading, lastRefresh, loadAppointments };
}
