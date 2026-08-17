/* -------------------------------------------------------------------
   TwinCare AI — Sof O'zbek Tilidagi Interaktiv Frontend Kontrolleri
   ------------------------------------------------------------------- */

let currentActiveRole = 'doctor';
let currentSelectedPatientId = 'TWIN-UZ-9042';
let currentUserSession = null;
let uzbekistanRegionsData = [];

let biomarkerChartInstance = null;
let simulationChartInstance = null;
let isRecordingConsultation = false;
let transcriptTextBuffer = "";

document.addEventListener('DOMContentLoaded', async () => {
  setAppLanguage('uz');

  const savedUser = localStorage.getItem('twincare_user');
  if (savedUser) {
    try {
      currentUserSession = JSON.parse(savedUser);
    } catch (e) {
      currentUserSession = null;
    }
  }

  if (!currentUserSession) {
    openAuthModal();
    currentUserSession = { username: 'botir_toshmatov', firstName: 'Botir', lastName: 'Toshmatov', role: 'doctor' };
  }

  try {
    const regRes = await API.getPharmacyRegions();
    if (regRes.success) {
      uzbekistanRegionsData = regRes.regions || [];
    }
  } catch (e) {
    console.error('Region load error:', e);
  }

  await applyUserSession(currentUserSession);
  initGlobalSearch();
});

/* TOAST NOTIFIKATSIYA TIZIMI */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastNotificationContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastNotificationContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  const icon = type === 'error' ? '<i class="fa-solid fa-circle-xmark" style="color: var(--accent-rose);"></i>' :
               type === 'warning' ? '<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-amber);"></i>' :
               '<i class="fa-solid fa-circle-check" style="color: var(--accent-emerald);"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fade-out-toast 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 3500);
  }, 3500);
}

/* KIRISH VA RO'YXATDAN O'TISH MODALI */
function openAuthModal() {
  const modal = document.getElementById('authModal');
  const errBox = document.getElementById('loginAuthError');
  if (errBox) errBox.style.display = 'none';
  if (modal) modal.classList.add('active');
}

/* MENING PROFILIM VA SOZLAMALAR MODALI */
function openUserProfileModal() {
  const modal = document.getElementById('userProfileSettingsModal');
  const uInp = document.getElementById('userUsernameInput');
  const fnInp = document.getElementById('userFirstNameInput');
  const lnInp = document.getElementById('userLastNameInput');
  const tag = document.getElementById('modalRoleDisplayTag');

  if (currentUserSession) {
    if (uInp) uInp.value = currentUserSession.username || 'botir_toshmatov';
    if (fnInp) fnInp.value = currentUserSession.firstName || 'Botir';
    if (lnInp) lnInp.value = currentUserSession.lastName || 'Toshmatov';
    if (tag) tag.textContent = getRoleDisplayName(currentUserSession.role);
  }

  if (modal) modal.classList.add('active');
}

function handleAvatarFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    document.getElementById('avatarFileNameDisplay').textContent = file.name;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const container = document.getElementById('modalAvatarPreviewContainer');
      if (container) {
        container.innerHTML = `<img src="${evt.target.result}" style="width: 54px; height: 54px; border-radius: 9999px; object-fit: cover; border: 2px solid var(--primary-teal);" />`;
      }
      const headerIcon = document.getElementById('headerAvatarContainer');
      if (headerIcon) {
        const usernameBadge = document.getElementById('sessionUsernameBadge');
        const badgeHtml = usernameBadge ? usernameBadge.outerHTML : '';
        headerIcon.innerHTML = `<img src="${evt.target.result}" style="width: 40px; height: 40px; border-radius: 9999px; object-fit: cover; border: 2px solid var(--primary-teal);" /> ${badgeHtml}`;
      }
    };
    reader.readAsDataURL(file);
  }
}

