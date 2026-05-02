const router = require('express').Router();
const countryRepo = require('../repositories/country.repository');
const scoreRepo = require('../repositories/score.repository');
const indicatorRepo = require('../repositories/indicator.repository');

router.get('/', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || 2024;
    const isos = (req.query.countries || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (isos.length < 2) return res.status(400).json({ error: 'Se necesitan al menos 2 países' });

    const allValues = await indicatorRepo.findAllValuesForYear(year);
    const allScores = await scoreRepo.findAllForYear(year);

    const result = [];
    for (const iso3 of isos) {
      const country = await countryRepo.findByIso3(iso3);
      if (!country) continue;

      const score = allScores.find(s => s.iso3 === iso3);
      const values = allValues.filter(v => v.iso3 === iso3);

      const indicators = {};
      for (const v of values) {
        indicators[v.code] = {
          name: v.name,
          value: v.value,
          normalizedScore: v.normalized_score ? parseFloat(v.normalized_score).toFixed(1) : null,
          unit: v.unit,
          dimension: v.dimension,
        };
      }

      result.push({
        iso3,
        country: country.name,
        region: country.region,
        totalScore: score ? parseFloat(score.total_score).toFixed(1) : null,
        status: score?.status,
        economicScore: score?.economic_score ? parseFloat(score.economic_score).toFixed(1) : null,
        commercialScore: score?.commercial_score ? parseFloat(score.commercial_score).toFixed(1) : null,
        demandScore: score?.demand_score ? parseFloat(score.demand_score).toFixed(1) : null,
        logisticsScore: score?.logistics_score ? parseFloat(score.logistics_score).toFixed(1) : null,
        riskScore: score?.risk_score ? parseFloat(score.risk_score).toFixed(1) : null,
        legalScore: score?.legal_score ? parseFloat(score.legal_score).toFixed(1) : null,
        explanation: score?.explanation,
        indicators,
      });
    }

    res.json(result);
  } catch (e) { next(e); }
});

module.exports = router;
