const { suite } = require('../helpers/recorder');
const { calculateTotal } = require('../../src/modules/orders');

suite(
  {
    level: 'unit', id: 'UT-W07', name: 'calculateTotal() - Cart total with discount', uc: 'UC-W04 Checkout & Pay',
    objective: 'Verify cart total = sum(price x qty), with 10% discount when subtotal > 10,000',
    pre: 'orders.js module loaded', steps: '1. Call calculateTotal(items)  2. Compare returned total with expected',
    fn: calculateTotal,
  },
  [
    { title: 'Empty cart total is 0', args: [[]], expected: 0 },
    { title: 'Single line total is price x qty', args: [[{ price: 1500, qty: 2 }]], expected: 3000, priority: 'High' },
    { title: 'Subtotal exactly 10,000 gets no discount (boundary)', args: [[{ price: 5000, qty: 2 }]], expected: 10000, priority: 'High' },
    { title: 'Subtotal above 10,000 gets 10% discount', args: [[{ price: 6500, qty: 2 }]], expected: 11700, priority: 'High' },
    { title: 'Decimal prices are rounded to 2 places', args: [[{ price: 99.99, qty: 3 }]], expected: 299.97 },
    { title: 'Invalid input (null) returns 0', args: [null], expected: 0, priority: 'Low' },
  ]
);
