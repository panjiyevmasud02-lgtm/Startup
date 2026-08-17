const express = require('express');
const router = express.Router();
const { syntheticProtocols } = require('../data/database');

router.get('/protocols', (req, res) => {
  const { search } = req.query;
  let result = [...syntheticProtocols];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.icd10.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, protocols: result });
});

module.exports = router;
