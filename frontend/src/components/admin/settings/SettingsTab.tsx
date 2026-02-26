import type { SettingsPayload, ClinicInfo, ClinicHours, ServicesConfig } from "@/types";
import ClinicInfoSection from "./ClinicInfoSection";
import OpeningHoursSection from "./OpeningHoursSection";
import ServicesSection from "./ServicesSection";
import ChangePasswordSection from "./ChangePasswordSection";

interface Props {
  settings: SettingsPayload | null;
  onSaveInfo: (info: ClinicInfo) => Promise<void>;
  onSaveHours: (hours: ClinicHours) => Promise<void>;
  onSaveServices: (services: ServicesConfig) => Promise<void>;
  getStoredUser: () => string;
  onPasswordChanged: (newPass: string) => void;
}

const EMPTY_INFO: ClinicInfo = { name: "", address: "", phone: "", email: "" };
const EMPTY_HOURS: ClinicHours = {
  Monday: "",
  Tuesday: "",
  Wednesday: "",
  Thursday: "",
  Friday: "",
  Saturday: "",
  Sunday: "",
};

export default function SettingsTab({
  settings,
  onSaveInfo,
  onSaveHours,
  onSaveServices,
  getStoredUser,
  onPasswordChanged,
}: Props) {
  if (!settings) {
    return (
      <div className="text-center py-10 text-grey-600 italic">Loading settings…</div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ClinicInfoSection initial={settings.info ?? EMPTY_INFO} onSave={onSaveInfo} />
      <OpeningHoursSection initial={settings.hours ?? EMPTY_HOURS} onSave={onSaveHours} />
      <ServicesSection initial={settings.services ?? {}} onSave={onSaveServices} />
      <ChangePasswordSection getStoredUser={getStoredUser} onPasswordChanged={onPasswordChanged} />
    </div>
  );
}
