/* ── SVG icon strings ────────────────────────────────────── */
const SPEAKER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
</svg>`;

const MUTED_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <line x1="23" y1="9" x2="17" y2="15"/>
  <line x1="17" y1="9" x2="23" y2="15"/>
</svg>`;

/* ── State ───────────────────────────────────────────────── */
let sessionId        = sessionStorage.getItem("sessionId");
let isStreaming      = false;
let isListening      = false;
let voiceOutputEnabled = true;
let selectedLang     = "en";
let mediaRecorder    = null;
let audioChunks      = [];
let activeStream     = null;

/* ── Boot ────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  if (!sessionId) {
    const res = await fetch("/session");
    const data = await res.json();
    sessionId = data.session_id;
    sessionStorage.setItem("sessionId", sessionId);
  }

  // Init mute button with speaker icon
  document.getElementById("muteBtn").innerHTML = SPEAKER_SVG;

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
  const input      = document.getElementById("messageInput");
  const btn        = document.getElementById("sendBtn");
  const micBtn     = document.getElementById("micBtn");
  const muteBtn    = document.getElementById("muteBtn");
  const langSelect = document.getElementById("langSelect");

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

  // Mic button — toggle recording
  micBtn.addEventListener("click", () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  });

  // Mute button — toggle TTS
  muteBtn.addEventListener("click", () => {
    voiceOutputEnabled = !voiceOutputEnabled;
    muteBtn.classList.toggle("muted", !voiceOutputEnabled);
    muteBtn.setAttribute(
      "aria-label",
      voiceOutputEnabled ? "Mute voice output" : "Unmute voice output"
    );
    muteBtn.innerHTML = voiceOutputEnabled ? SPEAKER_SVG : MUTED_SVG;
    if (!voiceOutputEnabled) speechSynthesis.cancel();
  });

  // Language selector
  langSelect.addEventListener("change", () => {
    selectedLang = langSelect.value;
  });
}

/* ── Voice recording ─────────────────────────────────────── */
async function startListening() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    activeStream = stream;
    audioChunks  = [];

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener("dataavailable", (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    });
    mediaRecorder.addEventListener("stop", () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      transcribeAudio(blob);
    });

    mediaRecorder.start();
    isListening = true;
    document.getElementById("micBtn").classList.add("recording");
    showVoiceBar("Listening…");
  } catch (err) {
    console.error("Mic error:", err);
    hideVoiceBar();
    alert("Microphone access denied or unavailable.");
  }
}

function stopListening() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
  }
  isListening = false;
  document.getElementById("micBtn").classList.remove("recording");
}

async function transcribeAudio(blob) {
  showVoiceBar("Processing…");
  try {
    const form = new FormData();
    form.append("audio", blob, "recording.webm");
    form.append("language", selectedLang);

    const res = await fetch("/transcribe", { method: "POST", body: form });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { text } = await res.json();
    hideVoiceBar();

    if (text && text.trim()) {
      document.getElementById("messageInput").value = text;
      sendMessage();
    }
  } catch (err) {
    hideVoiceBar();
    console.error("Transcription error:", err);
  }
}

/* ── TTS ─────────────────────────────────────────────────── */
function speakText(text) {
  if (!voiceOutputEnabled || !text.trim()) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang  = selectedLang === "en" ? "en-US" : selectedLang;
  utter.rate  = 0.95;
  speechSynthesis.speak(utter);
}

/* ── Voice bar ───────────────────────────────────────────── */
function showVoiceBar(msg) {
  document.getElementById("voiceBarText").textContent = msg;
  document.getElementById("voiceBar").classList.remove("hidden");
}

function hideVoiceBar() {
  document.getElementById("voiceBar").classList.add("hidden");
}

/* ── Send ────────────────────────────────────────────────── */
async function sendMessage() {
  if (isStreaming) return;

  // Stop any ongoing speech when user sends a new message
  speechSynthesis.cancel();

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

  // Bot bubble filled by stream
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
          speakText(accText);
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
  const row  = msgRow("bot");
  const dots = document.createElement("div");
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
  document.getElementById("micBtn").disabled       = disabled;
}
