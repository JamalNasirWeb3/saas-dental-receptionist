"use client";

import { useState, useEffect, useCallback } from "react";

export function useAdminAuth() {
  // Start as false — safe server default; flipped in useEffect after reading sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!sessionStorage.getItem("adminAuth"));
  }, []);

  const login = useCallback((user: string, pass: string) => {
    sessionStorage.setItem("adminAuth", btoa(user + ":" + pass));
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  }, []);

  const getAuthHeader = useCallback((): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const stored = sessionStorage.getItem("adminAuth");
    return stored ? { Authorization: "Basic " + stored } : {};
  }, []);

  const getStoredUser = useCallback((): string => {
    if (typeof window === "undefined") return "admin";
    const stored = sessionStorage.getItem("adminAuth");
    if (!stored) return "admin";
    return atob(stored).split(":")[0] || "admin";
  }, []);

  /** Call after a successful password change so the session remains valid. */
  const updateStoredPassword = useCallback((newPass: string) => {
    const user = getStoredUser();
    sessionStorage.setItem("adminAuth", btoa(user + ":" + newPass));
  }, [getStoredUser]);

  return { isAuthenticated, login, logout, getAuthHeader, getStoredUser, updateStoredPassword };
}
