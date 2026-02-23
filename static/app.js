/* ── State ───────────────────────────────────────────────── */
let sessionId = sessionStorage.getItem("sessionId");
let isStreaming = false;

/* ── Boot ────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  if (!sessionId) {
    const res = await fetch("/session");
    const data = await res.json();
    sessionId = data.session_id;
    sessionStorage.setItem("sessionId", sessionId);
  }

  // Welcome message
  appendBotBubble(
    "Hello! I'm Sarah, the virtual receptionist for Bright Smile Dental. 😊\n\n" +
    "I can help you with:\n" +
    "• Checking appointment availability\n" +
    "• Booking or cancelling appointments\n" +
    "• Clinic hours, services & policies\n\n" +
    "How can I assist you today?"
  );

  setupInput();
});

/* ── Input setup ─────────────────────────────────────────── */
function setupInput() {
  const input = document.getElementById("messageInput");
  const btn   = document.getElementById("sendBtn");

  // Auto-grow textarea
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 160) + "px";
  });

  // Enter to send, Shift+Enter for newline
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  btn.addEventListener("click", sendMessage);
}

/* ── Send ────────────────────────────────────────────────── */
async function sendMessage() {
  if (isStreaming) return;

  const input = document.getElementById("messageInput");
  const text  = input.value.trim();
  if (!text) return;

  // Show user bubble
  appendUserBubble(text);
  input.value = "";
  input.style.height = "auto";

  // Lock UI
  isStreaming = true;
  setInputDisabled(true);

  // Show typing indicator
  const typingRow = appendTypingIndicator();

  // Create bot bubble (will be filled by stream)
  let botBubble = null;
  let accText   = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        let payload;
        try { payload = JSON.parse(line.slice(6)); }
        catch { continue; }

        if (payload.type === "text") {
          // Remove typing indicator on first text chunk
          if (typingRow && typingRow.parentNode) typingRow.remove();
          if (!botBubble) botBubble = createBotBubble();

          accText += payload.chunk;
          botBubble.textContent = accText;
          scrollToBottom();

        } else if (payload.type === "tool") {
          showToolBar(payload.name);

        } else if (payload.type === "error") {
          if (typingRow && typingRow.parentNode) typingRow.remove();
          const b = createBotBubble();
          b.textContent = "⚠️ " + payload.message;
          b.classList.add("error");
          hideToolBar();

        } else if (payload.type === "done") {
          hideToolBar();
          if (typingRow && typingRow.parentNode) typingRow.remove();
        }
      }
    }

  } catch (err) {
    if (typingRow && typingRow.parentNode) typingRow.remove();
    const b = createBotBubble();
    b.textContent = "⚠️ Connection error: " + err.message;
    b.classList.add("error");
    hideToolBar();
    console.error(err);
  }

  isStreaming = false;
  setInputDisabled(false);
  document.getElementById("messageInput").focus();
  scrollToBottom();
}

/* ── DOM helpers ─────────────────────────────────────────── */
function msgRow(side) {
  const row = document.createElement("div");
  row.className = `msg-row ${side}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = side === "bot" ? "🦷" : "🙂";
  row.appendChild(avatar);
  return row;
}

function nowStr() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function appendUserBubble(text) {
  const row    = msgRow("user");
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  const time = document.createElement("span");
  time.className = "msg-time";
  time.textContent = nowStr();
  row.appendChild(time);
  row.appendChild(bubble);
  document.getElementById("chatMessages").appendChild(row);
  scrollToBottom();
}

function appendBotBubble(text) {
  const bubble = createBotBubble();
  bubble.textContent = text;
  scrollToBottom();
}

function createBotBubble() {
  const row    = msgRow("bot");
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const time = document.createElement("span");
  time.className = "msg-time";
  time.textContent = nowStr();
  row.appendChild(bubble);
  row.appendChild(time);
  document.getElementById("chatMessages").appendChild(row);
  return bubble;
}

function appendTypingIndicator() {
  const row    = msgRow("bot");
  const dots   = document.createElement("div");
  dots.className = "bubble typing-dots";
  dots.innerHTML = "<span></span><span></span><span></span>";
  row.appendChild(dots);
  document.getElementById("chatMessages").appendChild(row);
  scrollToBottom();
  return row;
}

function scrollToBottom() {
  const el = document.getElementById("chatMessages");
  el.scrollTop = el.scrollHeight;
}

/* ── Tool bar ────────────────────────────────────────────── */
const TOOL_LABELS = {
  check_availability:       "Checking availability…",
  schedule_appointment:     "Booking appointment…",
  cancel_appointment:       "Cancelling appointment…",
  get_patient_appointments: "Looking up appointments…",
  get_clinic_info:          "Fetching clinic info…",
};

function showToolBar(toolName) {
  const bar  = document.getElementById("toolBar");
  const text = document.getElementById("toolBarText");
  text.textContent = TOOL_LABELS[toolName] || "Processing…";
  bar.hidden = false;
}

function hideToolBar() {
  document.getElementById("toolBar").hidden = true;
}

/* ── Input state ─────────────────────────────────────────── */
function setInputDisabled(disabled) {
  document.getElementById("messageInput").disabled = disabled;
  document.getElementById("sendBtn").disabled      = disabled;
}
