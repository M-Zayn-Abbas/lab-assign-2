// Backend API (Express). Exported without listen() so supertest can use it.
const path = require('path');
const express = require('express');
const auth = require('./modules/auth');
const products = require('./modules/products');
const orders = require('./modules/orders');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function send(res, result) {
  const { status, ok, ...body } = result;
  res.status(status).json({ ok, ...body });
}

// Auth middleware
function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = auth.getUserByToken(token);
  if (!user) return res.status(401).json({ ok: false, errors: ['Unauthorized'] });
  req.user = user;
  req.token = token;
  next();
}

// ---- Auth ----
app.post('/api/register', (req, res) => send(res, auth.register(req.body || {})));
app.post('/api/login', (req, res) => send(res, auth.login(req.body || {})));
app.post('/api/logout', requireAuth, (req, res) => {
  auth.logout(req.token);
  res.json({ ok: true });
});
app.get('/api/me', requireAuth, (req, res) => res.json({ ok: true, user: req.user }));

// ---- Products ----
app.get('/api/products', (req, res) => res.json({ ok: true, products: products.listProducts(req.query.search) }));
app.get('/api/products/:id', (req, res) => {
  const p = products.getProduct(req.params.id);
  if (!p) return res.status(404).json({ ok: false, errors: ['Product not found'] });
  res.json({ ok: true, product: p });
});
app.post('/api/products', requireAuth, (req, res) => send(res, products.addProduct(req.body || {})));
app.delete('/api/products/:id', requireAuth, (req, res) => send(res, products.deleteProduct(req.params.id)));

// ---- Orders / Payment ----
app.post('/api/orders', requireAuth, (req, res) => send(res, orders.createOrder(req.user.id, req.body || {})));
app.get('/api/orders', requireAuth, (req, res) => res.json({ ok: true, orders: orders.getOrdersForUser(req.user.id) }));

module.exports = app;
