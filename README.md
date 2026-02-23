# 🦷 Dental AI Receptionist

An AI-powered dental receptionist built with the **Claude API**, **FastAPI**, and **SQLite**. Patients chat in a browser UI and the agent handles appointment scheduling, cancellations, and clinic FAQs — all via real-time streaming.

---

## Features

- **Conversational scheduling** — checks availability, books, and cancels appointments through natural language
- **Five agentic tools** — `check_availability`, `schedule_appointment`, `cancel_appointment`, `get_patient_appointments`, `get_clinic_info`
- **Real-time streaming** — responses stream token-by-token via SSE; tool activity shown with spinners
- **Multi-turn memory** — per-session conversation history maintained server-side (2-hour expiry)
- **SQLite persistence** — patients and appointments stored in `dental.db`
- **Dental-themed UI** — clean white/blue chat interface

---

## Architecture

```
Browser (HTML/CSS/JS)
    ↕  SSE streaming + REST
FastAPI  (app.py)
    ↕  async generator → StreamingResponse
ReceptionistAgent  (agent.py)
    ↕  agentic tool-use loop
Claude claude-opus-4-6  (Anthropic API)
    ↕  tool calls
SQLite  (database.py + aiosqlite)
```

---

## Project Structure

```
src/dental_receptionist/
├── __init__.py
├── app.py        # FastAPI app — GET /, GET /session, POST /chat
├── agent.py      # Claude conversation manager + SSE streaming loop
├── tools.py      # Tool schemas + async implementations
├── database.py   # SQLite init and CRUD helpers (aiosqlite)
└── config.py     # Clinic hours, services, FAQ constants
static/
├── index.html    # Chat UI shell
├── style.css     # White/blue dental theme
└── app.js        # SSE reader, session management, tool spinners
```

---

## Quickstart

### 1. Clone and install

```bash
git clone https://github.com/JamalNasirWeb3/saas-dental-receptionist
cd saas-dental-receptionist
uv sync
```

> Requires [uv](https://docs.astral.sh/uv/) and Python 3.12+.

### 2. Set your API key

```bash
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env
```

### 3. Run

```bash
uv run uvicorn dental_receptionist.app:app --reload
```

Open **http://localhost:8000** in your browser.

---

## Tools

| Tool | Description |
|------|-------------|
| `check_availability` | Returns open time slots for a given date and service |
| `schedule_appointment` | Books a confirmed appointment and stores it in SQLite |
| `cancel_appointment` | Cancels an appointment by ID |
| `get_patient_appointments` | Looks up all appointments for a patient by name + phone |
| `get_clinic_info` | Returns clinic hours, services, location, or FAQ answers |

---

## Services & Pricing

| Service | Duration | Price |
|---------|----------|-------|
| Teeth Cleaning | 60 min | $120 |
| Dental Check-up | 45 min | $80 |
| Dental Filling | 90 min | $200 |
| Tooth Extraction | 60 min | $250 |
| Teeth Whitening | 90 min | $350 |
| Emergency Visit | 30 min | $150 |

Clinic hours: **Mon–Fri 9 AM–5 PM · Sat 9 AM–1 PM · Closed Sunday**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | Claude claude-opus-4-6 (`claude-opus-4-6`) |
| Backend | FastAPI + uvicorn |
| Streaming | Server-Sent Events (SSE) |
| Database | SQLite via aiosqlite |
| Frontend | Vanilla HTML/CSS/JS |
| Package manager | uv |

---

## License

MIT
