const assert = require('node:assert/strict');
const test = require('node:test');

const { minMaxNormalize, calcStatus, buildExplanation } = require('../src/utils/normalize');

test('minMaxNormalize scores higher-is-better values on a 0-100 scale', () => {
  assert.equal(minMaxNormalize(75, 50, 100, 'higher_is_better'), 50);
  assert.equal(minMaxNormalize(100, 50, 100, 'higher_is_better'), 100);
  assert.equal(minMaxNormalize(25, 50, 100, 'higher_is_better'), 0);
});

test('minMaxNormalize reverses lower-is-better values', () => {
  assert.equal(minMaxNormalize(50, 0, 100, 'lower_is_better'), 50);
  assert.equal(minMaxNormalize(0, 0, 100, 'lower_is_better'), 100);
  assert.equal(minMaxNormalize(125, 0, 100, 'lower_is_better'), 0);
});

test('minMaxNormalize handles missing, invalid and flat ranges', () => {
  assert.equal(minMaxNormalize(null, 0, 100, 'higher_is_better'), 0);
  assert.equal(minMaxNormalize(undefined, 0, 100, 'higher_is_better'), 0);
  assert.equal(minMaxNormalize('abc', 0, 100, 'higher_is_better'), 0);
  assert.equal(minMaxNormalize(20, 20, 20, 'higher_is_better'), 50);
});

test('calcStatus maps score thresholds to market status', () => {
  assert.equal(calcStatus(70), 'apto');
  assert.equal(calcStatus(69.99), 'en_evaluacion');
  assert.equal(calcStatus(40), 'en_evaluacion');
  assert.equal(calcStatus(39.99), 'no_apto');
});

test('buildExplanation includes country, rounded score and fallback text', () => {
  const detailed = buildExplanation('Brasil', 72.6, ['demanda', 'logistica'], ['riesgo']);
  assert.match(detailed, /Brasil obtiene 73\/100/);
  assert.match(detailed, /demanda y logistica/);
  assert.match(detailed, /riesgo/);

  const fallback = buildExplanation('Uruguay', 55, [], []);
  assert.match(fallback, /sus indicadores comerciales/);
  assert.match(fallback, /datos incompletos/);
});
