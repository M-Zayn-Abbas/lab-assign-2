// COMPONENT: Order Module (Cart total + Payment Gateway + Stock update)
const { db, nextId } = require('../db');
const products = require('./products');
const payment = require('./payment');

// UNIT: cart total calculator (applies 10% discount on totals above 10,000)
function calculateTotal(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const discount = subtotal > 10000 ? subtotal * 0.1 : 0;
  return Math.round((subtotal - discount) * 100) / 100;
}

function createOrder(userId, { items, card }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, status: 400, errors: ['Cart is empty'] };
  }
  // Resolve items against product DB
  const lines = [];
  for (const it of items) {
    const p = products.getProduct(it.productId);
    const qty = Number(it.qty);
    if (!p) return { ok: false, status: 404, errors: [`Product ${it.productId} not found`] };
    if (!Number.isInteger(qty) || qty <= 0) return { ok: false, status: 400, errors: ['Quantity must be a positive integer'] };
    if (qty > p.stock) return { ok: false, status: 409, errors: [`Insufficient stock for ${p.name}`] };
    lines.push({ productId: p.id, name: p.name, price: p.price, qty });
  }

  const total = calculateTotal(lines);
  const pay = payment.processPayment({ amount: total, ...card });
  if (!pay.ok) return { ok: false, status: pay.status, errors: pay.errors };

  lines.forEach((l) => products.reduceStock(l.productId, l.qty));
  const order = {
    id: nextId('order'),
    userId,
    items: lines,
    total,
    paymentId: pay.payment.id,
    status: 'PAID',
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  return { ok: true, status: 201, order };
}

function getOrdersForUser(userId) {
  return db.orders.filter((o) => o.userId === userId);
}

module.exports = { calculateTotal, createOrder, getOrdersForUser };
