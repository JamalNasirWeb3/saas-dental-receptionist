"""Clinic configuration: hours, services, FAQ."""

CLINIC_NAME = "Bright Smile Dental"
CLINIC_ADDRESS = "Plot 22 Street 17 DHA Phase-2, Islamabad"
CLINIC_PHONE = "0301-9568220"
CLINIC_EMAIL = "clinicbright@gmail.com"

HOURS: dict[str, str] = {
    "Monday":    "9:00 AM – 5:00 PM",
    "Tuesday":   "9:00 AM – 5:00 PM",
    "Wednesday": "9:00 AM – 5:00 PM",
    "Thursday":  "9:00 AM – 5:00 PM",
    "Friday":    "9:00 AM – 5:00 PM",
    "Saturday":  "9:00 AM – 1:00 PM",
    "Sunday":    "Closed",
}

# service_key → {name, duration_min, price}
SERVICES: dict[str, dict] = {
    "cleaning":   {"name": "Teeth Cleaning",     "duration_min": 60,  "price": "RS 3,500"},
    "checkup":    {"name": "Dental Check-up",     "duration_min": 45,  "price": "RS 2,000"},
    "filling":    {"name": "Dental Filling",      "duration_min": 90,  "price": "RS 5,500"},
    "extraction": {"name": "Tooth Extraction",    "duration_min": 60,  "price": "RS 6,500"},
    "whitening":  {"name": "Teeth Whitening",     "duration_min": 90,  "price": "RS 9,500"},
    "emergency":  {"name": "Emergency Visit",     "duration_min": 30,  "price": "RS 4,000"},
}

FAQ: dict[str, str] = {
    "insurance": (
        "We accept most major dental insurance plans including Delta Dental, Cigna, "
        "Aetna, and MetLife. Please call us during business hours to verify your specific "
        "coverage and benefits before your appointment."
    ),
    "parking": (
        "Free parking is available in our dedicated lot directly behind the building, "
        "accessible from Oak Avenue. Street parking on Main St is also free."
    ),
    "cancellation": (
        "We kindly ask for at least 24 hours' notice if you need to cancel or reschedule. "
        "Appointments cancelled with less than 24 hours' notice may incur a $50 late-cancellation fee."
    ),
    "payment": (
        "We accept cash, all major credit and debit cards (Visa, Mastercard, Amex, Discover), "
        "and offer flexible payment plans for treatments over $500. CareCredit financing is also available."
    ),
    "xrays": (
        "We use modern low-radiation digital X-rays for patient safety. Routine X-rays are "
        "typically taken once a year, or as clinically needed for diagnosis."
    ),
    "new_patient": (
        "New patients receive a complimentary comprehensive exam and digital X-rays on their first visit. "
        "Please arrive 10 minutes early to complete your new-patient paperwork."
    ),
    "emergency": (
        f"For dental emergencies during business hours please call {CLINIC_PHONE} immediately. "
        "After hours, we have a 24-hour emergency line — listen to our voicemail for the on-call number. "
        "For life-threatening situations, always call 911 or go to the nearest ER."
    ),
}
