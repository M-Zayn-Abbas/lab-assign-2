const { suite } = require('../helpers/recorder');
const { db, reset } = require('../../src/db');
const { processPayment } = require('../../src/modules/payment');

const CARD = { cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' };

suite(
  {
    level: 'component', id: 'CT-W03', name: 'Payment Module', uc: 'UC-W04 Checkout & Pay',
    objective: 'Verify the mock payment gateway validates cards, charges, declines and records payments',
    pre: 'In-memory DB reset before each test', steps: '1. Prepare state (see Preconditions)  2. Perform the actions listed in Test Data  3. Compare the output with Expected Result', beforeEach: reset,
    meta: {
      component: 'Payment Module (src/modules/payment.js)',
      units: ['validateCard()', 'luhnCheck()', 'processPayment()', 'payments table (db.payments)'],
    },
  },
  [
    {
      title: 'Valid card payment succeeds', data: 'amount=3000, card 4242...4242', priority: 'High',
      expectedText: 'ok=true, status 200, payment.status="SUCCESS", last4="4242"',
      run: () => processPayment({ amount: 3000, ...CARD }),
      actualText: (r) => `ok=${r.ok}, status ${r.status}, payment.status="${r.payment.status}", last4="${r.payment.last4}"`,
      check: (r) => { expect(r.status).toBe(200); expect(r.payment).toMatchObject({ status: 'SUCCESS', last4: '4242', amount: 3000 }); },
    },
    {
      title: 'Bank-declined card returns 402 and is recorded as DECLINED', data: 'amount=3000, card 4000000000000002', priority: 'High',
      expectedText: 'status 402, "Payment declined by bank", db.payments[0].status="DECLINED"',
      run: () => ({ r: processPayment({ amount: 3000, ...CARD, cardNumber: '4000000000000002' }), stored: db.payments[0] }),
      actualText: ({ r, stored }) => `status ${r.status}, ${JSON.stringify(r.errors)}, stored status="${stored.status}"`,
      check: ({ r, stored }) => { expect(r.status).toBe(402); expect(r.errors).toEqual(['Payment declined by bank']); expect(stored.status).toBe('DECLINED'); },
    },
    {
      title: 'Zero amount is rejected before contacting gateway', data: 'amount=0',
      expected: { ok: false, status: 400, errors: ['Amount must be a positive number'] },
      run: () => processPayment({ amount: 0, ...CARD }),
    },
    {
      title: 'Expired card is rejected and nothing is recorded', data: 'amount=500, expiry="01/21"',
      expected: { status: 400, errors: ['Card has expired'], paymentsStored: 0 },
      run: () => { const r = processPayment({ amount: 500, ...CARD, expiry: '01/21' }); return { status: r.status, errors: r.errors, paymentsStored: db.payments.length }; },
    },
    {
      title: 'Full card number is never stored (only last 4 digits)', data: 'successful payment, inspect db.payments[0]', priority: 'High',
      expectedText: 'stored keys = id, amount, last4, status, createdAt (no cardNumber / cvv)',
      run: () => { processPayment({ amount: 100, ...CARD }); return Object.keys(db.payments[0]); },
      check: (keys) => expect(keys).toEqual(['id', 'amount', 'last4', 'status', 'createdAt']),
    },
  ]
);
