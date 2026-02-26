"""Booking confirmation email via SMTP."""

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


def send_booking_confirmation(
    patient_name: str,
    patient_phone: str,
    service_name: str,
    date: str,
    time_display: str,
    appointment_id: int,
    patient_email: str = "",
) -> bool:
    """
    Send a booking-confirmation email via SMTP.

    Required environment variables
    --------------------------------
    EMAIL_SENDER    – sender address (e.g. yourname@gmail.com)
    EMAIL_PASSWORD  – app password (Gmail: 16-char app password)
    EMAIL_SMTP_HOST – SMTP host   (default: smtp.gmail.com)
    EMAIL_SMTP_PORT – SMTP port   (default: 587)

    Returns True on success, False on any error (booking is never blocked).
    """
    sender = os.getenv("EMAIL_SENDER") or os.getenv("GMAIL_EMAIL")
    password = os.getenv("EMAIL_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD")
    smtp_host = os.getenv("EMAIL_SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("EMAIL_SMTP_PORT", "587"))

    if not all([sender, password]):
        logger.warning(
            "Email notification skipped — EMAIL_SENDER/GMAIL_EMAIL or "
            "EMAIL_PASSWORD/GMAIL_APP_PASSWORD not set in .env"
        )
        return False

    recipient = patient_email or ""
    if not recipient or "@" not in recipient:
        logger.warning("Email notification skipped — no valid patient email address provided")
        return False

    subject = f"Appointment Confirmed – Bright Smile Dental (#{appointment_id})"

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
        <div style="background: #1a73e8; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Bright Smile Dental</h1>
            <p style="color: #d0e8ff; margin: 4px 0 0;">Appointment Confirmation</p>
        </div>
        <div style="background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px;">Hello <strong>{patient_name}</strong>,</p>
            <p>Your appointment has been confirmed. Here are your booking details:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="background: #eaf2ff;">
                    <td style="padding: 10px 14px; font-weight: bold; width: 40%;">Booking ID</td>
                    <td style="padding: 10px 14px;">#{appointment_id}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 14px; font-weight: bold;">Service</td>
                    <td style="padding: 10px 14px;">{service_name}</td>
                </tr>
                <tr style="background: #eaf2ff;">
                    <td style="padding: 10px 14px; font-weight: bold;">Date</td>
                    <td style="padding: 10px 14px;">{date}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 14px; font-weight: bold;">Time</td>
                    <td style="padding: 10px 14px;">{time_display}</td>
                </tr>
                <tr style="background: #eaf2ff;">
                    <td style="padding: 10px 14px; font-weight: bold;">Phone</td>
                    <td style="padding: 10px 14px;">{patient_phone}</td>
                </tr>
            </table>

            <div style="background: #fff8e1; border-left: 4px solid #f9a825; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                <strong>Cancellation Policy:</strong> 24-hour notice is required to avoid a cancellation fee.
            </div>

            <p>Questions? Call us at <strong>(217) 555-0100</strong>.</p>
            <p style="margin-top: 24px;">See you soon!<br><strong>Bright Smile Dental Team</strong></p>
        </div>
    </body>
    </html>
    """

    text_body = (
        f"Hello {patient_name},\n\n"
        f"Your appointment at Bright Smile Dental is confirmed:\n\n"
        f"  Booking ID : #{appointment_id}\n"
        f"  Service    : {service_name}\n"
        f"  Date       : {date}\n"
        f"  Time       : {time_display}\n"
        f"  Phone      : {patient_phone}\n\n"
        f"Cancellation Policy: 24-hour notice required to avoid a fee.\n"
        f"Questions? Call (217) 555-0100.\n\n"
        f"See you soon!\n"
        f"Bright Smile Dental Team"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Bright Smile Dental <{sender}>"
    msg["To"] = recipient
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, recipient, msg.as_string())
        logger.info("Booking confirmation email sent to %s (ID #%s)", recipient, appointment_id)
        return True
    except Exception:
        logger.exception("Failed to send booking confirmation email to %s", recipient)
        return False
