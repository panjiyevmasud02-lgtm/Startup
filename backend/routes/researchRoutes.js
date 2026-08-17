const express = require('express');
const router = express.Router();
const { syntheticResearchCohorts } = require('../data/database');

router.get('/datasets', (req, res) => {
  const { region, district, age, gender, disease } = req.query;

  let result = [...syntheticResearchCohorts];

  if (region && region !== 'all') {
    result = result.filter(d => d.region.toLowerCase().includes(region.toLowerCase()));
  }
  if (disease && disease !== 'all') {
    result = result.filter(d => d.disease.toLowerCase().includes(disease.toLowerCase()));
  }

  res.json({
    success: true,
    appliedFilters: { region, district, age, gender, disease },
    count: result.length,
    datasets: result
  });
});

module.exports = router;
