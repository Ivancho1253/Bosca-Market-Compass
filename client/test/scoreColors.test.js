import assert from 'node:assert/strict';
import test from 'node:test';

import {
  priorityBadge,
  priorityColor,
  scoreToColor,
  statusColor,
  statusLabel,
} from '../src/utils/scoreColors.js';

test('status helpers map known statuses to labels and Tailwind classes', () => {
  assert.equal(statusLabel('apto'), 'Apto');
  assert.equal(statusLabel('en_evaluacion'), 'En evaluaci\u00f3n');
  assert.equal(statusLabel('no_apto'), 'No apto');
  assert.match(statusColor('apto'), /green/);
  assert.match(statusColor('en_evaluacion'), /amber/);
  assert.match(statusColor('no_apto'), /red/);
});

test('scoreToColor follows the same thresholds as the backend status model', () => {
  assert.equal(scoreToColor(70), '#16a34a');
  assert.equal(scoreToColor(40), '#d97706');
  assert.equal(scoreToColor(39.9), '#dc2626');
});

test('priority helpers expose visual variants for alert priority', () => {
  assert.match(priorityColor('alta'), /red/);
  assert.match(priorityColor('media'), /amber/);
  assert.match(priorityColor('baja'), /blue/);
  assert.match(priorityBadge('alta'), /red/);
  assert.match(priorityBadge('media'), /amber/);
  assert.match(priorityBadge('baja'), /blue/);
});
