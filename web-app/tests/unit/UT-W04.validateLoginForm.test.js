const { suite } = require('../helpers/recorder');
const { validateLoginForm } = require('../../src/utils/validators');

suite(
  {
    level: 'unit', id: 'UT-W04', name: 'validateLoginForm() - Login validation', uc: 'UC-W02 Login',
    objective: 'Verify login form validation reports the correct error messages',
    pre: 'validators.js module loaded', steps: '1. Call validateLoginForm({email, password})  2. Compare {valid, errors} with expected',
    fn: validateLoginForm,
  },
  [
    { title: 'Valid email and password pass validation', args: [{ email: 'ali@test.com', password: 'Secret123' }], expected: { valid: true, errors: [] }, priority: 'High' },
    { title: 'Empty email reports "Email is required"', args: [{ email: '', password: 'Secret123' }], expected: { valid: false, errors: ['Email is required'] }, priority: 'High' },
    { title: 'Malformed email reports "Invalid email format"', args: [{ email: 'ali@', password: 'Secret123' }], expected: { valid: false, errors: ['Invalid email format'] } },
    { title: 'Empty password reports "Password is required"', args: [{ email: 'ali@test.com', password: '' }], expected: { valid: false, errors: ['Password is required'] }, priority: 'High' },
    { title: 'Both fields empty report both errors', args: [{ email: '', password: '' }], expected: { valid: false, errors: ['Email is required', 'Password is required'] } },
    { title: 'Missing argument object is handled', data: 'undefined', args: [], expected: { valid: false, errors: ['Email is required', 'Password is required'] }, priority: 'Low' },
  ]
);
