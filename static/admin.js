/* ── Auth helpers ────────────────────────────────────────── */
function getAuthHeader() {
  const stored = sessionStorage.getItem("adminAuth");
  return stored ? { "Authorization": "Basic " + stored } : {};
}

function saveCredentials(user, pass) {
  sessionStorage.setItem("adminAuth", btoa(user + ":" + pass));
}

function clearCredentials() {
  sessionStorage.removeItem("adminAuth");
}

/* ── State ───────────────────────────────────────────────── */
let allAppointments = [];
let pendingCancelId = null;
let refreshTimer    = null;

/* ── Boot ────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("adminAuth")) {
    showDashboard();
    loadAppointments();
  }

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  document.getElementById("refreshBtn").addEventListener("click", () => loadAppointments());

  // Filters
  document.getElementById("filterDate").addEventListener("change", renderTable);
  document.getElementById("filterStatus").addEventListener("change", renderTable);
  document.getElementById("filterSearch").addEventListener("input", renderTable);
  document.getElementById("clearFilters").addEventListener("click", clearFilters);

  // Cancel modal
  document.getElementById("cancelConfirmBtn").addEventListener("click", confirmCancel);
  document.getElementById("cancelAbortBtn").addEventListener("click", closeModal);
  document.getElementById("cancelBackdrop").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach(btn =>
    btn.addEventListener("click", () => switchTab(btn.dataset.tab))
  );

  // Settings save buttons
  document.getElementById("saveInfoBtn").addEventListener("click", saveInfo);
  document.getElementById("saveHoursBtn").addEventListener("click", saveHours);
  document.getElementById("saveServicesBtn").addEventListener("click", saveServices);
  document.getElementById("cpSaveBtn2").addEventListener("click", submitChangePassword2);
});

/* ── Login ───────────────────────────────────────────────── */
async function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value;
  const errEl = document.getElementById("loginError");

  saveCredentials(user, pass);

  try {
    const res = await fetch("/api/appointments", { headers: getAuthHeader() });
    if (res.status === 401) {
      clearCredentials();
      errEl.textContent = "Invalid username or password.";
      errEl.hidden = false;
      return;
    }
    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    errEl.hidden = true;
    const data = await res.json();
    allAppointments = data;
    showDashboard();
    updateStats();
    renderTable();
    startAutoRefresh();
  } catch (err) {
    clearCredentials();
    errEl.textContent = "Login failed: " + err.message;
    errEl.hidden = false;
  }
}

function handleLogout() {
  clearCredentials();
  clearInterval(refreshTimer);
  document.getElementById("dashboard").hidden = true;
  document.getElementById("loginOverlay").hidden = false;
  document.getElementById("loginPass").value = "";
}

/* ── Dashboard visibility ────────────────────────────────── */
function showDashboard() {
  document.getElementById("loginOverlay").hidden = true;
  document.getElementById("dashboard").hidden = false;
  startAutoRefresh();
}

/* ── Tab switching ───────────────────────────────────────── */
function switchTab(name) {
  document.querySelectorAll(".tab-pane").forEach(p => p.hidden = true);
  document.querySelectorAll(".tab-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === name)
  );
  document.getElementById("tab-" + name).hidden = false;
  if (name === "settings") loadSettings();
}

/* ── Load appointments from API ──────────────────────────── */
async function loadAppointments() {
  const res = await fetch("/api/appointments", { headers: getAuthHeader() });
  if (res.status === 401) { handleLogout(); return; }
  allAppointments = await res.json();
  updateStats();
  renderTable();
  document.getElementById("lastRefresh").textContent =
    "Last updated: " + new Date().toLocaleTimeString();
}

