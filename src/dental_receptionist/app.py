"""FastAPI application: REST + SSE endpoints."""

import os
import secrets
import tempfile
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile, status
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from openai import AsyncOpenAI

from passlib.hash import bcrypt as bcrypt_hash

from .database import cancel_appointment, get_all_appointments, get_setting, init_db, set_setting
from .agent import ReceptionistAgent

_basic = HTTPBasic()

# Shared agent instance (manages session state in memory)
agent = ReceptionistAgent()

openai_client = AsyncOpenAI()  # reads OPENAI_API_KEY from env

STATIC_DIR = Path(__file__).parent.parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Dental AI Receptionist", lifespan=lifespan)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ---------------------------------------------------------------------------
# Auth helper
# ---------------------------------------------------------------------------

async def _check_password(plain: str) -> bool:
    """Return True if *plain* matches the stored admin password."""
    hashed = await get_setting("admin_password")
    if hashed:
        return bcrypt_hash.verify(plain, hashed)
    # Fall back to plain-text compare against env var / default
    fallback = os.getenv("ADMIN_PASSWORD", "admin123")
    return secrets.compare_digest(plain.encode(), fallback.encode())


async def _verify_admin(credentials: HTTPBasicCredentials = Depends(_basic)):
    """Validate HTTP Basic credentials; checks bcrypt hash in DB with plain-text fallback."""
    username_ok = secrets.compare_digest(credentials.username.encode(), b"admin")
    password_ok = await _check_password(credentials.password)
    if not (username_ok and password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
async def index():
    return HTMLResponse((STATIC_DIR / "index.html").read_text(encoding="utf-8"))


@app.get("/session")
async def create_session():
    """Create a new chat session and return its id."""
    return JSONResponse({"session_id": str(uuid.uuid4())})


@app.post("/chat")
async def chat(request: Request):
    """Accept {session_id, message} and stream back SSE events."""
    body = await request.json()
    session_id: str = body.get("session_id", "")
    message: str = body.get("message", "").strip()

    if not session_id or not message:
        return JSONResponse(
            {"error": "Both session_id and message are required."},
            status_code=400,
        )

    async def generate():
        async for chunk in agent.stream_response(session_id, message):
            yield chunk

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# Admin routes
# ---------------------------------------------------------------------------

@app.get("/admin", response_class=HTMLResponse)
async def admin_page():
    return HTMLResponse((STATIC_DIR / "admin.html").read_text(encoding="utf-8"))


@app.get("/api/appointments")
async def api_appointments(
    date: str | None = None,
    status_filter: str | None = None,
    search: str | None = None,
    _: None = Depends(_verify_admin),
):
    """Return all appointments as JSON. Supports ?date=, ?status_filter=, ?search= query params."""
    rows = await get_all_appointments(
        date_filter=date,
        status_filter=status_filter,
        search=search,
    )
    return JSONResponse(rows)


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), language: str = "en"):
    """Transcribe audio using OpenAI Whisper. Returns {text: ...}."""
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name
    try:
        with open(tmp_path, "rb") as f:
            result = await openai_client.audio.transcriptions.create(
                model="whisper-1", file=f, language=language
            )
        return JSONResponse({"text": result.text})
    finally:
        os.unlink(tmp_path)


@app.post("/api/appointments/{appointment_id}/cancel")
async def api_cancel_appointment(
    appointment_id: int,
    request: Request,
    _: None = Depends(_verify_admin),
):
    body = await request.json()
    reason = body.get("reason", "Cancelled by staff")
    cancelled = await cancel_appointment(appointment_id, reason)
    if not cancelled:
        raise HTTPException(status_code=404, detail="Appointment not found or already cancelled")
    return JSONResponse({"ok": True})


@app.post("/api/admin/change-password")
async def api_change_password(
    request: Request,
    credentials: HTTPBasicCredentials = Depends(_basic),
):
    """Change the admin password. Requires valid current credentials in Basic Auth."""
    # Verify current credentials first
    username_ok = secrets.compare_digest(credentials.username.encode(), b"admin")
    current_password_ok = await _check_password(credentials.password)
    if not (username_ok and current_password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
            headers={"WWW-Authenticate": "Basic"},
        )

    body = await request.json()
    new_password: str = body.get("new_password", "")
    confirm_password: str = body.get("confirm_password", "")

    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    hashed = bcrypt_hash.hash(new_password)
    await set_setting("admin_password", hashed)
    return JSONResponse({"ok": True})
