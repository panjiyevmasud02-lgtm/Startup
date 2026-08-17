const express = require('express');
const router = express.Router();
const { syntheticDoctors, syntheticPatients } = require('../data/database');

// GET all doctors with optional search and region filtering
router.get('/', (req, res) => {
  const { search, region } = req.query;
  let result = [...syntheticDoctors];

  if (region && region !== 'all') {
    result = result.filter(d => d.region.toLowerCase() === region.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialty.toLowerCase().includes(q) ||
      d.clinic.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, doctors: result });
});

// GET specific doctor detail
router.get('/:id', (req, res) => {
  const doc = syntheticDoctors.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, message: "Shifokor topilmadi!" });
  }
  res.json({ success: true, doctor: doc });
});

// GET doctor's assigned patients summary (ONLY full name & ID for doctor-to-doctor cross-lookups)
router.get('/:id/patients-summary', (req, res) => {
  const docId = req.params.id;
  const assigned = syntheticPatients
    .filter(p => p.assignedDoctorId === docId)
    .map(p => ({
      id: p.id,
      fullName: p.fullName,
      age: p.age,
      region: p.region
    }));

  res.json({ success: true, doctorId: docId, count: assigned.length, patients: assigned });
});

// POST submit anonymous review/feedback for doctor
router.post('/:id/reviews', (req, res) => {
  const doc = syntheticDoctors.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, message: "Shifokor topilmadi!" });
  }

  const { rating, category, text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: "Izoh matni kiritilishi shart!" });
  }

  const newFeedback = {
    rating: parseInt(rating) || 5,
    category: category || "General Treatment",
    text,
    date: new Date().toISOString().slice(0, 10)
  };

  doc.feedbacks.unshift(newFeedback);
  doc.reviewCount += 1;
  doc.anonymousCount += 1;

  // Recalculate average rating
  const sum = doc.feedbacks.reduce((acc, f) => acc + f.rating, 0);
  doc.rating = Number((sum / doc.feedbacks.length).toFixed(1));

  res.json({ success: true, message: "Anonim fikringiz yuborildi!", feedback: newFeedback, rating: doc.rating });
});

// PUT toggle verification status (Admin only)
router.put('/:id/verification', (req, res) => {
  const doc = syntheticDoctors.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, message: "Shifokor topilmadi!" });
  }
  doc.verificationStatus = doc.verificationStatus === "Verified Specialist" ? "Pending Verification" : "Verified Specialist";
  res.json({ success: true, doctor: doc });
});

module.exports = router;