/* ── Stats ───────────────────────────────────────────────── */
function updateStats() {
  const today = new Date().toISOString().slice(0, 10);
  const todayRows = allAppointments.filter(a => a.date === today);
  const confirmed = allAppointments.filter(a => a.status === "confirmed").length;
  const cancelled = allAppointments.filter(a => a.status === "cancelled").length;

  document.getElementById("statToday").textContent     = todayRows.length;
  document.getElementById("statConfirmed").textContent = confirmed;
  document.getElementById("statCancelled").textContent = cancelled;
  document.getElementById("statTotal").textContent     = allAppointments.length;
}

/* ── Table rendering ─────────────────────────────────────── */
function getFilters() {
  return {
    date:   document.getElementById("filterDate").value,
    status: document.getElementById("filterStatus").value,
    search: document.getElementById("filterSearch").value.toLowerCase().trim(),
  };
}

function renderTable() {
  const { date, status, search } = getFilters();
  const tbody = document.getElementById("aptTableBody");

  let rows = allAppointments.filter(a => {
    if (date   && a.date !== date) return false;
    if (status && a.status !== status) return false;
    if (search && !a.patient_name.toLowerCase().includes(search)) return false;
    return true;
  });

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No appointments found.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(a => `
    <tr>
      <td>${a.id}</td>
      <td><strong>${esc(a.patient_name)}</strong></td>
      <td>${esc(a.phone)}</td>
      <td>${esc(formatService(a.service))}</td>
      <td>${formatDate(a.date)}</td>
      <td>${formatTime(a.time)}</td>
      <td><span class="badge badge-${a.status}">${a.status}</span></td>
      <td>
        ${a.status === "confirmed"
          ? `<button class="btn-cancel-row" onclick="openCancelModal(${a.id}, '${esc(a.patient_name)}', '${a.date}', '${a.time}')">Cancel</button>`
          : "—"}
      </td>
    </tr>
  `).join("");
}

function clearFilters() {
  document.getElementById("filterDate").value   = "";
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterSearch").value = "";
  renderTable();
}

/* ── Cancel modal ────────────────────────────────────────── */
function openCancelModal(id, name, date, time) {
  pendingCancelId = id;
  document.getElementById("cancelDesc").textContent =
    `Cancel appointment for ${name} on ${formatDate(date)} at ${formatTime(time)}?`;
  document.getElementById("cancelReason").value = "";
  document.getElementById("cancelBackdrop").hidden = false;
}

function closeModal() {
  pendingCancelId = null;
  document.getElementById("cancelBackdrop").hidden = true;
}

