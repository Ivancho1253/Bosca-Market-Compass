function minMaxNormalize(value, min, max, direction) {
  if (max === min) return 50;
  if (value === null || value === undefined) return 0;
  const v = parseFloat(value);
  if (isNaN(v)) return 0;
  let score;
  if (direction === 'higher_is_better') {
    score = ((v - min) / (max - min)) * 100;
  } else {
    score = ((max - v) / (max - min)) * 100;
  }
  return Math.max(0, Math.min(100, score));
}

function calcStatus(score) {
  if (score >= 70) return 'apto';
  if (score >= 40) return 'en_evaluacion';
  return 'no_apto';
}

function buildExplanation(countryName, score, strengths, weaknesses) {
  const s = strengths.slice(0, 2).join(' y ');
  const w = weaknesses.slice(0, 1).join('');
  return `${countryName} obtiene ${score.toFixed(0)}/100. Se destaca por ${s || 'sus indicadores comerciales'}. Requiere atención en ${w || 'datos incompletos'}.`;
}

module.exports = { minMaxNormalize, calcStatus, buildExplanation };
