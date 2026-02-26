"""Background job: send 24-hour appointment reminder emails."""

import logging

from .database import get_pending_24h_reminders, mark_reminder_sent
from .whatsapp import send_booking_confirmation

logger = logging.getLogger(__name__)


async def send_24h_reminders() -> None:
    """
    Query appointments due tomorrow with no reminder sent yet,
    email each patient, then mark the reminder as sent.
    """
    rows = await get_pending_24h_reminders()
    if not rows:
        return

    logger.info("Reminder job: found %d appointment(s) due tomorrow", len(rows))
    for row in rows:
        ok = send_booking_confirmation(
            patient_name=row["name"],
            patient_phone=row["phone"],
            service_name=row["service"],
            date=row["date"],
            time_display=row["time"],
            appointment_id=row["id"],
            patient_email=row["email"] or "",
        )
        if ok:
            await mark_reminder_sent(row["id"])
            logger.info("Reminder sent for appointment #%d", row["id"])
        else:
            logger.warning(
                "Reminder NOT sent for appointment #%d (email error or missing config)",
                row["id"],
            )