async function saveUserProfile(e) {
  e.preventDefault();
  const username = document.getElementById('userUsernameInput').value.trim().replace(/^@/, '');
  const firstName = document.getElementById('userFirstNameInput').value.trim();
  const lastName = document.getElementById('userLastNameInput').value.trim();

  if (currentUserSession) {
    currentUserSession.username = username;
    currentUserSession.firstName = firstName;
    currentUserSession.lastName = lastName;
    localStorage.setItem('twincare_user', JSON.stringify(currentUserSession));

    await API.updateProfile({ username, firstName, lastName });
    await applyUserSession(currentUserSession);
  }

  closeModal('userProfileSettingsModal');
  showToast("Profil ma'lumotlari muvaffaqiyatli saqlandi!", 'info');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('registerForm');
  const loginBtn = document.getElementById('authLoginTabBtn');
  const regBtn = document.getElementById('authRegisterTabBtn');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    loginBtn.style.background = 'var(--primary-teal)'; loginBtn.style.color = '#fff';
    regBtn.style.background = 'transparent'; regBtn.style.color = 'var(--text-muted)';
  } else {
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
    regBtn.style.background = 'var(--accent-emerald)'; regBtn.style.color = '#fff';
    loginBtn.style.background = 'transparent'; loginBtn.style.color = 'var(--text-muted)';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const uInp = document.getElementById('loginUsername').value.trim();
  const pInp = document.getElementById('loginPassword').value.trim();
  const errBox = document.getElementById('loginAuthError');

  try {
    const res = await API.login(uInp, pInp);
    if (res.success) {
      currentUserSession = res.user;
      localStorage.setItem('twincare_user', JSON.stringify(res.user));
      closeModal('authModal');
      await applyUserSession(res.user);
      showToast(`Xush kelibsiz, ${res.user.firstName}!`, 'info');
    } else {
      if (errBox) {
        errBox.textContent = res.message || "Login yoki parol xato!";
        errBox.style.display = 'block';
      }
    }
  } catch (err) {
    showToast("Backend server bilan aloqa xatoligi!", 'error');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const firstName = document.getElementById('regFirstName').value.trim();
  const lastName = document.getElementById('regLastName').value.trim();
  const role = document.getElementById('regRole').value;
  const password = document.getElementById('regPassword').value.trim();

  try {
    const res = await API.register({ username, firstName, lastName, role, password });
    if (res.success) {
      currentUserSession = res.user;
      localStorage.setItem('twincare_user', JSON.stringify(res.user));
      closeModal('authModal');
      await applyUserSession(res.user);
      showToast(`Ro'yxatdan o'tdingiz! Rolingiz: ${getRoleDisplayName(role)}`, 'info');
    } else {
      showToast(res.message || "Ro'yxatdan o'tishda xatolik!", 'error');
    }
  } catch (err) {
    showToast("Backend xatoligi!", 'error');
  }
}

function handleLogout() {
  localStorage.removeItem('twincare_user');
  currentUserSession = null;
  closeModal('userProfileSettingsModal');
  openAuthModal();
  showToast("Tizimdan muvaffaqiyatli chiqdingiz.", 'info');
}

function getRoleDisplayName(role) {
  if (role === 'doctor') return "Shifokor";
  if (role === 'patient') return "Bemor";
  if (role === 'researcher') return "Tadqiqotchi";
  if (role === 'pharmacy') return "Dorixona Egasi";
  if (role === 'admin') return "Boshqaruvchi / Admin";
  return role;
}

async function applyUserSession(user) {
  currentUserSession = user;
  currentActiveRole = user.role;

  const initials = `${user.firstName[0] || 'U'}${user.lastName[0] || 'S'}`.toUpperCase();
  const avatarIcon = document.getElementById('headerAvatarIcon');
  if (avatarIcon) avatarIcon.textContent = initials;

  const badge = document.getElementById('sessionUsernameBadge');
  if (badge) badge.textContent = `@${user.username}`;

  const footerRole = document.getElementById('footerRoleLabel');
  if (footerRole) footerRole.textContent = getRoleDisplayName(user.role);

  enforceStrictRoleNavAccess(user.role);

  if (user.role === 'patient') {
    switchTab('digital-twins');
  } else if (user.role === 'doctor') {
    switchTab('patients');
  } else if (user.role === 'researcher') {
    switchTab('research');
  } else if (user.role === 'pharmacy') {
    switchTab('pharmacy');
  } else if (user.role === 'admin') {
    switchTab('dashboard');
  }

  await renderPatientsDirectory();
  await initTwinPatientSelectOptions();
  await loadSelectedPatientTwin(currentSelectedPatientId);
  await renderDoctorsDirectory();
  await renderDedicatedFeedbacks();
  await renderProtocolsList();
  await renderResearchPlatform();
  await renderPharmacyIntelligence();
}

function enforceStrictRoleNavAccess(role) {
  const navItems = document.querySelectorAll('#sidebarNavMenu li, .nav-group li');
  
  navItems.forEach(item => {
    const tabLink = item.querySelector('.nav-link');
    if (!tabLink) return;
    const tab = tabLink.getAttribute('data-tab');

    let visible = false;
    if (role === 'admin') {
      visible = true;
    } else if (role === 'doctor') {
      visible = ['patients', 'digital-twins', 'my-feedbacks', 'ai-assistant'].includes(tab);
    } else if (role === 'patient') {
      visible = ['ai-assistant', 'digital-twins', 'doctors'].includes(tab);
    } else if (role === 'pharmacy') {
      visible = ['pharmacy'].includes(tab);
    } else if (role === 'researcher') {
      visible = ['knowledge', 'research'].includes(tab);
    }

    item.style.display = visible ? 'block' : 'none';
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) targetPane.classList.add('active');

  const targetNav = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
  if (targetNav) targetNav.classList.add('active');

  if (tabId === 'digital-twins' && currentSelectedPatientId) {
    loadSelectedPatientTwin(currentSelectedPatientId);
  }
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = link.getAttribute('data-tab');
    if (tab) switchTab(tab);
  });
});

/* PATIENTS DIRECTORY */
async function renderPatientsDirectory() {
  const container = document.getElementById('patientsDirectoryGrid');
  if (!container) return;

  try {
    const params = { role: currentActiveRole, username: currentUserSession ? currentUserSession.username : '' };
    if (currentUserSession && currentUserSession.docId) params.doctorId = currentUserSession.docId;

    const res = await API.getPatients(params);
    const patients = res.patients || [];

    if (patients.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Sizga biriktirilgan bemorlar topilmadi.</div>`;
      return;
    }

    container.innerHTML = patients.map(p => `
      <div class="card">
        <div class="card-header" style="margin-bottom: 8px;">
          <div>
            <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--primary-teal);">${p.fullName}</h3>
            <span class="badge badge-teal">${p.id}</span>
            <span class="badge badge-emerald" style="margin-left: 4px;">${p.healthStatus}</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="selectAndSwitchTwin('${p.id}')">Digital Twin Maydoni</button>
        </div>

        <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
          <div><strong>Yosh va Jinsi:</strong> ${p.age} yosh, ${p.gender}</div>
          <div><strong>Hududi:</strong> ${p.region}</div>
          <div><strong>Kasbi:</strong> ${p.occupation}</div>
          <div><strong>Mas'ul Shifokori:</strong> ${p.assignedDoctorName || 'Dr. Botir Toshmatov'}</div>
        </div>

        <div style="background: #F0F9FF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px; margin-bottom: 10px;">
          <div style="font-weight: 700; font-size: 0.78rem; color: var(--accent-amber); margin-bottom: 4px;"><i class="fa-solid fa-notes-medical"></i> Surunkali Kasalliklar:</div>
          <div style="font-size: 0.78rem;">${p.chronicDiseases.map(d => `${d.name} (${d.icd10})`).join(', ') || 'Noma\'lum'}</div>
        </div>

        <div style="background: #F0F9FF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px;">
          <div style="font-weight: 700; font-size: 0.78rem; color: var(--primary-teal); margin-bottom: 4px;"><i class="fa-solid fa-pills"></i> Qabul Qilayotgan Dorilari Tarixi:</div>
          <div style="font-size: 0.78rem;">${p.medicationHistory.map(m => `${m.name} (${m.dose})`).join(', ') || 'Dori biriktirilmagan'}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Patients Directory error:', e);
  }
}

function selectAndSwitchTwin(patientId) {
  currentSelectedPatientId = patientId;
  const sel = document.getElementById('twinPatientSelect');
  if (sel) sel.value = patientId;
  switchTab('digital-twins');
  loadSelectedPatientTwin(patientId);
}

/* DIGITAL TWIN MAYDONI */
async function initTwinPatientSelectOptions() {
  const sel = document.getElementById('twinPatientSelect');
  if (!sel) return;

  const res = await API.getPatients({ role: currentActiveRole, username: currentUserSession ? currentUserSession.username : '' });
  const patients = res.patients || [];

  sel.innerHTML = patients.map(p => `<option value="${p.id}">${p.fullName} (${p.id})</option>`).join('');
  if (patients.length > 0 && !currentSelectedPatientId) {
    currentSelectedPatientId = patients[0].id;
  }
}

