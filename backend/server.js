const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const researchRoutes = require('./routes/researchRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit-logs', auditRoutes);

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` TwinCare AI Backend Server Running on Port ${PORT} `);
  console.log(` REST API Base URL: http://localhost:${PORT}/api    `);
  console.log(`====================================================`);
});
