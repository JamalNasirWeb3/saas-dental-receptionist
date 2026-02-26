"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useSettings } from "@/hooks/useSettings";
import LoginForm from "./LoginForm";
import DashboardHeader from "./DashboardHeader";
import TabNav from "./TabNav";
import AppointmentsTab from "./appointments/AppointmentsTab";
import SettingsTab from "./settings/SettingsTab";

type Tab = "appointments" | "settings";

export default function AdminPage() {
  const auth = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>("appointments");
  const appts = useAppointments(auth.getAuthHeader, auth.logout);
  const settings = useSettings(auth.getAuthHeader, auth.logout);

  // Start auto-refresh + initial load once authenticated
  useEffect(() => {
    if (!auth.isAuthenticated) return;
    appts.loadAppointments();
    const timer = setInterval(appts.loadAppointments, 60_000);
    return () => clearInterval(timer);
  }, [auth.isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "settings") settings.loadSettings();
  }

  if (!auth.isAuthenticated) {
    return (
      <LoginForm
        auth={auth}
        onLoginSuccess={() => appts.loadAppointments()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-grey-100">
      <div className="max-w-[1200px] mx-auto px-5 pb-10">
        <DashboardHeader
          onRefresh={appts.loadAppointments}
          onLogout={auth.logout}
        />
        <TabNav activeTab={activeTab} onChange={handleTabChange} />

        {activeTab === "appointments" && (
          <AppointmentsTab
            appointments={appts.appointments}
            isLoading={appts.isLoading}
            lastRefresh={appts.lastRefresh}
            onRefresh={appts.loadAppointments}
            getAuthHeader={auth.getAuthHeader}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            settings={settings.settings}
            onSaveInfo={settings.saveInfo}
            onSaveHours={settings.saveHours}
            onSaveServices={settings.saveServices}
            getStoredUser={auth.getStoredUser}
            onPasswordChanged={auth.updateStoredPassword}
          />
        )}
      </div>
    </div>
  );
}
