"""Claude-powered receptionist: agentic loop with SSE streaming."""

import json
import os
import time
from typing import AsyncGenerator

from anthropic import AsyncAnthropic
from dotenv import load_dotenv

from .config import CLINIC_NAME, CLINIC_PHONE
from .tools import TOOLS, TOOL_HANDLERS

load_dotenv()

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = f"""You are Sarah, the warm and professional virtual receptionist for {CLINIC_NAME}.
You assist patients who contact us after hours or during busy periods.

Your personality:
- Friendly, empathetic, and reassuring
- Efficient yet never rushed — patients feel heard
- Professional but approachable (use first names when given)

Your capabilities:
- Check appointment availability and book appointments
- Cancel or look up existing appointments
- Answer questions about clinic hours, services, location, and policies
- Provide general dental care guidance (not medical advice)

Important guidelines:
1. Always greet the patient warmly at the start of a conversation.
2. If after business hours (Mon–Fri 9 AM–5 PM, Sat 9 AM–1 PM), acknowledge it and reassure them
   you can still help with scheduling and information.
3. Before scheduling, always check availability first with the check_availability tool.
4. Collect name, phone, and email before booking an appointment.
5. Confirm all appointment details with the patient before calling schedule_appointment.
6. Never provide specific medical diagnoses; always recommend consulting the dentist.
7. For dental emergencies, provide the clinic phone ({CLINIC_PHONE}) and advise calling 911
   for life-threatening situations.
8. If you cannot help with something, politely explain and suggest calling during business hours.
9. Keep responses concise and easy to read — use bullet points when listing options.
"""

SESSION_EXPIRY = 7200  # 2 hours in seconds


def _serialize_block(block) -> dict:
    """Serialize a content block to only the fields the Anthropic API accepts as input."""
    t = getattr(block, "type", None)
    if t == "text":
        return {"type": "text", "text": str(block.text)}
    elif t == "tool_use":
        return {"type": "tool_use", "id": block.id, "name": block.name, "input": dict(block.input)}
    # thinking blocks — should not occur without the thinking beta, but handle gracefully
    elif t == "thinking":
        return {"type": "thinking", "thinking": block.thinking, "signature": block.signature}
    return {"type": t}


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------

class ReceptionistAgent:
    def __init__(self) -> None:
        self.client = AsyncAnthropic()
        self.sessions: dict[str, dict] = {}

    # ------------------------------------------------------------------
    # Session management
    # ------------------------------------------------------------------

    def _get_session_history(self, session_id: str) -> list:
        now = time.time()
        # Purge expired sessions
        for sid in list(self.sessions):
            if now - self.sessions[sid]["ts"] > SESSION_EXPIRY:
                del self.sessions[sid]

        if session_id not in self.sessions:
            self.sessions[session_id] = {"history": [], "ts": now}
        else:
            self.sessions[session_id]["ts"] = now

        return self.sessions[session_id]["history"]

    # ------------------------------------------------------------------
    # Streaming agentic loop
    # ------------------------------------------------------------------

    async def stream_response(
        self, session_id: str, user_message: str
    ) -> AsyncGenerator[str, None]:
        """Yield SSE-formatted strings: text chunks, tool signals, done/error."""
        history = self._get_session_history(session_id)
        history.append({"role": "user", "content": user_message})

        def sse(payload: dict) -> str:
            return f"data: {json.dumps(payload)}\n\n"

        try:
            while True:
                response_content = []
                stop_reason = None

                # ---- Stream a single turn -----------------------------
                async with self.client.messages.stream(
                    model="claude-opus-4-6",
                    max_tokens=8096,
                    system=SYSTEM_PROMPT,
                    messages=history,
                    tools=TOOLS,
                ) as stream:
                    async for event in stream:
                        etype = getattr(event, "type", None)

                        if etype == "content_block_start":
                            cb = getattr(event, "content_block", None)
                            if cb and getattr(cb, "type", None) == "tool_use":
                                yield sse({"type": "tool", "name": cb.name})

                        elif etype == "content_block_delta":
                            delta = getattr(event, "delta", None)
                            if delta:
                                dtype = getattr(delta, "type", None)
                                if dtype == "text_delta":
                                    yield sse({"type": "text", "chunk": delta.text})
                                # thinking_delta → skip (internal reasoning only)

                    final_msg = await stream.get_final_message()
                    stop_reason = final_msg.stop_reason
                    response_content = final_msg.content

                # ---- Store assistant turn in history -----------------------
                # Serialize only the fields the API accepts (model_dump() includes
                # internal fields like parsed_output that cause 400 errors).
                history.append({
                    "role": "assistant",
                    "content": [_serialize_block(b) for b in response_content],
                })

                # ---- No tool call → done -----------------------------------
                if stop_reason != "tool_use":
                    break

                # ---- Execute tool calls ------------------------------------
                tool_results = []
                for block in response_content:
                    if getattr(block, "type", None) != "tool_use":
                        continue
                    handler = TOOL_HANDLERS.get(block.name)
                    try:
                        if handler:
                            result = await handler(**block.input)
                        else:
                            result = f"Unknown tool: {block.name}"
                    except Exception as exc:
                        result = f"Tool '{block.name}' error: {exc}"

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })

                history.append({"role": "user", "content": tool_results})

        except Exception as exc:
            yield sse({"type": "error", "message": str(exc)})

        yield sse({"type": "done"})
