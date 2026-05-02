const db = require('../config/db');
const { minMaxNormalize, calcStatus, buildExplanation } = require('../utils/normalize');
const scoreRepo = require('../repositories/score.repository');
const alertRepo = require('../repositories/alert.repository');

async function recalculateScoresForYear(year) {
  const { rows: countries } = await db.query('SELECT * FROM countries');
  const { rows: indicators } = await db.query('SELECT * FROM indicators');

  const { rows: allValues } = await db.query(
    `SELECT iv.country_id, iv.indicator_id, iv.value, i.code, i.direction, i.weight, i.dimension
     FROM indicator_values iv
     JOIN indicators i ON i.id = iv.indicator_id
     WHERE iv.year = $1`,
    [year]
  );

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

    const dimScores = {};
    const dimWeights = {};

    for (const cv of countryValues) {
      const ns = minMaxNormalize(cv.value, mins[cv.indicator_id] ?? 0, maxs[cv.indicator_id] ?? 100, cv.direction);
      const dim = cv.dimension;
      if (!dimScores[dim]) { dimScores[dim] = 0; dimWeights[dim] = 0; }
      dimScores[dim] += ns * parseFloat(cv.weight);
      dimWeights[dim] += parseFloat(cv.weight);
    }

    let totalScore = 0;
    for (const cv of countryValues) {
      const ns = minMaxNormalize(cv.value, mins[cv.indicator_id] ?? 0, maxs[cv.indicator_id] ?? 100, cv.direction);
      totalScore += ns * parseFloat(cv.weight);
    }

    const dimNorm = (dim) => dimWeights[dim] > 0 ? (dimScores[dim] / dimWeights[dim]) : null;
    const status = calcStatus(totalScore);

    const sorted = countryValues
      .map(cv => ({ name: cv.code, score: minMaxNormalize(cv.value, mins[cv.indicator_id] ?? 0, maxs[cv.indicator_id] ?? 100, cv.direction) }))
      .sort((a, b) => b.score - a.score);
    const strengths = sorted.slice(0, 2).map(s => s.name.replace(/_/g, ' '));
    const weaknesses = sorted.slice(-1).map(s => s.name.replace(/_/g, ' '));
    const explanation = buildExplanation(country.name, totalScore, strengths, weaknesses);

    await scoreRepo.upsert({
      countryId: country.id, year,
      economicScore: dimNorm('economica'),
      commercialScore: dimNorm('comercial'),
      demandScore: dimNorm('demanda'),
      logisticsScore: dimNorm('logistica'),
      riskScore: dimNorm('riesgo'),
      legalScore: dimNorm('legal'),
      totalScore, status, explanation,
    });

    const inflation = countryValues.find(v => v.code === 'inflacion_pct');
    const tariff = countryValues.find(v => v.code === 'arancel_vino_pct');

    if (inflation && parseFloat(inflation.value) > 10) {
      await alertRepo.create({ countryId: country.id, title: `Inflación elevada en ${country.name}`, message: `La inflación en ${country.name} supera el 10% (${parseFloat(inflation.value).toFixed(1)}%). Riesgo macroeconómico alto.`, priority: 'alta', type: 'score_alert' });
    }
    if (tariff && parseFloat(tariff.value) > 15) {
      await alertRepo.create({ countryId: country.id, title: `Arancel vino alto en ${country.name}`, message: `El arancel para vino en ${country.name} es ${parseFloat(tariff.value).toFixed(1)}%, lo que puede reducir la competitividad.`, priority: 'alta', type: 'score_alert' });
    }
    if (totalScore < 40) {
      await alertRepo.create({ countryId: country.id, title: `Mercado no apto: ${country.name}`, message: `${country.name} tiene un índice de atractivo de ${totalScore.toFixed(0)}/100, por debajo del umbral mínimo.`, priority: 'alta', type: 'score_alert' });
    } else if (totalScore < 70) {
      await alertRepo.create({ countryId: country.id, title: `${country.name} en evaluación`, message: `${country.name} tiene un índice de ${totalScore.toFixed(0)}/100. Requiere análisis adicional.`, priority: 'media', type: 'score_alert' });
    }
  }
}

module.exports = { recalculateScoresForYear };
