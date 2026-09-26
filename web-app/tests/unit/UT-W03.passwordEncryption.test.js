const { suite, catchError } = require('../helpers/recorder');
const { hashPassword, verifyPassword } = require('../../src/utils/crypto');

suite(
  {
    level: 'unit', id: 'UT-W03', name: 'hashPassword() / verifyPassword() - Password encryption', uc: 'UC-W01 Register / UC-W02 Login',
    objective: 'Verify passwords are salted + hashed (PBKDF2-SHA256) and can be verified',
    pre: 'crypto.js module loaded', steps: '1. Call hashPassword / verifyPassword with test data  2. Inspect returned value',
  },
  [
    {
      title: 'Hash has format <32-hex salt>:<64-hex hash>', data: 'password="Secret123"', expectedText: 'matches /^[0-9a-f]{32}:[0-9a-f]{64}$/',
      run: () => hashPassword('Secret123'), check: (h) => expect(h).toMatch(/^[0-9a-f]{32}:[0-9a-f]{64}$/), priority: 'High',
    },
    {
      title: 'Same password hashed twice gives different hashes (random salt)', data: 'password="Secret123" x2', expectedText: 'hash1 !== hash2',
      run: () => [hashPassword('Secret123'), hashPassword('Secret123')], actualText: ([a, b]) => (a !== b ? 'hash1 !== hash2' : 'hash1 === hash2'),
      check: ([a, b]) => expect(a).not.toBe(b),
    },
    {
      title: 'Same password + same salt is deterministic', data: 'password="Secret123", salt="abc123"', expectedText: 'hash1 === hash2',
      run: () => [hashPassword('Secret123', 'abc123'), hashPassword('Secret123', 'abc123')], actualText: ([a, b]) => (a === b ? 'hash1 === hash2' : 'hash1 !== hash2'),
      check: ([a, b]) => expect(a).toBe(b),
    },
    {
      title: 'verifyPassword returns true for correct password', data: 'stored=hash("Secret123"), input="Secret123"', expected: true,
      run: () => verifyPassword('Secret123', hashPassword('Secret123')), priority: 'High',
    },
    {
      title: 'verifyPassword returns false for wrong password', data: 'stored=hash("Secret123"), input="secret123"', expected: false,
      run: () => verifyPassword('secret123', hashPassword('Secret123')), priority: 'High',
    },
    {
      title: 'Hashing an empty password throws an error', data: 'password=""', expected: 'throws: Password must be a non-empty string',
      run: catchError(() => hashPassword('')),
    },
    {
      title: 'verifyPassword with malformed stored hash returns false', data: 'stored="nohashhere", input="Secret123"', expected: false,
      run: () => verifyPassword('Secret123', 'nohashhere'), priority: 'Low',
    },
  ]
);
