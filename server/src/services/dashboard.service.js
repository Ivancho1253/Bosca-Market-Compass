const scoreRepo = require('../repositories/score.repository');
const alertRepo = require('../repositories/alert.repository');
const indicatorRepo = require('../repositories/indicator.repository');

async function getDashboardData(year) {
  const scores = await scoreRepo.findAllForYear(year);
  const alerts = await alertRepo.findUnread();

  const total = scores.length;
  const best = scores[0] || null;
  const avg = total > 0 ? scores.reduce((s, r) => s + parseFloat(r.total_score), 0) / total : 0;

  const aptitude = { apto: 0, en_evaluacion: 0, no_apto: 0 };
  for (const s of scores) {
    const key = s.status === 'apto' ? 'apto' : s.status === 'en_evaluacion' ? 'en_evaluacion' : 'no_apto';
    aptitude[key]++;
  }

  const topMarkets = scores.slice(0, 5).map(s => ({
    iso3: s.iso3,
    country: s.country_name,
    region: s.region,
    score: parseFloat(s.total_score).toFixed(1),
    status: s.status,
  }));

  const pestel = [
    { dimension: 'Económica', score: avg_dim(scores, 'economic_score') },
    { dimension: 'Comercial', score: avg_dim(scores, 'commercial_score') },
    { dimension: 'Demanda', score: avg_dim(scores, 'demand_score') },
    { dimension: 'Logística', score: avg_dim(scores, 'logistics_score') },
    { dimension: 'Riesgo', score: avg_dim(scores, 'risk_score') },
    { dimension: 'Legal', score: avg_dim(scores, 'legal_score') },
  ];

  const allValues = await indicatorRepo.findAllValuesForYear(year);
  const heatmap = buildHeatmap(allValues);

  return {
    year,
    kpis: {
      countriesAnalyzed: total,
      bestMarket: best ? { iso3: best.iso3, name: best.country_name, score: parseFloat(best.total_score).toFixed(1) } : null,
      averageAttractionIndex: parseFloat(avg.toFixed(1)),
      analysisTimeReduction: 70,
    },
    aptitudeDistribution: aptitude,
    topMarkets,
    pestel,
    heatmap,
    alerts: alerts.slice(0, 5),
  };
}

function avg_dim(scores, field) {
  const vals = scores.map(s => parseFloat(s[field])).filter(v => !isNaN(v));
  return vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;
}

function buildHeatmap(values) {
  const map = {};
  for (const v of values) {
    if (!map[v.iso3]) map[v.iso3] = { iso3: v.iso3, country: v.country_name };
    map[v.iso3][v.code] = v.normalized_score !== null ? parseFloat(v.normalized_score).toFixed(1) : null;
  }
  return Object.values(map);
}

module.exports = { getDashboardData };
