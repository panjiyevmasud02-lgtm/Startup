const express = require('express');
const router = express.Router();
const { registeredUsers, syntheticPatients, syntheticDoctors } = require('../data/database');

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const cleanUsername = (username || '').trim().replace(/^@/, '');

  if (cleanUsername === 'admin' && password === 'admin123') {
    const adminUser = registeredUsers.find(u => u.username === 'admin');
    return res.json({ success: true, user: adminUser });
  }

  const user = registeredUsers.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Login yoki parol noto'g'ri!" });
  }

  return res.json({ success: true, user });
});

// Register endpoint (Supporting all 5 roles: patient, doctor, researcher, pharmacy, admin)
router.post('/register', (req, res) => {
  const { username, password, firstName, lastName, role } = req.body;
  const cleanUsername = (username || '').trim().replace(/^@/, '');

  if (!cleanUsername || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ success: false, message: "Barcha maydonlarni to'ldiring!" });
  }

  const existing = registeredUsers.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: "Ushbu username band!" });
  }

  const validRoles = ['doctor', 'patient', 'researcher', 'pharmacy', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'patient';

  const newUser = {
    username: cleanUsername,
    password,
    firstName,
    lastName,
    role: userRole,
    isRoleLocked: true
  };

  // If registering as a new patient, auto-create a digital twin entry
  if (userRole === 'patient') {
    const newTwinId = `TWIN-UZ-${Math.floor(1000 + Math.random() * 9000)}`;
    newUser.patientId = newTwinId;

    syntheticPatients.push({
      id: newTwinId,
      username: cleanUsername,
      assignedDoctorId: "DOC-UZ-101",
      assignedDoctorName: "Dr. Jasur Alimov",
      fullName: `${firstName} ${lastName}`,
      age: 40,
      gender: "Not Specified",
      region: "Tashkent",
      city: "Tashkent",
      dob: "1986-01-01",
      occupation: "Patient",
      lifestyle: "Standard diet & activity",
      allergies: "None reported",
      familyHistory: "Under observation",
      healthStatus: "Digital Twin Initialized",
      chronicDiseases: [],
      biomarkersHistory: {
        dates: ["2026-03", "2026-08"],
        HbA1c: [6.2, 6.0],
        eGFR: [90, 88],
        systolicBP: [124, 120],
        creatinine: [75, 74]
      },
      medicationHistory: [],
      dailyAssistantLog: [
        { time: "09:00", task: "Complete Profile Setup & Biomarker Sync", status: "Pending", category: "System" }
      ],
      surgeriesHistory: [],
      trialsHistory: []
    });
  }

  // If registering as a new doctor, auto-create doctor directory record
  if (userRole === 'doctor') {
    const newDocId = `DOC-UZ-${Math.floor(500 + Math.random() * 500)}`;
    newUser.docId = newDocId;

    syntheticDoctors.push({
      id: newDocId,
      name: `Dr. ${firstName} ${lastName}`,
      specialty: "General Practitioner",
      region: "Tashkent",
      clinic: "Tashkent Medical Center",
      experience: "5 years",
      languages: "Uzbek, English",
      expertise: "Primary Care, Chronic Disease Management",
      verificationStatus: "Pending Verification",
      rating: 5.0,
      reviewCount: 0,
      anonymousCount: 0,
      bio: "Newly registered specialist on TwinCare AI platform.",
      education: "Tashkent Medical Academy",
      feedbacks: []
    });
  }

  registeredUsers.push(newUser);
  return res.json({ success: true, user: newUser });
});

// Update profile
router.put('/profile', (req, res) => {
  const { username, firstName, lastName } = req.body;
  const user = registeredUsers.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi!" });
  }
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  return res.json({ success: true, user });
});

module.exports = router;
