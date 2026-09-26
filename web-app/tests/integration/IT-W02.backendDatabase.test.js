const request = require('supertest');
const { suite } = require('../helpers/recorder');
const app = require('../../src/app');
const { db, seed } = require('../../src/db');

async function registerAndLogin(email) {
  const u = { name: 'User', email, password: 'Secret123' };
  await request(app).post('/api/register').send(u);
  return (await request(app).post('/api/login').send(u)).body.token;
}
const CARD = { cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' };

suite(
  {
    level: 'integration', id: 'IT-W02', name: 'Backend API <-> Database', uc: 'UC-W01..UC-W05',
    objective: 'Verify that API calls read/write the correct records in the database tables',
    pre: 'DB seeded before each test; requests sent with supertest', steps: '1. Prepare state (see Preconditions)  2. Perform the actions listed in Test Data  3. Compare the output with Expected Result', beforeEach: seed,
    meta: {
      modules: 'src/app.js (routes)  ->  auth / products / orders modules  ->  src/db.js (users, sessions, products, orders tables)',
      strategy: 'Bottom-Up Integration: db.js and the modules were already verified (unit + component); now the Express routes are integrated on top and checked against the DB state.',
      dataPassed: 'Route params/JSON body -> module calls -> DB rows (users, sessions, products, orders); DB rows -> JSON responses',
    },
  },
  [
    {
      title: 'POST /api/register persists a user row with hashed password', data: '{name:"Sara", email:"sara@test.com", password:"Secret123"}', priority: 'High',
      expectedText: 'db.users has 1 row, email "sara@test.com", passwordHash != plain password',
      run: async () => { await request(app).post('/api/register').send({ name: 'Sara', email: 'sara@test.com', password: 'Secret123' }); return db.users; },
      actualText: (u) => `db.users rows=${u.length}, email="${u[0].email}", passwordHash starts "${u[0].passwordHash.slice(0, 12)}..."`,
      check: (u) => { expect(u).toHaveLength(1); expect(u[0].passwordHash).not.toBe('Secret123'); },
    },
    {
      title: 'Login creates a session row; logout deletes it', data: 'login -> check db.sessions -> POST /api/logout -> check db.sessions', priority: 'High',
      expected: { sessionsAfterLogin: 1, sessionsAfterLogout: 0 },
      run: async () => {
        const token = await registerAndLogin('a@test.com');
        const afterLogin = Object.keys(db.sessions).length;
        await request(app).post('/api/logout').set('Authorization', `Bearer ${token}`);
        return { sessionsAfterLogin: afterLogin, sessionsAfterLogout: Object.keys(db.sessions).length };
      },
    },
    {
      title: 'DELETE /api/products/:id removes the DB row', data: 'DELETE /api/products/2 then GET /api/products/2',
      expected: { deleteStatus: 200, rowsLeft: 2, getStatus: 404 },
      run: async () => {
        const token = await registerAndLogin('a@test.com');
        const del = await request(app).delete('/api/products/2').set('Authorization', `Bearer ${token}`);
        const get = await request(app).get('/api/products/2');
        return { deleteStatus: del.status, rowsLeft: db.products.length, getStatus: get.status };
      },
    },
    {
      title: 'GET /api/orders returns only the logged-in user\'s orders', data: 'user A orders 1 mouse, user B orders 1 cable; each calls GET /api/orders', priority: 'High',
      expected: { ordersInDb: 2, userA: ['Wireless Mouse'], userB: ['USB-C Cable'] },
      run: async () => {
        const a = await registerAndLogin('a@test.com');
        const b = await registerAndLogin('b@test.com');
        await request(app).post('/api/orders').set('Authorization', `Bearer ${a}`).send({ items: [{ productId: 1, qty: 1 }], card: CARD });
        await request(app).post('/api/orders').set('Authorization', `Bearer ${b}`).send({ items: [{ productId: 3, qty: 1 }], card: CARD });
        const ra = await request(app).get('/api/orders').set('Authorization', `Bearer ${a}`);
        const rb = await request(app).get('/api/orders').set('Authorization', `Bearer ${b}`);
        return { ordersInDb: db.orders.length, userA: ra.body.orders.map((o) => o.items[0].name), userB: rb.body.orders.map((o) => o.items[0].name) };
      },
    },
    {
      title: 'Registering the same email twice keeps only one DB row', data: 'POST /api/register x2 with "dup@test.com"',
      expected: { secondStatus: 409, rows: 1 },
      run: async () => {
        const u = { name: 'Dup', email: 'dup@test.com', password: 'Secret123' };
        await request(app).post('/api/register').send(u);
        const r = await request(app).post('/api/register').send(u);
        return { secondStatus: r.status, rows: db.users.length };
      },
    },
  ]
);
