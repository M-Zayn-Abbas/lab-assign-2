const { suite } = require('../helpers/recorder');
const { db, reset } = require('../../src/db');
const auth = require('../../src/modules/auth');

const ALI = { name: 'Ali Khan', email: 'ali@test.com', password: 'Secret123' };

suite(
  {
    level: 'component', id: 'CT-W01', name: 'Authentication Module', uc: 'UC-W01 Register / UC-W02 Login',
    objective: 'Verify register + login + session handling work together inside the auth module',
    pre: 'In-memory DB reset before each test', steps: '1. Prepare state (see Preconditions)  2. Perform the actions listed in Test Data  3. Compare the output with Expected Result', beforeEach: reset,
    meta: {
      component: 'Authentication Module (src/modules/auth.js)',
      units: ['validateRegisterForm()', 'validateLoginForm()', 'hashPassword()', 'verifyPassword()', 'generateToken()', 'findUserByEmail() (DB check)', 'getUserByToken()'],
    },
  },
  [
    {
      title: 'Register a new valid user', data: JSON.stringify(ALI), priority: 'High',
      expectedText: 'status 201, returned user has id/name/email and NO passwordHash',
      run: () => auth.register(ALI),
      actualText: (r) => `status ${r.status}, user=${JSON.stringify(r.user)}`,
      check: (r) => { expect(r.status).toBe(201); expect(r.user).toEqual({ id: 1, name: 'Ali Khan', email: 'ali@test.com' }); },
    },
    {
      title: 'Registering an already used email is rejected', data: 'register ALI twice', priority: 'High',
      expected: { ok: false, status: 409, errors: ['Email already registered'] },
      run: () => { auth.register(ALI); return auth.register(ALI); },
    },
    {
      title: 'Duplicate check is case-insensitive', data: 'register ali@test.com, then ALI@TEST.COM',
      expected: { ok: false, status: 409, errors: ['Email already registered'] },
      run: () => { auth.register(ALI); return auth.register({ ...ALI, email: 'ALI@TEST.COM' }); },
    },
    {
      title: 'Password is stored hashed, never in plain text', data: 'register ALI then read db.users[0]', priority: 'High',
      expectedText: 'passwordHash != "Secret123" and has salt:hash format',
      run: () => { auth.register(ALI); return db.users[0].passwordHash; },
      actualText: (h) => `passwordHash="${h.slice(0, 20)}..." (length ${h.length})`,
      check: (h) => { expect(h).not.toBe('Secret123'); expect(h).toMatch(/^[0-9a-f]{32}:[0-9a-f]{64}$/); },
    },
    {
      title: 'Login with correct credentials returns token and session', data: 'register ALI, login ali@test.com / Secret123', priority: 'High',
      expectedText: 'status 200, 48-char token, getUserByToken(token) returns Ali',
      run: () => { auth.register(ALI); const r = auth.login({ email: ALI.email, password: ALI.password }); return { r, me: auth.getUserByToken(r.token) }; },
      actualText: ({ r, me }) => `status ${r.status}, token length ${r.token.length}, session user=${me.name}`,
      check: ({ r, me }) => { expect(r.status).toBe(200); expect(r.token).toHaveLength(48); expect(me.email).toBe('ali@test.com'); },
    },
    {
      title: 'Login with wrong password is rejected', data: 'login ali@test.com / Wrong1234', priority: 'High',
      expected: { ok: false, status: 401, errors: ['Invalid email or password'] },
      run: () => { auth.register(ALI); return auth.login({ email: ALI.email, password: 'Wrong1234' }); },
    },
    {
      title: 'Logout invalidates the session token', data: 'login, then logout(token), then getUserByToken(token)',
      expected: { loggedOut: true, userAfter: null },
      run: () => { auth.register(ALI); const { token } = auth.login(ALI); return { loggedOut: auth.logout(token), userAfter: auth.getUserByToken(token) }; },
    },
  ]
);