async function loadSelectedPatientTwin(patientId) {
  currentSelectedPatientId = patientId;
  const res = await API.getPatientById(patientId);
  if (!res.success || !res.patient) return;

  const p = res.patient;

  const headerBox = document.getElementById('patientTwinHeader');
  if (headerBox) {
    headerBox.innerHTML = `
      <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%); border-color: var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
              <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--primary-teal);">${p.fullName}</h2>
              <span class="badge badge-teal">${p.id}</span>
              <span class="badge badge-emerald">${p.healthStatus}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              ${p.age} yosh • ${p.gender} • ${p.region} • Mas'ul shifokor: <strong style="color: var(--primary-teal);">${p.assignedDoctorName}</strong>
            </div>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${currentActiveRole === 'doctor' || currentActiveRole === 'admin' ? `
              <button class="btn btn-primary btn-sm" onclick="open17SectionAddingTwinModal()"><i class="fa-solid fa-plus"></i> Yangi Twin Qo'shish (17-Bo'lim)</button>
              <button class="btn btn-emerald btn-sm" onclick="openTreatmentTrialModal()"><i class="fa-solid fa-flask-vial"></i> Muolajani Sinash</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  renderTwinDiseaseCards(p);
  renderMedicationTimeline(p);
  renderDailyReminders(p);
  renderBiomarkerChart(p, 'HbA1c');
}

function renderTwinDiseaseCards(patient) {
  const container = document.getElementById('twinDiseaseCards');
  if (!container) return;

  container.innerHTML = (patient.chronicDiseases || []).map(d => `
    <div style="background: #F0F9FF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <strong style="color: var(--primary-teal); font-size: 0.92rem;">${d.name} (${d.icd10})</strong>
        <span class="badge badge-amber">${d.severity}</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px;">
        <div><strong>Status:</strong> ${d.status}</div>
        <div><strong>Traektoriya:</strong> ${d.progression}</div>
        <div style="grid-column: 1/-1;"><strong>Joriy Davo:</strong> ${d.currentTreatment}</div>
      </div>
    </div>
  `).join('');
}

function renderMedicationTimeline(patient) {
  const container = document.getElementById('medicationTimelineContent');
  if (!container) return;

  container.innerHTML = (patient.medicationHistory || []).map(m => `
    <div style="background: #F0F9FF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <strong style="color: var(--text-main); font-size: 0.9rem;">${m.name} — ${m.dose}</strong>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${m.frequency} • Vaqti: ${m.times} • Boshlangan: ${m.startDate}</div>
      </div>
      <span class="badge badge-emerald">Qabul Intizomi: ${m.adherence}%</span>
    </div>
  `).join('');
}

function renderDailyReminders(patient) {
  const container = document.getElementById('dailyRemindersList');
  if (!container) return;

  container.innerHTML = (patient.dailyAssistantLog || []).map(log => `
    <div style="background: #F0F9FF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-weight: 800; color: var(--primary-teal); font-size: 0.85rem;">${log.time}</span>
        <span style="font-size: 0.85rem; color: var(--text-main);">${log.task}</span>
      </div>
      <span class="badge ${log.status === 'Bajarildi' ? 'badge-emerald' : 'badge-amber'}">${log.status}</span>
    </div>
  `).join('');
}

function renderBiomarkerChart(patient, metric = 'HbA1c') {
  const ctx = document.getElementById('biomarkerChart');
  if (!ctx) return;

  if (biomarkerChartInstance) biomarkerChartInstance.destroy();

  const history = patient.biomarkersHistory || { dates: [], HbA1c: [] };
  const labels = history.dates || ["2024-03", "2024-09", "2025-03", "2025-09", "2026-03", "2026-08"];
  const values = history[metric] || [7.8, 7.6, 7.5];

  const metricLabel = metric === 'HbA1c' ? "Qondagi Qand Darajasi (HbA1c %)" :
                      metric === 'eGFR' ? "Buyrak Filtrlash Qobiliyati (eGFR mL/min)" : "Arterial Qon Bosimi (mmHg)";

  biomarkerChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: metricLabel,
        data: values,
        borderColor: '#0284C7',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        fill: true,
        tension: 0.3,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#0F172A' } } },
      scales: {
        x: { ticks: { color: '#475569' }, grid: { color: '#E2E8F0' } },
        y: { ticks: { color: '#475569' }, grid: { color: '#E2E8F0' } }
      }
    }
  });
}

function changeBiomarkerChartMetric(metric) {
  API.getPatientById(currentSelectedPatientId).then(res => {
    if (res.patient) renderBiomarkerChart(res.patient, metric);
  });
}

