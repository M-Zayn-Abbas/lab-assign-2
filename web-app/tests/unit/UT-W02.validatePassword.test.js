const { suite } = require('../helpers/recorder');
const { validatePassword } = require('../../src/utils/validators');

suite(
  {
    level: 'unit', id: 'UT-W02', name: 'validatePassword() - Password strength checker', uc: 'UC-W01 Register',
    objective: 'Verify password rules: min 8 chars, 1 uppercase, 1 lowercase, 1 digit',
    pre: 'validators.js module loaded', steps: '1. Call validatePassword(input)  2. Compare {valid, errors} with expected',
    fn: validatePassword,
  },
  [
    { title: 'Strong password is valid', args: ['Secret123'], expected: { valid: true, errors: [] }, priority: 'High' },
    { title: 'Password shorter than 8 chars is rejected', args: ['Sec1a'], expected: { valid: false, errors: ['Password must be at least 8 characters'] }, priority: 'High' },
    { title: 'Password without uppercase is rejected', args: ['secret123'], expected: { valid: false, errors: ['Password must contain an uppercase letter'] } },
    { title: 'Password without lowercase is rejected', args: ['SECRET123'], expected: { valid: false, errors: ['Password must contain a lowercase letter'] } },
    { title: 'Password without digit is rejected', args: ['SecretPass'], expected: { valid: false, errors: ['Password must contain a digit'] } },
    { title: 'Empty password is rejected as required', args: [''], expected: { valid: false, errors: ['Password is required'] }, priority: 'High' },
  ]
);
