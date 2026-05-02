const router = require('express').Router();
const indicatorRepo = require('../repositories/indicator.repository');

router.get('/', async (req, res, next) => {
  try {
    res.json(await indicatorRepo.findAll());
  } catch (e) { next(e); }
});

module.exports = router;
