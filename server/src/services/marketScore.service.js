const { minMaxNormalize, calcStatus, buildExplanation } = require('../utils/normalize');
const countryRepo    = require('../repositories/country.repository');
const indicatorRepo  = require('../repositories/indicator.repository');
const scoreRepo      = require('../repositories/score.repository');
const alertRepo      = require('../repositories/alert.repository');
const thresholdChecker = require('../observers/thresholdChecker');

async function recalculateScoresForYear(year) {
  const countries  = await countryRepo.findAll();
  const allValues  = await indicatorRepo.findAllValuesForYear(year);

  const valuesByIndicator = {};
  for (const v of allValues) {
    if (!valuesByIndicator[v.indicator_id]) valuesByIndicator[v.indicator_id] = [];
    if (v.value !== null) valuesByIndicator[v.indicator_id].push(parseFloat(v.value));
  }

  const mins = {};
  const maxs = {};
  for (const [indId, vals] of Object.entries(valuesByIndicator)) {
    mins[indId] = Math.min(...vals);
    maxs[indId] = Math.max(...vals);
  }

  await alertRepo.deleteByType('score_alert');

  for (const country of countries) {
    const countryValues = allValues.filter(v => v.country_id === country.id);
    if (countryValues.length === 0) continue;

    const dimScores  = {};
    const dimWeights = {};

    for (const cv of countryValues) {
      const ns  = minMaxNormalize(cv.value, mins[cv.indicator_id] ?? 0, maxs[cv.indicator_id] ?? 100, cv.direction);
      const dim = cv.dimension;
      if (!dimScores[dim]) { dimScores[dim] = 0; dimWeights[dim] = 0; }
      dimScores[dim]  += ns * parseFloat(cv.weight);
      dimWeights[dim] += parseFloat(cv.weight);
    }

    let totalScore = 0;
    for (const cv of countryValues) {
      const ns = minMaxNormalize(cv.value, mins[cv.indicator_id] ?? 0, maxs[cv.indicator_id] ?? 100, cv.direction);
      totalScore += ns * parseFloat(cv.weight);
    }

    const dimNorm   = (dim) => dimWeights[dim] > 0 ? (dimScores[dim] / dimWeights[dim]) : null;
    const status    = calcStatus(totalScore);

    const sorted    = countryValues
      .map(cv => ({ name: cv.code, score: minMaxNormalize(cv.value, mins[cv.indicator_id] ?? 0, maxs[cv.indicator_id] ?? 100, cv.direction) }))
      .sort((a, b) => b.score - a.score);
    const strengths  = sorted.slice(0, 2).map(s => s.name.replace(/_/g, ' '));
    const weaknesses = sorted.slice(-1).map(s => s.name.replace(/_/g, ' '));
    const explanation = buildExplanation(country.name, totalScore, strengths, weaknesses);

    await scoreRepo.upsert({
      countryId: country.id, year,
      economicScore:   dimNorm('economica'),
      commercialScore: dimNorm('comercial'),
      demandScore:     dimNorm('demanda'),
      logisticsScore:  dimNorm('logistica'),
      riskScore:       dimNorm('riesgo'),
      legalScore:      dimNorm('legal'),
      totalScore, status, explanation,
    });

    thresholdChecker.checkCountry({ country, indicators: countryValues, totalScore });
  }
}

module.exports = { recalculateScoresForYear };
