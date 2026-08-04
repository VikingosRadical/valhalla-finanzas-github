const test = require('node:test');
const assert = require('node:assert/strict');

global.window = global;
require('../assets/js/data.js');
require('../assets/js/finance.js');

const { createInitialState } = globalThis.VALHALLA.data;
const { calculateDashboard, validateMovement, addMovement } = globalThis.VALHALLA.finance;

test('calculateDashboard returns expected projection and available amount', () => {
  const state = createInitialState();
  state.profile.initial_cash = 200000;
  state.movements.push({ id: 'm1', type: 'income', amount: 50000, category: 'sueldo', date: '2026-08-05', description: 'Sueldo', segment: 'personal' });
  state.movements.push({ id: 'm2', type: 'expense', amount: 30000, category: 'supermercado', date: '2026-08-04', description: 'Super', segment: 'personal' });

  const dashboard = calculateDashboard(state, new Date('2026-08-15'));

  assert.equal(dashboard.incomesReceived, 50000);
  assert.equal(dashboard.expensesMade, 30000);
  assert.equal(dashboard.pendingCommitments, 0);
  assert.equal(dashboard.realAvailable, 220000);
});

test('validateMovement rejects negative amounts, empty dates and duplicates', () => {
  const state = createInitialState();
  const valid = {
    type: 'expense',
    amount: 10000,
    category: 'Monster',
    date: '2026-08-04',
    description: 'Monster',
    segment: 'personal'
  };

  assert.equal(validateMovement(state, valid).valid, true);
  assert.equal(validateMovement(state, { ...valid, amount: -1 }).valid, false);
  assert.equal(validateMovement(state, { ...valid, date: '' }).valid, false);

  addMovement(state, valid);
  assert.equal(validateMovement(state, valid).valid, false);
});
