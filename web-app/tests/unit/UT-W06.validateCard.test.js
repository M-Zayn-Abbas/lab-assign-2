const { suite } = require('../helpers/recorder');
const { validateCard } = require('../../src/utils/validators');

suite(
  {
    level: 'unit', id: 'UT-W06', name: 'validateCard() - Payment card validation (Luhn)', uc: 'UC-W04 Checkout & Pay',
    objective: 'Verify card number (Luhn), expiry (MM/YY, not expired) and CVV validation',
    pre: 'validators.js module loaded; system date 2026', steps: '1. Call validateCard({cardNumber, expiry, cvv})  2. Compare {valid, errors} with expected',
    fn: validateCard,
  },
  [
    { title: 'Valid Visa test card passes', args: [{ cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' }], expected: { valid: true, errors: [] }, priority: 'High' },
    { title: 'Card number failing Luhn check is rejected', args: [{ cardNumber: '4242424242424241', expiry: '12/30', cvv: '123' }], expected: { valid: false, errors: ['Invalid card number'] }, priority: 'High' },
    { title: 'Expired card is rejected', args: [{ cardNumber: '4242424242424242', expiry: '01/20', cvv: '123' }], expected: { valid: false, errors: ['Card has expired'] }, priority: 'High' },
    { title: 'Invalid expiry month (13) is rejected', args: [{ cardNumber: '4242424242424242', expiry: '13/30', cvv: '123' }], expected: { valid: false, errors: ['Expiry must be MM/YY'] } },
    { title: 'Non-numeric CVV is rejected', args: [{ cardNumber: '4242424242424242', expiry: '12/30', cvv: 'ab1' }], expected: { valid: false, errors: ['CVV must be 3 or 4 digits'] } },
    { title: 'Card number with spaces is accepted', args: [{ cardNumber: '4242 4242 4242 4242', expiry: '12/30', cvv: '123' }], expected: { valid: true, errors: [] }, priority: 'Low' },
  ]
);
