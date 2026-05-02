// Patrón Observer — Notifica automáticamente cuando un indicador supera umbrales definidos
const alertRepo = require('../repositories/alert.repository');

const TITLES = {
  inflacion_pct:    (name) => `Inflación elevada en ${name}`,
  arancel_vino_pct: (name) => `Arancel vino alto en ${name}`,
};

const MESSAGES = {
  inflacion_pct:    (name, value, threshold) =>
    `La inflación en ${name} supera el ${threshold}% (${value.toFixed(1)}%). Riesgo macroeconómico alto.`,
  arancel_vino_pct: (name, value, threshold) =>
    `El arancel para vino en ${name} es ${value.toFixed(1)}%, lo que puede reducir la competitividad.`,
};

const alertHandler = {
  update(event, data) {
    if (event === 'THRESHOLD_EXCEEDED') {
      const { countryId, countryName, indicator, value, threshold, priority } = data;
      alertRepo.create({
        countryId,
        title:    (TITLES[indicator]   || ((n) => `Umbral superado en ${n}`))(countryName),
        message:  (MESSAGES[indicator] || ((n) => `Indicador ${indicator} supera el umbral definido en ${n}.`))(countryName, value, threshold),
        priority,
        type: 'score_alert',
      }).catch(console.error);
    }

    if (event === 'SCORE_ALERT') {
      const { countryId, countryName, score, priority, status } = data;
      const isNoApto = status === 'no_apto';
      alertRepo.create({
        countryId,
        title:   isNoApto
          ? `Mercado no apto: ${countryName}`
          : `${countryName} en evaluación`,
        message: isNoApto
          ? `${countryName} tiene un índice de atractivo de ${score.toFixed(0)}/100, por debajo del umbral mínimo.`
          : `${countryName} tiene un índice de ${score.toFixed(0)}/100. Requiere análisis adicional.`,
        priority,
        type: 'score_alert',
      }).catch(console.error);
    }
  },
};

module.exports = alertHandler;