/* "MUOLAJANI SINASH" TREATMENT TRIAL */
function openTreatmentTrialModal() {
  let modal = document.getElementById('treatmentTrialModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'treatmentTrialModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" onclick="closeModal('treatmentTrialModal')"><i class="fa-solid fa-xmark"></i></button>
      <h2 style="margin-bottom: 12px; color: var(--primary-teal);"><i class="fa-solid fa-flask-vial"></i> Muolajani Sinash</h2>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
        Digital Twin modelida berilayotgan yangi dori yoki muolaja samaradorligini va kutilayotgan biologik natijalarni simulyatsiya qiling.
      </p>

      <form id="treatmentTrialForm" onsubmit="submitTreatmentTrial(event)">
        <div class="form-group">
          <label class="form-label">Qaysi dori yoki qanday muolajani qilmoqchisiz?</label>
          <input type="text" id="trialNameInput" class="form-input" placeholder="masalan: Dapagliflozin 10mg + Enalapril dozasini oshirish" required />
        </div>

        <div class="form-group">
          <label class="form-label">Muolaja tafsilotlari va berilish tartibi:</label>
          <textarea id="trialDetailsInput" class="form-textarea" rows="3" placeholder="Muolajaning berilish tartibini va dozasini batafsil tushuntirib bering..." required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Qanaqa natijalar kutilmoqda? (Klinik maqsad):</label>
          <textarea id="trialOutcomeInput" class="form-textarea" rows="2" placeholder="masalan: eGFR pasayishini to'xtatish..." required></textarea>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('treatmentTrialModal')">Bekor qilish</button>
          <button type="submit" class="btn btn-emerald"><i class="fa-solid fa-play"></i> Muolajani Simulyatsiya Qilish</button>
        </div>
      </form>

      <div id="trialLoadingBox" style="display: none; text-align: center; padding: 30px 10px;">
        <i class="fa-solid fa-atom fa-spin" style="font-size: 2.5rem; color: var(--primary-teal); margin-bottom: 16px;"></i>
        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--primary-teal);">Muolaja va Digital Twin biologik algoritmlari hisoblanmoqda...</h4>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Kutib turing (3-4 sekund o'ylash jarayoni)</p>
        
        <div class="progress-bar-container">
          <div id="trialProgressBarFill" class="progress-bar-fill"></div>
        </div>
      </div>

      <div id="trialResultOutcomeBox" style="display: none; margin-top: 20px;"></div>
    </div>
  `;
  modal.classList.add('active');
}

async function submitTreatmentTrial(e) {
  e.preventDefault();
  const treatmentName = document.getElementById('trialNameInput').value.trim();
  const treatmentDetails = document.getElementById('trialDetailsInput').value.trim();
  const expectedOutcome = document.getElementById('trialOutcomeInput').value.trim();

  const form = document.getElementById('treatmentTrialForm');
  const loadingBox = document.getElementById('trialLoadingBox');
  const fill = document.getElementById('trialProgressBarFill');
  const outcomeBox = document.getElementById('trialResultOutcomeBox');

  form.style.display = 'none';
  loadingBox.style.display = 'block';

  setTimeout(() => { fill.style.width = '100%'; }, 50);

  const res = await API.simulateTreatmentTrial(currentSelectedPatientId, { treatmentName, treatmentDetails, expectedOutcome });

  setTimeout(() => {
    loadingBox.style.display = 'none';
    if (res.success && res.result) {
      const r = res.result;

      outcomeBox.innerHTML = `
        <div style="background: #FFF1F2; border: 2px solid #F43F5E; border-radius: var(--radius-md); padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <strong style="color: #E11D48; font-size: 1.1rem;"><i class="fa-solid fa-circle-exclamation"></i> Simulyatsiya Natijasi: 37% Muvaffaqiyat</strong>
            <span class="badge badge-rose" style="font-size: 0.85rem; padding: 6px 12px;">37% Past Samadorlik (Xavf Guruhi)</span>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 14px;">
            <strong>Muvaffaqiyat Ko'rsatkichlari Darajalari:</strong>
            <div style="display: flex; gap: 10px; margin-top: 8px;">
              <div style="flex: 1; background: rgba(244, 63, 94, 0.2); border: 2px solid #F43F5E; color: #BE123C; padding: 8px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; text-align: center;">
                37% Muvaffaqiyat (Qizg'ish) ✔
              </div>
              <div style="flex: 1; background: rgba(245, 158, 11, 0.1); border: 1px solid #F59E0B; color: #B45309; padding: 8px; border-radius: 8px; font-size: 0.8rem; text-align: center; opacity: 0.6;">
                53% Muvaffaqiyat (Sariq)
              </div>
              <div style="flex: 1; background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981; color: #047857; padding: 8px; border-radius: 8px; font-size: 0.8rem; text-align: center; opacity: 0.6;">
                94% Muvaffaqiyat (Yashil)
              </div>
            </div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; font-size: 0.82rem; color: var(--text-muted);">
            <strong style="color: var(--text-main);">Klinik Tahlil va Sababi:</strong>
            <p style="margin-top: 4px;">${r.clinicalReasoning}</p>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
            <button class="btn btn-secondary" onclick="closeModal('treatmentTrialModal')">Yopish</button>
          </div>
        </div>
      `;
      outcomeBox.style.display = 'block';
      showToast("Muolaja simulyatsiyasi yakunlandi! Natija: 37% Muvaffaqiyat", 'warning');
    }
  }, 3500);
}

/* 17-SECTION INTAKE WIZARD MODAL */
function open17SectionAddingTwinModal() {
  let modal = document.getElementById('intake17Modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'intake17Modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 780px;">
      <button class="modal-close" onclick="closeModal('intake17Modal')"><i class="fa-solid fa-xmark"></i></button>
      <h2 style="margin-bottom: 6px; color: var(--primary-teal);"><i class="fa-solid fa-dna"></i> Yangi Raqamli Egizak Yaratish (17-Bo'limli Klinik Shakl)</h2>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">Bemorning to'liq klinik va shaxsiy ma'lumotlarini 17 ta bo'lim bo'yicha kiriting.</p>

      <div class="wizard-nav-container">
        <div class="wizard-nav-item active" onclick="switchWizardSection(1)">1. Shaxsiy</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(2)">2. Tibbiy</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(3)">3. Sog'liq</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(4)">4. Allergiya</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(5)">5. Ko'rsatkichlar</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(6)">6. Tahlillar</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(7)">7. Dorilar</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(8)">8. Turmush Tarzi</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(9)">9. Ruhiy</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(10)">10. Oilaviy</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(11)">11. Genetik</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(12)">12. Kasallik Qo'shimcha</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(13)">13. Hujjatlar</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(14)">14. Oldingi Davo</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(15)">15. Bemor Maqsadi</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(16)">16. Rozilik</div>
        <div class="wizard-nav-item" onclick="switchWizardSection(17)">17. Yakuniy Tekshiruv</div>
      </div>

      <form id="intake17Form" onsubmit="submit17SectionIntakeForm(event)">

        <div id="wizSec-1" class="wizard-section-pane active">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">1. Shaxsiy Ma'lumotlar</h3>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Ism va familiya</label>
              <input type="text" id="intakePersonalName" class="form-input" placeholder="masalan: Malika Ahrorova" required />
            </div>
            <div class="form-group">
              <label class="form-label">Tug'ilgan sana</label>
              <input type="date" id="intakeDob" class="form-input" value="1982-05-14" />
            </div>
            <div class="form-group">
              <label class="form-label">Jinsi</label>
              <select id="intakeGender" class="form-select">
                <option value="Ayol">Ayol</option>
                <option value="Erkak">Erkak</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Telefon raqami</label>
              <input type="text" id="intakePhone" class="form-input" placeholder="+998 90 123 45 67" />
            </div>
            <div class="form-group">
              <label class="form-label">Viloyat</label>
              <input type="text" id="intakeRegion" class="form-input" placeholder="Toshkent shahri" required />
            </div>
            <div class="form-group">
              <label class="form-label">Tuman yoki shahar</label>
              <input type="text" id="intakeDistrict" class="form-input" placeholder="Yunusobod tumani" />
            </div>
            <div class="form-group">
              <label class="form-label">Kasbi</label>
              <input type="text" id="intakeOccupation" class="form-input" placeholder="O'qituvchi" />
            </div>
            <div class="form-group">
              <label class="form-label">Yashash joyi manzili</label>
              <input type="text" id="intakeAddress" class="form-input" placeholder="Yunusobod 4-mavze" />
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(2)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-2" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">2. Tibbiy Ma'lumotlar</h3>
          <div class="form-group">
            <label class="form-label">Avvalgi kasalliklar</label>
            <input type="text" id="intakePastIllnesses" class="form-input" placeholder="Pnevmoniya (2018)" />
          </div>
          <div class="form-group">
            <label class="form-label">Surunkali kasalliklar</label>
            <input type="text" id="intakeChronicIllnesses" class="form-input" placeholder="2-Tip Qandli Diabet, Gipertoniya" />
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Oldingi operatsiyalar</label>
              <input type="text" class="form-input" placeholder="Appendektomiya (2015)" />
            </div>
            <div class="form-group">
              <label class="form-label">Shifoxonaga yotqizilgan holatlar</label>
              <input type="text" class="form-input" placeholder="2022-yilda kardiologiyada 7 kun" />
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(3)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-3" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">3. Hozirgi Sog'liq Holati</h3>
          <div class="form-group">
            <label class="form-label">Asosiy shikoyat</label>
            <input type="text" class="form-input" placeholder="Bosh og'rig'i, tez charchash" />
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Belgilar qachondan boshlangan?</label>
              <input type="text" class="form-input" placeholder="Oxirgi 3 oydan beri" />
            </div>
            <div class="form-group">
              <label class="form-label">Og'riq yoki simptom darajasi (1-10)</label>
              <select class="form-select">
                <option value="3">3 - Yengil bezovtalik</option>
                <option value="6">6 - O'rtacha og'riq</option>
              </select>
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(4)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-4" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">4. Allergiyalar</h3>
          <div class="form-group">
            <label class="form-label">Dori vositalariga allergiya</label>
            <input type="text" id="intakeDrugAllergies" class="form-input" placeholder="Penitsillin" />
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(5)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-5" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">5. Asosiy Ko'rsatkichlar</h3>
          <div class="grid-3">
            <div class="form-group">
              <label class="form-label">Bo'y (sm)</label>
              <input type="number" class="form-input" placeholder="168" />
            </div>
            <div class="form-group">
              <label class="form-label">Vazn (kg)</label>
              <input type="number" class="form-input" placeholder="74" />
            </div>
            <div class="form-group">
              <label class="form-label">Qon bosimi (mmHg)</label>
              <input type="text" id="intakeBpSystolic" class="form-input" placeholder="135/85" />
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(6)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-6" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">6. Laboratoriya Tahlil Natijalari</h3>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">HbA1c %</label>
              <input type="text" id="intakeHba1c" class="form-input" placeholder="7.8 %" />
            </div>
            <div class="form-group">
              <label class="form-label">eGFR (mL/min)</label>
              <input type="text" id="intakeEgfr" class="form-input" placeholder="55 mL/min" />
            </div>
            <div class="form-group">
              <label class="form-label">Kreatinin (mkmol/L)</label>
              <input type="text" id="intakeCreatinine" class="form-input" placeholder="110 mkmol/L" />
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(7)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-7" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">7. Dori-Darmonlar va Terapiya</h3>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Dori nomi</label>
              <input type="text" id="intakeMedName" class="form-input" placeholder="Metformin ER" />
            </div>
            <div class="form-group">
              <label class="form-label">Dozasi</label>
              <input type="text" id="intakeMedDose" class="form-input" placeholder="1000 mg, kuniga 2 mahal" />
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(8)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-8" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">8. Turmush Tarzi</h3>
          <div class="form-group">
            <label class="form-label">Jismoniy faollik va parhez</label>
            <input type="text" class="form-input" placeholder="O'rtacha faollik, kam tuzli parhez" />
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(9)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-9" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">9. Ruhiy va Xulq-atvor Holati</h3>
          <div class="form-group">
            <label class="form-label">Stress darajasi va motivatsiya</label>
            <input type="text" class="form-input" placeholder="O'rtacha stress, yuqori intizom" />
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(10)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-10" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">10. Oilaviy Kasallik Tarixi</h3>
          <div style="font-size: 0.85rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <label><input type="checkbox" checked /> Qandli diabet</label>
            <label><input type="checkbox" checked /> Yuqori qon bosimi (Gipertoniya)</label>
            <label><input type="checkbox" /> Yurak kasalliklari</label>
          </div>
          <button type="button" class="btn btn-primary" style="margin-top: 16px;" onclick="switchWizardSection(11)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-11" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">11. Genetik Ma'lumotlar</h3>
          <div class="form-group">
            <label class="form-label">Genetik tekshiruv xulosasi</label>
            <input type="text" class="form-input" placeholder="Genetik polimorfizm tekshiruvi o'tkazilgan." />
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(12)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-12" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">12. Kasallikka Oid Qo'shimcha Ma'lumotlar (Dinamik Savollar)</h3>
          <div class="form-group">
            <label class="form-label">Bemorning asosiy kasalligi turini tanlang:</label>
            <select id="intakeDiseaseCategorySelect" class="form-select" onchange="toggleDiseaseSpecificFields(this.value)">
              <option value="diabetes">Qandli Diabet (Diabetes Mellitus)</option>
              <option value="heart">Yurak Yetishmovchiligi (Heart Failure)</option>
              <option value="ckd">Surunkali Buyrak Kasalligi (CKD)</option>
            </select>
          </div>

          <div id="diseaseFields-diabetes" style="background: #F0F9FF; padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <strong style="color: var(--primary-teal); font-size: 0.85rem;">Qandli Diabet Maxsus Ko'rsatkichlari:</strong>
            <div class="grid-2" style="margin-top: 8px;">
              <input type="text" class="form-input" placeholder="Och qoringa glyukoza" value="7.4 mmol/L" />
              <input type="text" class="form-input" placeholder="Ovqatdan keyingi glyukoza" value="9.2 mmol/L" />
            </div>
          </div>

          <div id="diseaseFields-heart" style="display: none; background: #F0F9FF; padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <strong style="color: var(--primary-teal); font-size: 0.85rem;">Yurak Yetishmovchiligi Maxsus Ko'rsatkichlari:</strong>
            <div class="grid-2" style="margin-top: 8px;">
              <input type="text" class="form-input" placeholder="Yurak chiqarish fraksiyasi (EF %)" value="52 %" />
              <input type="text" class="form-input" placeholder="NYHA darajasi" value="NYHA Class II" />
            </div>
          </div>

          <div id="diseaseFields-ckd" style="display: none; background: #F0F9FF; padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <strong style="color: var(--primary-teal); font-size: 0.85rem;">Buyrak Kasalligi Maxsus Ko'rsatkichlari:</strong>
            <div class="grid-2" style="margin-top: 8px;">
              <input type="text" class="form-input" placeholder="Siydikdagi oqsil" value="35 mg/24h" />
              <input type="text" class="form-input" placeholder="Buyrak kasalligi bosqichi" value="CKD 3a-bosqich" />
            </div>
          </div>

          <button type="button" class="btn btn-primary" style="margin-top: 16px;" onclick="switchWizardSection(13)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-13" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">13. Tibbiy Hujjatlar Yuklash</h3>
          <div style="background: #F0F9FF; border: 2px dashed var(--border-color); padding: 20px; border-radius: var(--radius-md); text-align: center;">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2rem; color: var(--primary-teal);"></i>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">Tahlil xulosalari va UZI/EKG fayllarini yuklang</p>
            <input type="file" style="margin-top: 10px;" />
          </div>
          <button type="button" class="btn btn-primary" style="margin-top: 16px;" onclick="switchWizardSection(14)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-14" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">14. Oldingi Davolanish Dinamikasi</h3>
          <div class="form-group">
            <label class="form-label">Oldingi davolanish natijasi</label>
            <select class="form-select">
              <option value="improved">Yaxshilangan (Qisman samara)</option>
              <option value="same">O'zgarish bo'lmagan</option>
            </select>
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(15)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-15" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">15. Bemorning Maqsadi</h3>
          <div style="font-size: 0.85rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
            <label><input type="checkbox" checked /> Qondagi shakarni nazorat qilish</label>
            <label><input type="checkbox" checked /> Qon bosimini nazorat qilish</label>
            <label><input type="checkbox" checked /> Asoratlar xavfini kamaytirish</label>
          </div>
          <button type="button" class="btn btn-primary" onclick="switchWizardSection(16)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-16" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--primary-teal); margin-bottom: 12px;">16. Rozilik va Shartlar</h3>
          <div style="font-size: 0.82rem; color: var(--text-main); display: flex; flex-direction: column; gap: 10px; background: #F0F9FF; padding: 14px; border-radius: var(--radius-md);">
            <label><input type="checkbox" required checked /> Kiritgan ma'lumotlarim to'g'ri ekanligini tasdiqlayman.</label>
            <label><input type="checkbox" required checked /> Tibbiy ma'lumotlarimni TwinCare AI platformasida qayta ishlashga roziman.</label>
            <label><input type="checkbox" required checked /> Sun'iy intellekt natijalari taxminiy ekanligini tushunaman.</label>
          </div>
          <button type="button" class="btn btn-primary" style="margin-top: 16px;" onclick="switchWizardSection(17)">Keyingisi <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <div id="wizSec-17" class="wizard-section-pane">
          <h3 style="font-size: 1rem; color: var(--accent-emerald); margin-bottom: 12px;"><i class="fa-solid fa-circle-check"></i> 17. Yakuniy Tekshiruv va Tasdiqlash</h3>
          
          <div style="font-size: 0.85rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; background: #F0F9FF; padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
            <div>Shaxsiy ma'lumotlar <strong style="color: var(--accent-emerald);">✓</strong></div>
            <div>Tibbiy tarix <strong style="color: var(--accent-emerald);">✓</strong></div>
            <div>Tahlil natijalari <strong style="color: var(--accent-emerald);">✓</strong></div>
            <div>Dori-darmonlar <strong style="color: var(--accent-emerald);">✓</strong></div>
            <div>Turmush tarzi <strong style="color: var(--accent-emerald);">✓</strong></div>
            <div>Kasallik ma'lumotlari <strong style="color: var(--accent-emerald);">✓</strong></div>
            <div>Tibbiy hujjatlar <strong style="color: var(--accent-emerald);">✓</strong></div>
            <div>Rozilik <strong style="color: var(--accent-emerald);">✓</strong></div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="closeModal('intake17Modal')">Bekor qilish</button>
            <button type="submit" class="btn btn-emerald" style="padding: 10px 20px; font-size: 0.95rem;">
              <i class="fa-solid fa-dna"></i> 17-Bo'limli Digital Twinni Yaratish
            </button>
          </div>
        </div>

      </form>
    </div>
  `;
  modal.classList.add('active');
}

function switchWizardSection(secNum) {
  document.querySelectorAll('.wizard-section-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.wizard-nav-item').forEach(i => i.classList.remove('active'));

  const target = document.getElementById(`wizSec-${secNum}`);
  if (target) target.classList.add('active');

  const navItems = document.querySelectorAll('.wizard-nav-item');
  if (navItems[secNum - 1]) navItems[secNum - 1].classList.add('active');
}

function toggleDiseaseSpecificFields(val) {
  document.getElementById('diseaseFields-diabetes').style.display = val === 'diabetes' ? 'block' : 'none';
  document.getElementById('diseaseFields-heart').style.display = val === 'heart' ? 'block' : 'none';
  document.getElementById('diseaseFields-ckd').style.display = val === 'ckd' ? 'block' : 'none';
}

async function submit17SectionIntakeForm(e) {
  e.preventDefault();

  const fullName = document.getElementById('intakePersonalName').value.trim();
  const region = document.getElementById('intakeRegion').value.trim();

  const payload = {
    fullName,
    region,
    district: document.getElementById('intakeDistrict').value.trim(),
    dob: document.getElementById('intakeDob').value,
    gender: document.getElementById('intakeGender').value,
    phone: document.getElementById('intakePhone').value.trim(),
    occupation: document.getElementById('intakeOccupation').value.trim(),
    chronicDisease: document.getElementById('intakeChronicIllnesses').value.trim() || "2-Tip Qandli Diabet",
    drugAllergies: document.getElementById('intakeDrugAllergies').value.trim(),
    hba1c: document.getElementById('intakeHba1c').value.trim(),
    egfr: document.getElementById('intakeEgfr').value.trim(),
    creatinine: document.getElementById('intakeCreatinine').value.trim(),
    bpSystolic: document.getElementById('intakeBpSystolic').value.trim(),
    medName: document.getElementById('intakeMedName').value.trim(),
    medDose: document.getElementById('intakeMedDose').value.trim(),
    doctorId: currentUserSession && currentUserSession.docId ? currentUserSession.docId : 'DOC-UZ-101'
  };

  const res = await API.addPatientTwin(payload);
  if (res.success) {
    closeModal('intake17Modal');
    showToast("17-Bo'limli Yangi Digital Twin muvaffaqiyatli yarartildi!", 'info');
    await renderPatientsDirectory();
    await initTwinPatientSelectOptions();
    selectAndSwitchTwin(res.patient.id);
  }
}

/* DORIXONA EGASI TABI (20+ DORI PROGNOZLARI DYNAMICALLY SWAPPED PER DISTRICT) */
async function renderPharmacyIntelligence() {
  const regSel = document.getElementById('pharmacyRegionSelect');
  const distSel = document.getElementById('pharmacyDistrictSelect');
  const container = document.getElementById('pharmacyForecastGrid');
  if (!container) return;

  if (regSel && regSel.options.length <= 1 && uzbekistanRegionsData.length > 0) {
    regSel.innerHTML = uzbekistanRegionsData.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
    updatePharmacyDistrictOptions();
  }

  const selectedRegion = regSel ? regSel.value : "Toshkent shahri";
  const selectedDistrict = distSel ? distSel.value : "Yunusobod tumani";

  const res = await API.getPharmacyForecasts({ region: selectedRegion, district: selectedDistrict });
  const medicines = res.medicines || [];

  container.innerHTML = medicines.map((m, idx) => `
    <div class="card">
      <div class="card-header" style="margin-bottom: 8px;">
        <div>
          <strong style="font-size: 0.95rem; color: var(--primary-teal);">${idx + 1}. ${m.name}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${m.category} • ${selectedRegion} (${selectedDistrict})</div>
        </div>
        <span class="badge badge-emerald" style="font-size: 0.85rem; padding: 4px 10px;">${m.growthPercent} Ko'proq Sotilishi Kutilmoqda</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; background: #F0F9FF; padding: 8px 12px; border-radius: var(--radius-md); margin-top: 6px;">
        <span>O'tgan oyga nisbatan talab o'sishi</span>
        <strong style="color: var(--accent-emerald);">${m.status} (${m.stockDays} kunlik zaxira)</strong>
      </div>
    </div>
  `).join('');
}

function updatePharmacyDistrictOptions() {
  const regSel = document.getElementById('pharmacyRegionSelect');
  const distSel = document.getElementById('pharmacyDistrictSelect');
  if (!regSel || !distSel) return;

  const regName = regSel.value;
  const regObj = uzbekistanRegionsData.find(r => r.name === regName) || uzbekistanRegionsData[0];

  if (regObj && regObj.districts) {
    distSel.innerHTML = regObj.districts.map(d => `<option value="${d}">${d}</option>`).join('');
  }
}

/* TADQIQOTCHI TABI */
async function renderResearchPlatform() {
  const regSel = document.getElementById('resFilterRegion');
  const distSel = document.getElementById('resFilterDistrict');
  const container = document.getElementById('researchDatasetsGrid');
  if (!container) return;

  if (regSel && regSel.options.length <= 1 && uzbekistanRegionsData.length > 0) {
    regSel.innerHTML = `<option value="all">Barcha Viloyatlar</option>` + uzbekistanRegionsData.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
  }

  const res = await API.getResearchDatasets();
  const datasets = res.datasets || [];

  container.innerHTML = datasets.map(d => `
    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header">
        <div>
          <h3 style="font-size: 0.95rem; font-weight: 800; color: var(--primary-teal);">${d.name}</h3>
          <span class="badge badge-teal">${d.id}</span>
        </div>
        <span class="badge badge-emerald">Bemorlar Soni (N) = ${d.sampleSize}</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
        Kasallik: ${d.disease} • Hudud: ${d.region} (${d.district}) • Yosh guruhi: ${d.ageRange}
      </div>
      <div style="font-size: 0.8rem; color: var(--text-main); background: #F0F9FF; padding: 10px; border-radius: var(--radius-md);">
        ${d.metricsSummary}
      </div>
    </div>
  `).join('');
}

function updateResearchDistrictOptions() {
  const regSel = document.getElementById('resFilterRegion');
  const distSel = document.getElementById('resFilterDistrict');
  if (!regSel || !distSel) return;

  const regName = regSel.value;
  if (regName === 'all') {
    distSel.innerHTML = `<option value="all">Barcha Tumanlar</option>`;
    return;
  }

  const regObj = uzbekistanRegionsData.find(r => r.name === regName);
  if (regObj && regObj.districts) {
    distSel.innerHTML = `<option value="all">Barcha Tumanlar</option>` + regObj.districts.map(d => `<option value="${d}">${d}</option>`).join('');
  }
}

/* AI KONSULTATSIYA & AUTO-TASHXIS */
function toggleMicRecording() {
  const btn = document.getElementById('toggleMicBtn');
  const status = document.getElementById('recordStatusLabel');
  const waveform = document.getElementById('waveformBox');
  const feed = document.getElementById('transcriptFeed');

  if (!isRecordingConsultation) {
    isRecordingConsultation = true;
    btn.classList.add('recording');
    status.textContent = "Jonli Konsultatsiya Yozib Olinmoqda...";
    waveform.style.display = 'flex';

    transcriptTextBuffer = "Bemor Nigora Rustamova: Oxirgi kunlarda qon bosimim 145 ga chiqib kechqurun boshim og'riyapti. Qonda qand miqdori ham 7.8 mmol/L ko'rsatdi.\nShifokor Botir Toshmatov: eGFR va Kreatinin tahlillarini tekshirib ko'ramiz. Enalapril dozasini va parhezni qayta moslashtiramiz.";
    
    feed.innerHTML = `<div style="font-size: 0.85rem; color: var(--primary-teal); font-weight: 600;">[Ovozli Yozuv Boshlandi]:</div><p style="margin-top: 6px; font-size: 0.85rem;">${transcriptTextBuffer.replace(/\n/g, '<br>')}</p>`;
  } else {
    isRecordingConsultation = false;
    btn.classList.remove('recording');
    status.textContent = "Yozib Olish Yakunlandi. AI Klinik Tashxis Tayyorlamoqda...";
    waveform.style.display = 'none';

    generateDiagnosisReport(transcriptTextBuffer);
  }
}

async function generateDiagnosisReport(transcript) {
  const summaryBox = document.getElementById('aiSummaryBox');
  if (!summaryBox) return;

  summaryBox.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--primary-teal);"></i> AI Klinik Tashxis Tayyorlamoqda...</div>`;

  const res = await API.generateDiagnosis(transcript, "Nigora Rustamova");
  if (res.success) {
    const d = res.diagnosisReport;
    summaryBox.innerHTML = `
      <div class="card" style="border-color: var(--primary-teal);">
        <div class="card-header">
          <div class="card-title"><i class="fa-solid fa-stethoscope" style="color: var(--primary-teal);"></i> AI Avto-Tashxis Hisoboti</div>
          <span class="badge badge-rose">${d.riskStratification}</span>
        </div>
        <div style="background: #F0F9FF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px;">
          <h3 style="font-size: 1.1rem; color: var(--accent-emerald); font-weight: 800;">Qo'yilgan Klinik Tashxis: ${d.instantDiagnosis}</h3>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">XKB-10 Kodlari: <strong>${d.icd10Code}</strong></div>
        </div>
        <div>
          <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--accent-amber); margin-bottom: 8px;">Tavsiya Etilayotgan Muolajalar va Dorilar Plan:</h4>
          <ul style="padding-left: 20px; font-size: 0.85rem; color: var(--text-main);">
            ${d.recommendedActions.map(act => `<li style="margin-bottom: 4px;">${act}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    showToast("AI Klinik Tashxis Tayyorlandi!", 'info');
  }
}

