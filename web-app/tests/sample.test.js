// Sample tests showing one example of each level. Add your own test cases alongside this file.
const request = require('supertest');
const app = require('../src/app');
const { reset, seed } = require('../src/db');
const { validateEmail } = require('../src/utils/validators');
const auth = require('../src/modules/auth');

beforeEach(() => seed());

describe('Unit: validateEmail', () => {
  test('accepts a valid email', () => expect(validateEmail('ali@test.com')).toBe(true));
  test('rejects email without @', () => expect(validateEmail('alitest.com')).toBe(false));
});

describe('Component: Authentication module', () => {
  test('register then login returns a token', () => {
    reset();
    auth.register({ name: 'Ali', email: 'ali@test.com', password: 'Secret123' });
    const res = auth.login({ email: 'ali@test.com', password: 'Secret123' });
    expect(res.ok).toBe(true);
    expect(res.token).toHaveLength(48);
  });
});

describe('Integration: Frontend API -> Backend -> DB', () => {
  test('full flow: register, login, place order', async () => {
    await request(app).post('/api/register').send({ name: 'Ali', email: 'ali@test.com', password: 'Secret123' }).expect(201);
    const login = await request(app).post('/api/login').send({ email: 'ali@test.com', password: 'Secret123' }).expect(200);
    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ items: [{ productId: 1, qty: 2 }], card: { cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' } })
      .expect(201);
    expect(order.body.order.total).toBe(3000);
    const product = await request(app).get('/api/products/1');
    expect(product.body.product.stock).toBe(8);
  });
});
