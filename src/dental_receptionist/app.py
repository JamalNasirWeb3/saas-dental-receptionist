"""FastAPI application: REST + SSE endpoints."""

import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from .database import init_db
from .agent import ReceptionistAgent

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