/* SHIFOKORLAR KATALOGI VA ANONIM FIKRLAR */
async function renderDoctorsDirectory() {
  const container = document.getElementById('doctorsGrid');
  if (!container) return;

  const res = await API.getDoctors();
  const doctors = res.doctors || [];

  container.innerHTML = doctors.map(d => `
    <div class="card">
      <div class="card-header" style="margin-bottom: 8px;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--primary-teal);">${d.name}</h3>
        <span class="badge badge-teal">${d.verificationStatus}</span>
      </div>

      <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
        <div><strong>Mutaxassisligi:</strong> ${d.specialty}</div>
        <div><strong>Klinika:</strong> ${d.clinic}</div>
        <div><strong>Tajriba:</strong> ${d.experience} • Reyting: ★ ${d.rating} (${d.reviewCount} fikrlar)</div>
      </div>

      ${currentActiveRole === 'patient' ? `
        <button class="btn btn-primary btn-sm" onclick="openReviewModal('${d.id}')">
          <i class="fa-solid fa-comment-medical"></i> Anonim Fikr Qoldirish
        </button>
      ` : ''}
    </div>
  `).join('');
}

async function renderDedicatedFeedbacks() {
  const container = document.getElementById('dedicatedFeedbacksContainer');
  if (!container) return;

  const res = await API.getDoctors();
  const doctors = res.doctors || [];

  let allFeedbacks = [];
  doctors.forEach(d => {
    (d.feedbacks || []).forEach(f => {
      allFeedbacks.push({ doctorName: d.name, specialty: d.specialty, ...f });
    });
  });

  container.innerHTML = allFeedbacks.map(f => `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong style="color: var(--primary-teal); font-size: 0.9rem;">${f.doctorName} (${f.specialty})</strong>
        <span class="badge badge-amber">★ ${f.rating} Bollar</span>
      </div>
      <div style="font-size: 0.82rem; color: var(--text-main); margin-bottom: 6px;">"${f.text}"</div>
      <div style="font-size: 0.75rem; color: var(--text-muted);">${f.category} • Sana: ${f.date}</div>
    </div>
  `).join('');
}

