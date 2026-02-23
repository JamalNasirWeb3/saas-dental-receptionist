"""SQLite database helpers using aiosqlite."""

import aiosqlite
from datetime import datetime

DB_PATH = "dental.db"


async def init_db() -> None:
    """Create tables if they don't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT    NOT NULL,
                phone      TEXT    NOT NULL,
                email      TEXT,
                created_at TEXT    DEFAULT (datetime('now'))
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL REFERENCES patients(id),
                service    TEXT    NOT NULL,
                date       TEXT    NOT NULL,
                time       TEXT    NOT NULL,
                status     TEXT    NOT NULL DEFAULT 'confirmed',
                reason     TEXT,
                created_at TEXT    DEFAULT (datetime('now'))
            )
        """)
        await db.commit()


# ---------------------------------------------------------------------------
# Patients
# ---------------------------------------------------------------------------

async def get_or_create_patient(name: str, phone: str, email: str) -> int:
    """Return existing patient id (matched by phone) or insert a new one."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT id FROM patients WHERE phone = ?", (phone,)
        ) as cur:
            row = await cur.fetchone()
        if row:
            return row[0]
        cur = await db.execute(
            "INSERT INTO patients (name, phone, email) VALUES (?, ?, ?)",
            (name, phone, email),
        )
        await db.commit()
        return cur.lastrowid


# ---------------------------------------------------------------------------
# Appointments
# ---------------------------------------------------------------------------

async def get_slots(date_str: str, service_type: str) -> list[str]:
    """Return available HH:MM time slots for the given date and service."""
    from .config import HOURS, SERVICES

    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return []

    day_name = d.strftime("%A")
    day_hours = HOURS.get(day_name, "Closed")
    if day_hours == "Closed":
        return []

    # Clinic open window
    if day_name == "Saturday":
        open_h, close_h = 9, 13
    else:
        open_h, close_h = 9, 17

    duration = SERVICES.get(service_type, {}).get("duration_min", 60)

    # Generate candidate slots (30-min grid)
    candidates: list[str] = []
    cur_min = open_h * 60
    end_min = close_h * 60
    while cur_min + duration <= end_min:
        candidates.append(f"{cur_min // 60:02d}:{cur_min % 60:02d}")
        cur_min += 30

    # Remove already-booked slots on that date
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT time FROM appointments WHERE date = ? AND status = 'confirmed'",
            (date_str,),
        ) as cur:
            booked = {row[0] async for row in cur}

    return [s for s in candidates if s not in booked]


async def create_appointment(
    patient_name: str,
    patient_phone: str,
    patient_email: str,
    service: str,
    date_str: str,
    time_str: str,
) -> dict:
    """Insert a confirmed appointment and return its id."""
    patient_id = await get_or_create_patient(patient_name, patient_phone, patient_email)
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            """INSERT INTO appointments (patient_id, service, date, time, status)
               VALUES (?, ?, ?, ?, 'confirmed')""",
            (patient_id, service, date_str, time_str),
        )
        await db.commit()
        return {"id": cur.lastrowid, "patient_id": patient_id}


async def cancel_appointment(appointment_id: int, reason: str) -> bool:
    """Set appointment status to cancelled. Returns True if a row was updated."""
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            """UPDATE appointments
               SET status = 'cancelled', reason = ?
               WHERE id = ? AND status = 'confirmed'""",
            (reason, appointment_id),
        )
        await db.commit()
        return cur.rowcount > 0


async def get_patient_appointments(patient_name: str, patient_phone: str) -> list[dict]:
    """Return all appointments for a patient matched by name (partial) and phone."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT a.id, a.service, a.date, a.time, a.status
               FROM appointments a
               JOIN patients p ON a.patient_id = p.id
               WHERE p.name LIKE ? AND p.phone = ?
               ORDER BY a.date, a.time""",
            (f"%{patient_name}%", patient_phone),
        ) as cur:
            rows = await cur.fetchall()
    return [dict(r) for r in rows]
