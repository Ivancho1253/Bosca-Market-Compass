const router = require('express').Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', service: 'luigi-bosca-mis-api', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', service: 'luigi-bosca-mis-api', db: 'disconnected' });
  }
});

module.exports = router;
