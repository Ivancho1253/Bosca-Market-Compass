const assert = require('node:assert/strict');
const test = require('node:test');

const alertObserver = require('../src/observers/alertObserver');
const { checkCountry, THRESHOLDS } = require('../src/observers/thresholdChecker');

test('threshold constants document the business limits', () => {
  assert.equal(THRESHOLDS.INFLATION_HIGH.value, 10);
  assert.equal(THRESHOLDS.TARIFF_HIGH.value, 15);
  assert.equal(THRESHOLDS.SCORE_NO_APTO.score, 40);
  assert.equal(THRESHOLDS.SCORE_EN_EVALUACION.score, 70);
});

test('checkCountry notifies indicator and score alerts when thresholds are exceeded', () => {
  const events = [];
  const listener = {
    update(event, data) {
      events.push({ event, data });
    },
  };

  alertObserver.subscribe(listener);
  try {
    checkCountry({
      country: { id: 7, name: 'Chile' },
      indicators: [
        { code: 'inflacion_pct', value: '12.5' },
        { code: 'arancel_vino_pct', value: '20' },
      ],
      totalScore: 35,
    });
  } finally {
    alertObserver.unsubscribe(listener);
  }

  assert.deepEqual(events.map(e => e.event), [
    'THRESHOLD_EXCEEDED',
    'THRESHOLD_EXCEEDED',
    'SCORE_ALERT',
  ]);
  assert.equal(events[0].data.indicator, 'inflacion_pct');
  assert.equal(events[0].data.priority, 'alta');
  assert.equal(events[1].data.indicator, 'arancel_vino_pct');
  assert.equal(events[2].data.status, 'no_apto');
});

test('checkCountry emits medium score alert for markets under apto threshold', () => {
  const events = [];
  const listener = { update: (event, data) => events.push({ event, data }) };

  alertObserver.subscribe(listener);
  try {
    checkCountry({
      country: { id: 3, name: 'Peru' },
      indicators: [
        { code: 'inflacion_pct', value: '4' },
        { code: 'arancel_vino_pct', value: '8' },
      ],
      totalScore: 55,
    });
  } finally {
    alertObserver.unsubscribe(listener);
  }

  assert.equal(events.length, 1);
  assert.equal(events[0].event, 'SCORE_ALERT');
  assert.equal(events[0].data.priority, 'media');
  assert.equal(events[0].data.status, 'en_evaluacion');
});

test('checkCountry remains silent when all values are healthy', () => {
  const events = [];
  const listener = { update: (event, data) => events.push({ event, data }) };

  alertObserver.subscribe(listener);
  try {
    checkCountry({
      country: { id: 1, name: 'Argentina' },
      indicators: [
        { code: 'inflacion_pct', value: '3' },
        { code: 'arancel_vino_pct', value: '5' },
      ],
      totalScore: 82,
    });
  } finally {
    alertObserver.unsubscribe(listener);
  }

  assert.deepEqual(events, []);
});
