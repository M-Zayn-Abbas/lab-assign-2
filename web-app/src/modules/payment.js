// COMPONENT: Payment Module (mock payment gateway)
const { db, nextId } = require('../db');
const { validateCard } = require('../utils/validators');

// Test cards: any Luhn-valid number succeeds, except this one which the "bank" declines.
const DECLINED_CARD = '4000000000000002';

function processPayment({ amount, cardNumber, expiry, cvv }) {
  if (typeof amount !== 'number' || amount <= 0) {
    return { ok: false, status: 400, errors: ['Amount must be a positive number'] };
  }
  const v = validateCard({ cardNumber, expiry, cvv });
  if (!v.valid) return { ok: false, status: 400, errors: v.errors };

  const digits = String(cardNumber).replace(/\s+/g, '');
  const success = digits !== DECLINED_CARD;
  const payment = {
    id: nextId('payment'),
    amount,
    last4: digits.slice(-4),
    status: success ? 'SUCCESS' : 'DECLINED',
    createdAt: new Date().toISOString(),
  };
  db.payments.push(payment);
  if (!success) return { ok: false, status: 402, errors: ['Payment declined by bank'], payment };
  return { ok: true, status: 200, payment };
}

module.exports = { processPayment, DECLINED_CARD };