async function confirmCancel() {
  if (!pendingCancelId) return;
  const reason = document.getElementById("cancelReason").value.trim() || "Cancelled by staff";
  const res = await fetch(`/api/appointments/${pendingCancelId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ reason }),
  });
  closeModal();
  if (res.ok) {
    await loadAppointments();
  } else {
    alert("Failed to cancel appointment. Please try again.");
  }
}

/* ── Auto-refresh ────────────────────────────────────────── */
function startAutoRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(loadAppointments, 60_000);
}

/* ── Formatters ──────────────────────────────────────────── */
function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return new Date(y, m - 1, day).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

const SERVICE_NAMES = {
  cleaning:   "Teeth Cleaning",
  checkup:    "Dental Check-up",
  filling:    "Dental Filling",
  extraction: "Tooth Extraction",
  whitening:  "Teeth Whitening",
  emergency:  "Emergency Visit",
};

function formatService(s) {
  return SERVICE_NAMES[s] || s;
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Settings: load ──────────────────────────────────────── */
async function loadSettings() {
  const res = await fetch("/api/settings", { headers: getAuthHeader() });
  if (res.status === 401) { handleLogout(); return; }
  const { info, hours, services } = await res.json();

  // Clinic info
  document.getElementById("cpName").value    = info.name    || "";
  document.getElementById("cpAddress").value = info.address || "";
  document.getElementById("cpPhone").value   = info.phone   || "";
  document.getElementById("cpEmail").value   = info.email   || "";

  // Hours
  ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].forEach(day => {
    const el = document.getElementById("hours-" + day);
    if (el) el.value = hours[day] || "";
  });

  // Services
  ["cleaning","checkup","filling","extraction","whitening","emergency"].forEach(key => {
    const svc = services[key] || {};
    const nameEl  = document.getElementById("svc-" + key + "-name");
    const durEl   = document.getElementById("svc-" + key + "-duration");
    const priceEl = document.getElementById("svc-" + key + "-price");
    if (nameEl)  nameEl.value  = svc.name         || "";
    if (durEl)   durEl.value   = svc.duration_min  != null ? svc.duration_min : "";
    if (priceEl) priceEl.value = svc.price         || "";
  });
}

/* ── Settings: save helpers ──────────────────────────────── */
function showFeedback(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 2000);
}

async function saveInfo() {
  const info = {
    name:    document.getElementById("cpName").value.trim(),
    address: document.getElementById("cpAddress").value.trim(),
    phone:   document.getElementById("cpPhone").value.trim(),
    email:   document.getElementById("cpEmail").value.trim(),
  };
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ info }),
  });
  if (res.status === 401) { handleLogout(); return; }
  if (res.ok) showFeedback("infoFeedback");
}

async function saveHours() {
  const hours = {};
  ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].forEach(day => {
    const el = document.getElementById("hours-" + day);
    if (el) hours[day] = el.value.trim();
  });
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ hours }),
  });
  if (res.status === 401) { handleLogout(); return; }
  if (res.ok) showFeedback("hoursFeedback");
}

async function saveServices() {
  const services = {};
  ["cleaning","checkup","filling","extraction","whitening","emergency"].forEach(key => {
    const name  = document.getElementById("svc-" + key + "-name")?.value.trim()  || "";
    const dur   = parseInt(document.getElementById("svc-" + key + "-duration")?.value || "0", 10);
    const price = document.getElementById("svc-" + key + "-price")?.value.trim() || "";
    services[key] = { name, duration_min: dur, price };
  });
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ services }),
  });
  if (res.status === 401) { handleLogout(); return; }
  if (res.ok) showFeedback("svcFeedback");
}

/* ── Change Password (inline in Settings tab) ────────────── */
async function submitChangePassword2() {
  const current = document.getElementById("cpCurrent").value;
  const newPass = document.getElementById("cpNew").value;
  const confirm = document.getElementById("cpConfirm").value;
  const errEl   = document.getElementById("cpError2");
  const okEl    = document.getElementById("cpSuccess2");

  errEl.hidden = true;
  okEl.hidden  = true;

  if (!current) {
    errEl.textContent = "Please enter your current password.";
    errEl.hidden = false;
    return;
  }
  if (newPass.length < 8) {
    errEl.textContent = "New password must be at least 8 characters.";
    errEl.hidden = false;
    return;
  }
  if (newPass !== confirm) {
    errEl.textContent = "New passwords do not match.";
    errEl.hidden = false;
    return;
  }

  const storedUser = atob(sessionStorage.getItem("adminAuth") || "").split(":")[0] || "admin";
  const tempAuth = "Basic " + btoa(storedUser + ":" + current);

  try {
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": tempAuth },
      body: JSON.stringify({ new_password: newPass, confirm_password: confirm }),
    });

    if (res.status === 401) {
      errEl.textContent = "Current password is incorrect.";
      errEl.hidden = false;
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      errEl.textContent = data.detail || "Failed to change password.";
      errEl.hidden = false;
      return;
    }

    saveCredentials(storedUser, newPass);
    okEl.hidden = false;
    document.getElementById("cpCurrent").value = "";
    document.getElementById("cpNew").value     = "";
    document.getElementById("cpConfirm").value = "";
    setTimeout(() => { okEl.hidden = true; }, 3000);
  } catch (err) {
    errEl.textContent = "Network error: " + err.message;
    errEl.hidden = false;
  }
}
