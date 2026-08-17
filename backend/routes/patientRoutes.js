const express = require('express');
const router = express.Router();
const { syntheticPatients, syntheticDoctors } = require('../data/database');

// GET patients
router.get('/', (req, res) => {
  const { role, username, doctorId, search } = req.query;

  let result = [...syntheticPatients];

  if (role === 'patient') {
    result = result.filter(p => p.username === username || p.id === req.query.patientId);
    if (result.length === 0 && syntheticPatients.length > 0) {
      result = [syntheticPatients[0]];
    }
  } else if (role === 'doctor') {
    const docId = doctorId || "DOC-UZ-101";
    result = result.filter(p => p.assignedDoctorId === docId || p.assignedDoctorId === "DOC-UZ-101");
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => 
      p.fullName.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, patients: result });
});

// GET patient by ID
router.get('/:id', (req, res) => {
  const patient = syntheticPatients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, message: "Digital Twin topilmadi!" });
  }
  res.json({ success: true, patient });
});

// POST "Yangi Twin Yaratish" (Comprehensive 17-section intake form payload)
router.post('/', (req, res) => {
  const intakeData = req.body;
  const fullName = intakeData.fullName || intakeData.personalName || "Yangi Bemor";
  const region = intakeData.region || "Toshkent shahri";

  const doctorId = intakeData.doctorId || 'DOC-UZ-101';
  const assignedDoc = syntheticDoctors.find(d => d.id === doctorId) || syntheticDoctors[0];
  const newId = `TWIN-UZ-${Math.floor(1000 + Math.random() * 9000)}`;

  const newPatient = {
    id: newId,
    username: fullName.toLowerCase().replace(/\s+/g, '_'),
    assignedDoctorId: assignedDoc.id,
    assignedDoctorName: assignedDoc.name,
    fullName,
    age: parseInt(intakeData.age) || 45,
    gender: intakeData.gender || "Ayol",
    region,
    city: intakeData.district || region,
    dob: intakeData.dob || "1985-05-14",
    occupation: intakeData.occupation || "Xodim",
    lifestyle: intakeData.lifestyleActivity || "Standart parhez va o'rtacha harakat",
    allergies: intakeData.drugAllergies || "Yo'q",
    familyHistory: intakeData.familyHistoryNotes || "Kuzatuv ostida",
    healthStatus: "17-Bo'limli Digital Twin Tayyorlandi",
    chronicDiseases: intakeData.chronicDisease ? [{
      name: intakeData.chronicDisease,
      icd10: "E11.9",
      severity: "O'rtacha",
      diagnosisDate: new Date().toISOString().slice(0, 10),
      status: "Klinik Protokol Biriktirildi",
      progression: "Kuzatuvda",
      complications: "Yo'q",
      currentTreatment: intakeData.currentMeds || "Terapiya tayinlandi",
      previousTreatment: "Yo'q",
      response: "Kuzatuv ostida"
    }] : [],
    biomarkersHistory: {
      dates: ["2025-09", "2026-03", "2026-08"],
      HbA1c: [parseFloat(intakeData.hba1c) || 7.5, 7.3, 7.1],
      eGFR: [parseFloat(intakeData.egfr) || 85, 83, 82],
      systolicBP: [parseFloat(intakeData.bpSystolic) || 135, 130, 128],
      creatinine: [parseFloat(intakeData.creatinine) || 85, 84, 83]
    },
    medicationHistory: intakeData.medName ? [{
      id: 1,
      name: intakeData.medName,
      dose: intakeData.medDose || "10mg",
      frequency: intakeData.medFreq || "Kuniga 1 mahal",
      times: "08:00",
      startDate: new Date().toISOString().slice(0, 10),
      status: "Faol",
      adherence: 100,
      response: "Yangi tayinlangan"
    }] : [],
    dailyAssistantLog: [
      { time: "08:00", task: "17-Bo'limli Klinik Twin ko'rsatkichlarini o'lchash", status: "Bajarildi", category: "Tizim" }
    ],
    full17SectionIntakePayload: intakeData,
    trialsHistory: []
  };

  syntheticPatients.unshift(newPatient);
  res.json({ success: true, message: "17-Bo'limli Yangi Digital Twin muvaffaqiyatli yarartildi!", patient: newPatient });
});

// POST "Muolajani Sinash"
router.post('/:id/treatment-trial', (req, res) => {
  const patient = syntheticPatients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, message: "Bemor topilmadi!" });
  }

  const { treatmentName, treatmentDetails, expectedOutcome } = req.body;

  const result = {
    date: new Date().toISOString().slice(0, 10),
    treatmentName: treatmentName || "Dapagliflozin 10mg + Enalapril Dozasini Oshirish",
    treatmentDetails: treatmentDetails || "Dori vositasi dozasini oshirish va parhez biriktirish.",
    expectedOutcome: expectedOutcome || "Qon bosimi va eGFR ko'rsatkichlarini normallashtirish.",
    successProbability: 37,
    statusColor: "rose",
    statusText: "37% Muvaffaqiyat — Past Samadorlik / Xavf Yordami",
    clinicalReasoning: "Digital Twin simulyatsiya tahliliga ko'ra: bemorning joriy eGFR (55 mL/min) darajasida kutilayotgan terapiya dozasi oqsil parhezisiz kutilgan 94% natijani bermaydi. Shuning uchun muolaja muvaffaqiyati 37% deb baholandi."
  };

  if (!patient.trialsHistory) patient.trialsHistory = [];
  patient.trialsHistory.unshift({
    date: result.date,
    simulationType: result.treatmentName,
    predictedEffect: `Muvaffaqiyat: 37% (Qizg'ish xavf) — ${result.expectedOutcome}`
  });

  res.json({ success: true, message: "Muolaja simulyatsiyasi bajarildi!", result });
});

module.exports = router;
