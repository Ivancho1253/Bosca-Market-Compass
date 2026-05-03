import assert from 'node:assert/strict';
import test from 'node:test';

import { fmtNum, fmtPct, fmtPop, fmtScore, fmtUSD } from '../src/utils/formatters.js';

test('fmtUSD formats nulls, millions and billions for market values', () => {
  assert.equal(fmtUSD(null), '\u2014');
  assert.equal(fmtUSD(2500000000), 'USD 2.5B');
  assert.equal(fmtUSD(12500000), 'USD 13M');
  assert.equal(fmtUSD(9500), 'USD 9.500');
});

test('fmtPct and fmtScore keep stable decimal precision', () => {
  assert.equal(fmtPct(12.345), '12.3%');
  assert.equal(fmtPct(12.345, 2), '12.35%');
  assert.equal(fmtPct(null), '\u2014');
  assert.equal(fmtScore(72), '72.0');
  assert.equal(fmtScore(undefined), '\u2014');
});

test('fmtNum and fmtPop format compact population values', () => {
  assert.equal(fmtNum(1234567), '1.234.567');
  assert.equal(fmtNum(null), '\u2014');
  assert.equal(fmtPop(40000000), '40M');
  assert.equal(fmtPop(1500000000), '1.50B');
  assert.equal(fmtPop(null), '\u2014');
});
