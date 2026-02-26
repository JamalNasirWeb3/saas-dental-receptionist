export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const SERVICE_KEYS = [
  "cleaning",
  "checkup",
  "filling",
  "extraction",
  "whitening",
  "emergency",
] as const;

export const TOOL_LABELS: Record<string, string> = {
  check_availability: "Checking availability…",
  schedule_appointment: "Booking appointment…",
  cancel_appointment: "Cancelling appointment…",
  get_patient_appointments: "Looking up appointments…",
  get_clinic_info: "Fetching clinic info…",
};

export const SERVICE_NAMES: Record<string, string> = {
  cleaning: "Teeth Cleaning",
  checkup: "Dental Check-up",
  filling: "Dental Filling",
  extraction: "Tooth Extraction",
  whitening: "Teeth Whitening",
  emergency: "Emergency Visit",
};
