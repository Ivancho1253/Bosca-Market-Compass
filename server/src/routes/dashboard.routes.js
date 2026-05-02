const router = require('express').Router();
const dashboardService = require('../services/dashboard.service');

router.get('/', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || 2024;
    res.json(await dashboardService.getDashboardData(year));
  } catch (e) { next(e); }
});

module.exports = router;
