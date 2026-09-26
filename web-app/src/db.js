// Simple in-memory "database". Call reset() between tests for a clean state.
const db = {
  users: [],
  sessions: {}, // token -> userId
  products: [],
  orders: [],
  payments: [],
  counters: { user: 0, product: 0, order: 0, payment: 0 },
};

function nextId(table) {
  db.counters[table] += 1;
  return db.counters[table];
}

function reset() {
  db.users = [];
  db.sessions = {};
  db.products = [];
  db.orders = [];
  db.payments = [];
  db.counters = { user: 0, product: 0, order: 0, payment: 0 };
}

function seed() {
  reset();
  db.products.push(
    { id: nextId('product'), name: 'Wireless Mouse', price: 1500, stock: 10 },
    { id: nextId('product'), name: 'Mechanical Keyboard', price: 6500, stock: 5 },
    { id: nextId('product'), name: 'USB-C Cable', price: 450, stock: 50 }
  );
}

module.exports = { db, nextId, reset, seed };
