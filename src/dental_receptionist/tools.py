"""Tool schemas and async implementations for the Claude agentic loop."""

import asyncio

from .config import FAQ, SERVICES as _CONFIG_SERVICES
from .database import (
    get_slots,
    create_appointment as db_create_appointment,
    cancel_appointment as db_cancel_appointment,
    get_patient_appointments as db_get_patient_appointments,
    get_effective_clinic_info,
    get_effective_hours,
    get_effective_services,
)

# ---------------------------------------------------------------------------
# Tool schemas (passed to Claude's `tools` parameter)
# ---------------------------------------------------------------------------

TOOLS: list[dict] = [
    {
        "name": "check_availability",
        "description": (
            "Check available appointment slots for a given date and dental service. "
            "Always call this before scheduling to confirm open times."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "date": {
                    "type": "string",
                    "description": "Date to check in YYYY-MM-DD format (e.g. 2026-03-15)",
                },
                "service_type": {
                    "type": "string",
                    "description": "Type of dental service to book",
                    "enum": list(_CONFIG_SERVICES.keys()),
                },
            },
            "required": ["date", "service_type"],
        },
    },
    {
        "name": "schedule_appointment",
        "description": "Book a confirmed dental appointment for a patient.",
        "input_schema": {
            "type": "object",
            "properties": {
                "patient_name":  {"type": "string", "description": "Patient's full name"},
                "patient_phone": {"type": "string", "description": "Patient's phone number"},
                "patient_email": {"type": "string", "description": "Patient's email address"},
                "service_type": {
                    "type": "string",
                    "description": "Type of dental service",
                    "enum": list(_CONFIG_SERVICES.keys()),
                },
                "date": {"type": "string", "description": "Appointment date YYYY-MM-DD"},
                "time": {"type": "string", "description": "Appointment time HH:MM (24-hour, e.g. 09:00 or 14:30)"},
            },
            "required": [
                "patient_name", "patient_phone", "patient_email",
                "service_type", "date", "time",
            ],
        },
    },
    {
        "name": "cancel_appointment",
        "description": "Cancel an existing confirmed appointment by its ID.",
        "input_schema": {
            "type": "object",
            "properties": {
                "appointment_id": {
                    "type": "integer",
                    "description": "The numeric ID of the appointment to cancel",
                },
                "reason": {"type": "string", "description": "Reason for cancellation"},
            },
            "required": ["appointment_id", "reason"],
        },
    },
    {
        "name": "get_patient_appointments",
        "description": "Look up all existing appointments for a patient by name and phone.",
        "input_schema": {
            "type": "object",
            "properties": {
                "patient_name":  {"type": "string", "description": "Patient's full name"},
                "patient_phone": {"type": "string", "description": "Patient's phone number"},
            },
            "required": ["patient_name", "patient_phone"],
        },
    },
    {
        "name": "get_clinic_info",
        "description": (
            "Get information about the dental clinic: hours, services, location, "
            "insurance, parking, cancellation policy, payment options, or FAQs."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "topic": {
                    "type": "string",
                    "description": (
                        "Topic to retrieve. Options: hours, services, location, "
                        "insurance, parking, cancellation, payment, xrays, new_patient, emergency"
                    ),
                },
            },
            "required": ["topic"],
        },
    },
]

# ---------------------------------------------------------------------------
# Helper: format a 24-h HH:MM time to 12-h display
# ---------------------------------------------------------------------------

def _fmt_time(t: str) -> str:
    h, m = int(t.split(":")[0]), int(t.split(":")[1])
    suffix = "AM" if h < 12 else "PM"
    h12 = h % 12 or 12
    return f"{h12}:{m:02d} {suffix}"


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

async def _check_availability(date: str, service_type: str) -> str:
    slots = await get_slots(date, service_type)
    services = await get_effective_services()
    svc = services.get(service_type, {})
    name = svc.get("name", service_type)
    dur = svc.get("duration_min", 60)
    if not slots:
        return (
            f"No available slots for {name} on {date}. "
            "The clinic may be closed or fully booked on that day."
        )
    formatted = ", ".join(_fmt_time(s) for s in slots)
    return f"Available slots for {name} ({dur} min) on {date}:\n{formatted}"


