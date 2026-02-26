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

  // Change Password modal
  document.getElementById("changePasswordBtn").addEventListener("click", openChangePasswordModal);
  document.getElementById("cpSaveBtn").addEventListener("click", submitChangePassword);
  document.getElementById("cpCancelBtn").addEventListener("click", closeChangePasswordModal);
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
  const todayRows    = allAppointments.filter(a => a.date === today);
  const confirmed    = allAppointments.filter(a => a.status === "confirmed").length;
  const cancelled    = allAppointments.filter(a => a.status === "cancelled").length;

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

// Close modal on backdrop click
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cancelBackdrop").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById("changePasswordBackdrop").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeChangePasswordModal();
  });
});

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

/* ── Change Password modal ───────────────────────────────── */
function openChangePasswordModal() {
  document.getElementById("cpCurrent").value = "";
  document.getElementById("cpNew").value = "";
  document.getElementById("cpConfirm").value = "";
  document.getElementById("cpError").hidden = true;
  document.getElementById("cpSuccess").hidden = true;
  document.getElementById("changePasswordBackdrop").hidden = false;
  document.getElementById("cpCurrent").focus();
}

function closeChangePasswordModal() {
  document.getElementById("changePasswordBackdrop").hidden = true;
}

async function submitChangePassword() {
  const current = document.getElementById("cpCurrent").value;
  const newPass  = document.getElementById("cpNew").value;
  const confirm  = document.getElementById("cpConfirm").value;
  const errEl    = document.getElementById("cpError");
  const okEl     = document.getElementById("cpSuccess");

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

  // Build auth header using current stored credentials but override password with what user typed
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

    // Update stored credentials so subsequent API calls use the new password
    saveCredentials(storedUser, newPass);
    okEl.hidden = false;
    setTimeout(closeChangePasswordModal, 1500);
  } catch (err) {
    errEl.textContent = "Network error: " + err.message;
    errEl.hidden = false;
  }
}