async function renderProtocolsList() {
  const container = document.getElementById('protocolsList');
  if (!container) return;

  const res = await API.getProtocols();
  const protocols = res.protocols || [];

  container.innerHTML = protocols.map(p => `
    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header">
        <div>
          <h3 style="font-size: 1rem; font-weight: 800; color: var(--primary-teal);">${p.title}</h3>
          <span class="badge badge-teal">XKB-10: ${p.icd10}</span>
        </div>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px;">${p.summary}</p>
      <div style="background: #F0F9FF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px;">
        <strong style="font-size: 0.8rem; color: var(--accent-emerald);">Rasmiy Klinik Tavsiyalar:</strong>
        <ul style="padding-left: 20px; font-size: 0.8rem; color: var(--text-main); margin-top: 4px;">
          ${p.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function openReviewModal(docId) {
  const inp = document.getElementById('reviewDocId');
  if (inp) inp.value = docId;
  const modal = document.getElementById('reviewSubmitModal');
  if (modal) modal.classList.add('active');
}

async function submitAnonymousReview(e) {
  e.preventDefault();
  const docId = document.getElementById('reviewDocId').value;
  const rating = document.getElementById('reviewRatingSelect').value;
  const category = document.getElementById('reviewCategorySelect').value;
  const text = document.getElementById('reviewText').value.trim();

  const res = await API.submitDoctorReview(docId, { rating, category, text });
  if (res.success) {
    closeModal('reviewSubmitModal');
    showToast("Anonim fikringiz muvaffaqiyatli saqlandi!", 'info');
    await renderDoctorsDirectory();
    await renderDedicatedFeedbacks();
  }
}

function initGlobalSearch() {
  const inp = document.getElementById('globalSearchInput');
  const dropdown = document.getElementById('searchResultsDropdown');
  if (!inp || !dropdown) return;

  inp.addEventListener('input', async () => {
    const q = inp.value.trim().toLowerCase();
    if (q.length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    const pRes = await API.getPatients({ search: q });
    const patients = pRes.patients || [];

    let html = '';
    patients.forEach(p => {
      html += `<div style="padding: 10px 14px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="selectAndSwitchTwin('${p.id}'); document.getElementById('searchResultsDropdown').style.display='none';">
        <strong style="color: var(--primary-teal); font-size: 0.85rem;">[Bemor Digital Twin] ${p.fullName} (${p.id})</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${p.region} • ${p.healthStatus}</div>
      </div>`;
    });

    if (!html) html = `<div style="padding: 14px; color: var(--text-muted); font-size: 0.8rem; text-align: center;">Natijalar topilmadi.</div>`;

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  });
}
