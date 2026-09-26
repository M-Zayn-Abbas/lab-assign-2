const request = require('supertest');
const { suite } = require('../helpers/recorder');
const app = require('../../src/app');
const { db, seed } = require('../../src/db');

const CARD = { cardNumber: '4242424242424242', expiry: '12/30', cvv: '123' };
const DECLINED = { ...CARD, cardNumber: '4000000000000002' };

async function token() {
  const u = { name: 'Ali', email: 'ali@test.com', password: 'Secret123' };
  await request(app).post('/api/register').send(u);
  return (await request(app).post('/api/login').send(u)).body.token;
}
async function order(items, card = CARD) {
  const t = await token();
  const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${t}`).send({ items, card });
  return { status: res.status, body: res.body, orders: db.orders.length, payments: db.payments.map((p) => p.status), stock: db.products.map((p) => p.stock) };
}

suite(
  {
    level: 'integration', id: 'IT-W03', name: 'Payment Gateway <-> Order Module', uc: 'UC-W04 Checkout & Pay',
    objective: 'Verify the order module charges through the payment gateway and only updates stock/orders when payment succeeds',
    pre: 'DB seeded (stock: Mouse=10, Keyboard=5, Cable=50); user logged in', steps: 'POST /api/orders with items + card', beforeEach: seed,
    meta: {
      modules: 'Order Module (orders.js: createOrder, calculateTotal)  <->  Payment Module (payment.js: processPayment)  <->  Product Module (reduceStock)',
      strategy: 'Incremental Integration: Product module + Order module were combined first, then the Payment gateway was added and the combined flow re-tested.',
      dataPassed: 'Order -> Payment: {amount = calculated total, cardNumber, expiry, cvv};  Payment -> Order: {ok, payment.id, status};  Order -> Product: (productId, qty) for stock reduction',
    },
  },
  [
    {
      title: 'Successful payment creates PAID order and reduces stock', data: 'items=[{productId:1, qty:2}], card 4242...', priority: 'High',
      expectedText: 'status 201, total 3000, order PAID, payment SUCCESS, Mouse stock 10 -> 8',
      run: () => order([{ productId: 1, qty: 2 }]),
      actualText: (r) => `status ${r.status}, total ${r.body.order.total}, order ${r.body.order.status}, payments ${JSON.stringify(r.payments)}, stock ${JSON.stringify(r.stock)}`,
      check: (r) => { expect(r.status).toBe(201); expect(r.body.order.total).toBe(3000); expect(r.stock[0]).toBe(8); },
    },
    {
      title: 'Declined payment creates no order and keeps stock', data: 'items=[{productId:1, qty:2}], card 4000000000000002', priority: 'High',
      expectedText: 'status 402, 0 orders, payment DECLINED, stock unchanged [10,5,50]',
      run: () => order([{ productId: 1, qty: 2 }], DECLINED),
      actualText: (r) => `status ${r.status}, orders ${r.orders}, payments ${JSON.stringify(r.payments)}, stock ${JSON.stringify(r.stock)}`,
      check: (r) => { expect(r.status).toBe(402); expect(r.orders).toBe(0); expect(r.stock).toEqual([10, 5, 50]); },
    },
    {
      title: 'Discounted total (>10,000) is what the gateway charges', data: 'items=[{productId:2, qty:2}] (2 x 6500 = 13000)',
      expectedText: 'order.total = 11700 and payment amount = 11700',
      run: async () => { const r = await order([{ productId: 2, qty: 2 }]); return { total: r.body.order.total, charged: db.payments[0].amount }; },
      check: (r) => expect(r).toEqual({ total: 11700, charged: 11700 }),
    },
    {
      title: 'Insufficient stock is detected before charging the card', data: 'items=[{productId:2, qty:6}] (stock 5)',
      expectedText: 'status 409, no payment recorded, stock unchanged',
      run: () => order([{ productId: 2, qty: 6 }]),
      actualText: (r) => `status ${r.status}, ${JSON.stringify(r.body.errors)}, payments ${JSON.stringify(r.payments)}, stock ${JSON.stringify(r.stock)}`,
      check: (r) => { expect(r.status).toBe(409); expect(r.payments).toEqual([]); },
    },
    {
      title: 'Same product in two cart lines exceeding stock is refused without charging', data: 'items=[{productId:1, qty:6},{productId:1, qty:6}] (stock 10)', priority: 'High',
      expectedText: 'status 409 "Insufficient stock", no payment recorded, stock stays 10',
      run: () => order([{ productId: 1, qty: 6 }, { productId: 1, qty: 6 }]),
      actualText: (r) => `status ${r.status}, orders ${r.orders}, payments ${JSON.stringify(r.payments)}, Mouse stock ${r.stock[0]}`,
      check: (r) => { expect(r.status).toBe(409); expect(r.payments).toEqual([]); expect(r.stock[0]).toBe(10); },
    },
  ]
);
