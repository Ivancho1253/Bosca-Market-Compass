const router = require('express').Router();
const scoreRepo = require('../repositories/score.repository');
const indicatorRepo = require('../repositories/indicator.repository');

router.get('/', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || 2024;
    let scores = await scoreRepo.findAllForYear(year);

    if (req.query.region) {
      scores = scores.filter(s => s.region?.toLowerCase() === req.query.region.toLowerCase());
    }
    if (req.query.status) {
      scores = scores.filter(s => s.status === req.query.status);
    }

    const allValues = await indicatorRepo.findAllValuesForYear(year);
    const valMap = {};
    for (const v of allValues) {
      if (!valMap[v.iso3]) valMap[v.iso3] = {};
      valMap[v.iso3][v.code] = v.value;
    }

    const result = scores.map((s, i) => ({
      rank: i + 1,
      iso3: s.iso3,
      country: s.country_name,
      region: s.region,
      tradeBlock: s.trade_block,
      score: parseFloat(s.total_score).toFixed(1),
      status: s.status,
      economicScore: s.economic_score ? parseFloat(s.economic_score).toFixed(1) : null,
      commercialScore: s.commercial_score ? parseFloat(s.commercial_score).toFixed(1) : null,
      logisticsScore: s.logistics_score ? parseFloat(s.logistics_score).toFixed(1) : null,
      riskScore: s.risk_score ? parseFloat(s.risk_score).toFixed(1) : null,
      pbiPerCapita: valMap[s.iso3]?.pbi_per_capita_usd,
      inflation: valMap[s.iso3]?.inflacion_pct,
      wineImportsUsd: valMap[s.iso3]?.importacion_vino_usd,
      tariff: valMap[s.iso3]?.arancel_vino_pct,
      apertura: valMap[s.iso3]?.apertura_comercial_pct_pbi,
    }));

    res.json(result);
  } catch (e) { next(e); }
});

module.exports = router;
