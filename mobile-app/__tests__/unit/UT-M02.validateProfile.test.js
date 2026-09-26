const { suite } = require('../../test-helpers/recorder');
import { validateProfile } from '../../src/utils/validation';

suite(
  {
    level: 'unit', id: 'UT-M02', name: 'validateProfile() - Profile form validation', uc: 'UC-M03 Manage Profile',
    objective: 'Verify profile name, age (1-120 integer) and Pakistani phone format validation',
    pre: 'validation.js module loaded', steps: '1. Call validateProfile({name, age, phone})  2. Compare {valid, errors} with expected',
    fn: validateProfile,
  },
  [
    { title: 'Valid profile passes', args: [{ name: 'Ali', age: '22', phone: '03001234567' }], expected: { valid: true, errors: {} }, priority: 'High' },
    { title: 'One-letter name is rejected', args: [{ name: 'A', age: '22', phone: '03001234567' }], expected: { valid: false, errors: { name: 'Name must be at least 2 characters' } } },
    { title: 'Age above 120 is rejected (boundary)', args: [{ name: 'Ali', age: '121', phone: '03001234567' }], expected: { valid: false, errors: { age: 'Age must be a whole number between 1 and 120' } }, priority: 'High' },
    { title: 'Decimal age is rejected', args: [{ name: 'Ali', age: '22.5', phone: '03001234567' }], expected: { valid: false, errors: { age: 'Age must be a whole number between 1 and 120' } } },
    { title: 'International format +92 phone is accepted', args: [{ name: 'Ali', age: '22', phone: '+923001234567' }], expected: { valid: true, errors: {} } },
    { title: 'Phone with dashes is accepted', args: [{ name: 'Ali', age: '22', phone: '0300-1234567' }], expected: { valid: true, errors: {} }, priority: 'Low' },
    { title: 'Short phone number is rejected', args: [{ name: 'Ali', age: '22', phone: '12345' }], expected: { valid: false, errors: { phone: 'Phone must be like 03001234567 or +923001234567' } }, priority: 'High' },
  ]
);
