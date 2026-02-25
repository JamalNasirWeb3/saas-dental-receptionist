"""WhatsApp booking confirmation via Twilio."""

import logging
import os
import re

logger = logging.getLogger(__name__)


def _to_e164(phone: str, default_country_code: str = "1") -> str:
    """
    Normalise an arbitrary phone string to E.164 format (+CCCNNNNNNNNN).

    - Strips all non-digit characters.
    - If the result is 10 digits it prepends the default country code (US/CA).
    - If it already starts with the country code it is left as-is.
    - Returns the original string unchanged when normalisation is not possible,
      so the caller can still attempt the send and surface a clean Twilio error.
    """
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        digits = default_country_code + digits
    return f"+{digits}" if digits else phone


def send_booking_confirmation(
    patient_name: str,
    patient_phone: str,
    service_name: str,
    date: str,
    time_display: str,
    appointment_id: int,
) -> bool:
    """
    Send a WhatsApp booking-confirmation message to the patient.

    Required environment variables
    --------------------------------
    TWILIO_ACCOUNT_SID   – Twilio account SID (ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
    TWILIO_AUTH_TOKEN    – Twilio auth token
    TWILIO_WHATSAPP_FROM – Twilio WhatsApp-enabled number in E.164 format
                           e.g.  +14155238886  (Twilio Sandbox)
                           or    +1XXXXXXXXXX  (approved production number)

    Returns True on success, False on any error (booking is never blocked).
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_WHATSAPP_FROM")

    if not all([account_sid, auth_token, from_number]):
        logger.warning(
            "WhatsApp notification skipped — TWILIO_ACCOUNT_SID, "
            "TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_FROM not set in .env"
        )
        return False

    try:
        from twilio.rest import Client  # imported here to avoid hard dep at startup

        to_number = _to_e164(patient_phone)

        message_body = (
            f"Hello {patient_name}! 😊\n\n"
            f"Your appointment at *Bright Smile Dental* is confirmed:\n\n"
            f"🦷 *Service:* {service_name}\n"
            f"📅 *Date:* {date}\n"
            f"🕐 *Time:* {time_display}\n"
            f"🔖 *Booking ID:* #{appointment_id}\n\n"
            f"Please note: 24-hour cancellation notice is required to avoid a fee.\n"
            f"Questions? Call us at (217) 555-0100.\n\n"
            f"See you soon! ✨"
        )

        client = Client(account_sid, auth_token)
        msg = client.messages.create(
            from_=f"whatsapp:{from_number}",
            to=f"whatsapp:{to_number}",
            body=message_body,
        )
        logger.info("WhatsApp confirmation sent: SID=%s to=%s", msg.sid, to_number)
        return True

    except Exception:
        logger.exception("Failed to send WhatsApp confirmation to %s", patient_phone)
        return False
