"""FastAPI application: REST + SSE endpoints."""

import os
import secrets
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles

from .database import cancel_appointment, get_all_appointments, init_db
from .agent import ReceptionistAgent

_basic = HTTPBasic()

# Shared agent instance (manages session state in memory)
agent = ReceptionistAgent()

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

def _verify_admin(credentials: HTTPBasicCredentials = Depends(_basic)):
    """Validate HTTP Basic credentials against ADMIN_PASSWORD env var."""
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    ok = secrets.compare_digest(credentials.username.encode(), b"admin") and \
         secrets.compare_digest(credentials.password.encode(), admin_password.encode())
    if not ok:
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
