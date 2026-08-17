const express = require('express');
const router = express.Router();
const { uzbekistanRegions, getDynamicPharmacyForecasts } = require('../data/database');

// GET regions and districts list
router.get('/regions', (req, res) => {
  res.json({ success: true, regions: uzbekistanRegions });
});

// GET 20+ Medicine Demand Forecasting dynamically swapped for selected Region & District
router.get('/forecasts', (req, res) => {
  const { region, district } = req.query;

  const selRegion = region || "Toshkent shahri";
  const selDistrict = district || "Yunusobod tumani";

  const dynamicMedicines = getDynamicPharmacyForecasts(selRegion, selDistrict);

  res.json({
    success: true,
    region: selRegion,
    district: selDistrict,
    totalCount: dynamicMedicines.length,
    medicines: dynamicMedicines,
    summaryText: `${selRegion}, ${selDistrict} bo'yicha kelasi oyda ushbu 22+ dori vositalari o'tgan oyga nisbatan sotilish foizi ko'tarilishi bashorat qilinmoqda.`
  });
});

module.exports = router;
