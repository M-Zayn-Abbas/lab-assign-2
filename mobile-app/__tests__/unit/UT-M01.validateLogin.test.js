const { suite } = require('../../test-helpers/recorder');
import { validateLogin } from '../../src/utils/validation';

suite(
  {
    level: 'unit', id: 'UT-M01', name: 'validateLogin() - Login input validation', uc: 'UC-M01 Login',
    objective: 'Verify login inputs are validated with field-specific error messages',
    pre: 'validation.js module loaded', steps: '1. Call validateLogin(email, password)  2. Compare {valid, errors} with expected',
    fn: validateLogin,
  },
  [
    { title: 'Valid email and password pass', args: ['ali@test.com', 'ali123'], expected: { valid: true, errors: {} }, priority: 'High' },
    { title: 'Empty email reports "Email is required"', args: ['', 'ali123'], expected: { valid: false, errors: { email: 'Email is required' } }, priority: 'High' },
    { title: 'Whitespace-only email treated as empty', args: ['   ', 'ali123'], expected: { valid: false, errors: { email: 'Email is required' } } },
    { title: 'Malformed email reports "Invalid email format"', args: ['ali.test.com', 'ali123'], expected: { valid: false, errors: { email: 'Invalid email format' } } },
    { title: 'Password shorter than 6 chars is rejected', args: ['ali@test.com', '123'], expected: { valid: false, errors: { password: 'Password must be at least 6 characters' } }, priority: 'High' },
    { title: 'Both fields empty report both errors', args: ['', ''], expected: { valid: false, errors: { email: 'Email is required', password: 'Password is required' } } },
  ]
);
