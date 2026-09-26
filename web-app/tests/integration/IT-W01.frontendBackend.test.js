const { suite } = require('../helpers/recorder');
const app = require('../../src/app');
const { seed } = require('../../src/db');
const { apiRequest } = require('../../public/api');

// A real HTTP server on a random port; the frontend API handler calls it with real fetch()
let server;
let base;
beforeAll((done) => {
  server = app.listen(0, () => {
    base = `http://127.0.0.1:${server.address().port}`;
    done();
  });
});
afterAll((done) => {
  server.close(() => done());
});

const ALI = { name: 'Ali Khan', email: 'ali@test.com', password: 'Secret123' };
async function loginAli() {
  await apiRequest(`${base}/api/register`, { method: 'POST', body: ALI });
  return (await apiRequest(`${base}/api/login`, { method: 'POST', body: ALI })).token;
}

suite(
  {
    level: 'integration', id: 'IT-W01', name: 'Frontend (API handler) <-> Backend REST API', uc: 'UC-W01..UC-W03',
    objective: 'Verify the frontend request handler and the Express backend exchange data correctly over real HTTP',
    pre: 'Express server started on random port; DB seeded with 3 products', steps: '1. Prepare state (see Preconditions)  2. Perform the actions listed in Test Data  3. Compare the output with Expected Result', beforeEach: seed,
    meta: {
      modules: 'public/api.js (apiRequest) + public/main.js  <->  src/app.js (Express routes) -> auth/products modules',
      strategy: 'Top-Down Integration: the top layer (frontend API handler) is tested first against the real backend routes; the DB is replaced by the seeded in-memory store (stub).',
      dataPassed: 'HTTP JSON requests (method, JSON body, Bearer token)  ->  JSON responses {ok, status, products|token|user|errors}',
    },
  },
  [
    {
      title: 'Frontend loads product list from backend', data: 'GET /api/products', priority: 'High',
      expectedText: 'status 200, 3 products (Wireless Mouse, Mechanical Keyboard, USB-C Cable)',
      run: () => apiRequest(`${base}/api/products`),
      actualText: (r) => `status ${r.status}, ${r.products.length} products (${r.products.map((p) => p.name).join(', ')})`,
      check: (r) => { expect(r.status).toBe(200); expect(r.products).toHaveLength(3); },
    },
    {
      title: 'Register + login through frontend returns a session token', data: 'POST /api/register {Ali}, POST /api/login', priority: 'High',
      expectedText: 'register 201; login 200 with 48-char token and user.name="Ali Khan"',
      run: async () => {
        const reg = await apiRequest(`${base}/api/register`, { method: 'POST', body: ALI });
        const log = await apiRequest(`${base}/api/login`, { method: 'POST', body: ALI });
        return { reg, log };
      },
      actualText: ({ reg, log }) => `register ${reg.status}; login ${log.status}, token length ${log.token.length}, user.name="${log.user.name}"`,
      check: ({ reg, log }) => { expect(reg.status).toBe(201); expect(log.status).toBe(200); expect(log.token).toHaveLength(48); },
    },
    {
      title: 'Backend validation errors reach the frontend unchanged', data: 'POST /api/register {email:"bad", password:"123"}',
      expectedText: 'status 400 with name, email and password error messages',
      run: () => apiRequest(`${base}/api/register`, { method: 'POST', body: { name: 'A', email: 'bad', password: '123' } }),
      actualText: (r) => `status ${r.status}, errors=${JSON.stringify(r.errors)}`,
      check: (r) => { expect(r.status).toBe(400); expect(r.errors).toContain('Invalid email format'); expect(r.errors).toContain('Name must be at least 2 characters'); },
    },
    {
      title: 'Protected endpoint without token is refused', data: 'POST /api/products (no token)', priority: 'High',
      expected: { status: 401, ok: false, errors: ['Unauthorized'] },
      run: () => apiRequest(`${base}/api/products`, { method: 'POST', body: { name: 'X', price: 1, stock: 1 } }),
    },
    {
      title: 'Product added via frontend appears in the list', data: 'login, POST /api/products {Monitor, 30000, 3}, GET /api/products?search=mon',
      expectedText: 'POST 201, search returns [Monitor]',
      run: async () => {
        const token = await loginAli();
        const add = await apiRequest(`${base}/api/products`, { method: 'POST', token, body: { name: 'Monitor', price: 30000, stock: 3 } });
        const list = await apiRequest(`${base}/api/products?search=mon`);
        return { add, list };
      },
      actualText: ({ add, list }) => `POST ${add.status}, search returns ${JSON.stringify(list.products.map((p) => p.name))}`,
      check: ({ add, list }) => { expect(add.status).toBe(201); expect(list.products.map((p) => p.name)).toEqual(['Monitor']); },
    },
  ]
);
