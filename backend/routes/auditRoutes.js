const express = require('express');
const router = express.Router();
const { syntheticAuditLogs } = require('../data/database');

router.get('/', (req, res) => {
  res.json({ success: true, count: syntheticAuditLogs.length, auditLogs: syntheticAuditLogs });
});

router.post('/', (req, res) => {
  const { userRole, action, resource, status, ip } = req.body;
  const newLog = {
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    userRole: userRole || "System User",
    action: action || "Platform Access",
    resource: resource || "Digital Twin Sandbox",
    status: status || "Success",
    ip: ip || req.ip || "127.0.0.1"
  };

  syntheticAuditLogs.unshift(newLog);
  res.json({ success: true, log: newLog });
});

module.exports = router;
