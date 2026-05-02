const router = require('express').Router();
const etlService = require('../services/etl.service');

router.post('/run', async (req, res, next) => {
  try {
    const years = req.body.years || '2020:2024';
    res.json({ message: 'ETL iniciado', ...(await etlService.runEtl(years)) });
  } catch (e) { next(e); }
});

router.get('/runs', async (req, res, next) => {
  try {
    res.json(await etlService.listRuns());
  } catch (e) { next(e); }
});

module.exports = router;
