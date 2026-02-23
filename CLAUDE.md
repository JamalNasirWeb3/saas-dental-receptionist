# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`saasdentalreceptionist` is a Python 3.12 AI-powered dental receptionist built with FastAPI,
Claude API (claude-opus-4-6 with interleaved thinking), and SQLite. Patients interact via a
browser chat UI; the agent handles scheduling, cancellations, and clinic FAQs through tool calls.

## Commands

```bash
# Install / sync all dependencies
uv sync

# Add a new dependency
uv add <package>

# Run the development server (with auto-reload)
uv run uvicorn dental_receptionist.app:app --reload

# Open the chat UI
# http://localhost:8000
```

## Structure

```
src/dental_receptionist/
    __init__.py     — package init
    app.py          — FastAPI app + API routes (/, /session, /chat)
    agent.py        — Claude conversation manager + agentic loop (SSE streaming)
    tools.py        — Tool schemas + async implementations
    database.py     — SQLite init and CRUD helpers (aiosqlite)
    config.py       — Clinic info constants (hours, services, FAQ)
static/
    index.html      — Chat UI shell
    style.css       — Dental-themed white/blue design
    app.js          — SSE stream handling, session management
.env                — ANTHROPIC_API_KEY (never commit)
pyproject.toml      — Project metadata and dependencies (hatchling build)
dental.db           — SQLite database (created at first run, gitignored)
```

## Key Design Decisions

- **SSE over WebSockets**: POST /chat returns `text/event-stream`; frontend reads with `fetch()` + `ReadableStream`.
- **Agentic loop**: agent.py runs a while-loop; Claude calls tools, results are fed back until `stop_reason != "tool_use"`.
- **Interleaved thinking**: Uses `betas=["interleaved-thinking-2025-05-14"]` with `thinking={"type": "enabled", "budget_tokens": 8000}`, falling back to standard streaming if unavailable.
- **Session state**: In-memory dict keyed by UUID; sessions expire after 2 hours.
- **Database path**: `dental.db` is created in the working directory (project root).

## Environment

`.env` must contain:
```
ANTHROPIC_API_KEY=sk-ant-...
```
