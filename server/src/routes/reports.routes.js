const router = require('express').Router();
const reportService = require('../services/report.service');

router.post('/executive', async (req, res, next) => {
  try {
    const { year = 2024, countries = [] } = req.body;
    const report = await reportService.generateExecutiveReport({ year, countries });
    res.status(201).json(report);
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    res.json(await reportService.listReports());
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });
    res.json(report);
  } catch (e) { next(e); }
});

module.exports = router;
