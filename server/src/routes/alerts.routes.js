const router = require('express').Router();
const alertRepo = require('../repositories/alert.repository');

router.get('/', async (req, res, next) => {
  try {
    res.json(await alertRepo.findAll());
  } catch (e) { next(e); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const alert = await alertRepo.markRead(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json(alert);
  } catch (e) { next(e); }
});

module.exports = router;
