const router = require('express').Router();
const countryRepo = require('../repositories/country.repository');
const scoreRepo = require('../repositories/score.repository');
const indicatorRepo = require('../repositories/indicator.repository');

router.get('/', async (req, res, next) => {
  try {
    res.json(await countryRepo.findAll());
  } catch (e) { next(e); }
});

router.get('/:iso3', async (req, res, next) => {
  try {
    const country = await countryRepo.findByIso3(req.params.iso3);
    if (!country) return res.status(404).json({ error: 'País no encontrado' });

    const yearScores = await scoreRepo.findByIso3AllYears(req.params.iso3);
    const latestYear = yearScores.length ? Math.max(...yearScores.map(s => s.year)) : 2024;
    const indicators = await indicatorRepo.findValuesByCountryYear(country.id, latestYear);

    res.json({ ...country, scores: yearScores, latestYear, indicators });
  } catch (e) { next(e); }
});

module.exports = router;
