// Patrón Observer — Notifica automáticamente cuando un indicador supera umbrales definidos
const alertObserver = require('./alertObserver');

const THRESHOLDS = {
  INFLATION_HIGH:       { indicator: 'inflacion_pct',      value: 10,  operator: 'gt', priority: 'alta'  },
  TARIFF_HIGH:          { indicator: 'arancel_vino_pct',   value: 15,  operator: 'gt', priority: 'alta'  },
  SCORE_NO_APTO:        { score: 40, operator: 'lt', priority: 'alta',  status: 'no_apto'       },
  SCORE_EN_EVALUACION:  { score: 70, operator: 'lt', priority: 'media', status: 'en_evaluacion' },
};

function checkCountry({ country, indicators, totalScore }) {
  const inflation = indicators.find(v => v.code === 'inflacion_pct');
  const tariff    = indicators.find(v => v.code === 'arancel_vino_pct');

  if (inflation && parseFloat(inflation.value) > THRESHOLDS.INFLATION_HIGH.value) {
    alertObserver.notify('THRESHOLD_EXCEEDED', {
      countryId:   country.id,
      countryName: country.name,
      indicator:   'inflacion_pct',
      value:       parseFloat(inflation.value),
      threshold:   THRESHOLDS.INFLATION_HIGH.value,
      priority:    'alta',
    });
  }

  if (tariff && parseFloat(tariff.value) > THRESHOLDS.TARIFF_HIGH.value) {
    alertObserver.notify('THRESHOLD_EXCEEDED', {
      countryId:   country.id,
      countryName: country.name,
      indicator:   'arancel_vino_pct',
      value:       parseFloat(tariff.value),
      threshold:   THRESHOLDS.TARIFF_HIGH.value,
      priority:    'alta',
    });
  }

  if (totalScore < THRESHOLDS.SCORE_NO_APTO.score) {
    alertObserver.notify('SCORE_ALERT', {
      countryId:   country.id,
      countryName: country.name,
      score:       totalScore,
      priority:    'alta',
      status:      'no_apto',
    });
  } else if (totalScore < THRESHOLDS.SCORE_EN_EVALUACION.score) {
    alertObserver.notify('SCORE_ALERT', {
      countryId:   country.id,
      countryName: country.name,
      score:       totalScore,
      priority:    'media',
      status:      'en_evaluacion',
    });
  }
}

module.exports = { checkCountry, THRESHOLDS };