async def _schedule_appointment(
    patient_name: str,
    patient_phone: str,
    patient_email: str,
    service_type: str,
    date: str,
    time: str,
) -> str:
    try:
        result = await db_create_appointment(
            patient_name, patient_phone, patient_email, service_type, date, time
        )
        services = await get_effective_services()
        svc_name = services.get(service_type, {}).get("name", service_type)

        # Send WhatsApp confirmation (runs in thread to avoid blocking the event loop)
        from .whatsapp import send_booking_confirmation
        import asyncio
        await asyncio.get_event_loop().run_in_executor(
            None,
            send_booking_confirmation,
            patient_name,
            patient_phone,
            svc_name,
            date,
            _fmt_time(time),
            result["id"],
            patient_email,
        )

        return (
            f"Appointment confirmed!\n"
            f"  Appointment ID : #{result['id']}\n"
            f"  Patient        : {patient_name}\n"
            f"  Service        : {svc_name}\n"
            f"  Date           : {date}\n"
            f"  Time           : {_fmt_time(time)}\n"
            f"  Phone          : {patient_phone}\n\n"
            f"Reminder: 24-hour cancellation notice is required to avoid a fee.\n"
            f"A confirmation email has been sent to {patient_email}."
        )
    except Exception as exc:
        return f"Failed to schedule appointment: {exc}"


async def _cancel_appointment(appointment_id: int, reason: str) -> str:
    success = await db_cancel_appointment(appointment_id, reason)
    if success:
        return (
            f"Appointment #{appointment_id} has been successfully cancelled.\n"
            f"Reason recorded: {reason}"
        )
    return (
        f"Could not cancel appointment #{appointment_id}. "
        "It may not exist, may already be cancelled, or the ID is incorrect."
    )


async def _get_patient_appointments(patient_name: str, patient_phone: str) -> str:
    rows = await db_get_patient_appointments(patient_name, patient_phone)
    if not rows:
        return f"No appointments found for {patient_name} (phone: {patient_phone})."
    services = await get_effective_services()
    lines = [f"Appointments for {patient_name}:"]
    for apt in rows:
        svc_name = services.get(apt["service"], {}).get("name", apt["service"])
        lines.append(
            f"  • ID #{apt['id']}: {svc_name} on {apt['date']} at "
            f"{_fmt_time(apt['time'])} [{apt['status']}]"
        )
    return "\n".join(lines)


async def _get_clinic_info(topic: str) -> str:
    t = topic.lower()
    info = await get_effective_clinic_info()
    hours = await get_effective_hours()
    services = await get_effective_services()

    if any(w in t for w in ("hour", "open", "close", "schedule", "time")):
        lines = [f"{info['name']} — Office Hours:"]
        lines += [f"  {day}: {hrs}" for day, hrs in hours.items()]
        return "\n".join(lines)

    if any(w in t for w in ("service", "treatment", "offer", "procedure", "cost", "price")):
        lines = [f"{info['name']} — Services & Pricing:"]
        for svc in services.values():
            lines.append(f"  • {svc['name']}: {svc['duration_min']} min — {svc['price']}")
        return "\n".join(lines)

    if any(w in t for w in ("location", "address", "where", "direction", "find")):
        return (
            f"{info['name']}\n"
            f"Address : {info['address']}\n"
            f"Phone   : {info['phone']}"
        )

    # Check specific FAQ keys
    for key, answer in FAQ.items():
        if key in t or t in key:
            return answer

    # General overview
    return (
        f"{info['name']}\n"
        f"Address : {info['address']}\n"
        f"Phone   : {info['phone']}\n"
        f"Hours   : Mon–Fri 9 AM–5 PM, Sat 9 AM–1 PM, Closed Sunday\n"
        f"Services: cleaning, check-up, filling, extraction, whitening, emergency\n"
        f"Ask me about insurance, parking, cancellation policy, or pricing!"
    )


# ---------------------------------------------------------------------------
# Registry: tool name → async callable
# ---------------------------------------------------------------------------

TOOL_HANDLERS: dict = {
    "check_availability":     _check_availability,
    "schedule_appointment":   _schedule_appointment,
    "cancel_appointment":     _cancel_appointment,
    "get_patient_appointments": _get_patient_appointments,
    "get_clinic_info":        _get_clinic_info,
}
