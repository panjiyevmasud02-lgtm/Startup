/* -------------------------------------------------------------------
   TwinCare AI — REST API Service Client (Frontend <-> Backend)
   ------------------------------------------------------------------- */

const BACKEND_PORT = 5000;
function detectApiBase() {
  const port = window.location.port;
  const host = window.location.hostname || 'localhost';
  if (!port || String(port) === String(BACKEND_PORT)) {
    return '/api';
  }
  return `http://${host}:${BACKEND_PORT}/api`;
}
const API_BASE = detectApiBase();

const API = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateProfile(data) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Patients & Digital Twins
  async getPatients(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/patients?${query}`);
    return res.json();
  },

  async getPatientById(id) {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    return res.json();
  },

  async addPatientTwin(patientData) {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
    return res.json();
  },

  async addMedication(patientId, medData) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medData)
    });
    return res.json();
  },

  // "Muolajani Sinash" Treatment Trial Simulation
  async simulateTreatmentTrial(patientId, trialData) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/treatment-trial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trialData)
    });
    return res.json();
  },

  // Doctors
  async getDoctors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/doctors?${query}`);
    return res.json();
  },

  async submitDoctorReview(id, reviewData) {
    const res = await fetch(`${API_BASE}/doctors/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return res.json();
  },

  // Knowledge Base Protocols
  async getProtocols(search = '') {
    const res = await fetch(`${API_BASE}/knowledge/protocols?search=${encodeURIComponent(search)}`);
    return res.json();
  },

  // Research
  async getResearchDatasets(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/research/datasets?${query}`);
    return res.json();
  },

  // Pharmacy
  async getPharmacyRegions() {
    const res = await fetch(`${API_BASE}/pharmacy/regions`);
    return res.json();
  },

  async getPharmacyForecasts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/pharmacy/forecasts?${query}`);
    return res.json();
  },

  // AI Consultation & Diagnosis
  async generateDiagnosis(transcriptText, patientName) {
    const res = await fetch(`${API_BASE}/ai/generate-diagnosis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcriptText, patientName })
    });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return res.json();
  }
};
