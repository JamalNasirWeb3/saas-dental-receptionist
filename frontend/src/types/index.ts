export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  isError: boolean;
  timestamp: Date;
}

export type SSEEvent =
  | { type: "text"; chunk: string }
  | { type: "tool"; name: string }
  | { type: "error"; message: string }
  | { type: "done" };

export interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "cancelled";
}

export interface AppointmentFilters {
  date: string;
  status: string;
  search: string;
}

export interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface ClinicHours {
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
}

export interface ServiceConfig {
  name: string;
  duration_min: number;
  price: string;
}

export type ServicesConfig = Record<string, ServiceConfig>;

export interface SettingsPayload {
  info: ClinicInfo;
  hours: ClinicHours;
  services: ServicesConfig;
}
